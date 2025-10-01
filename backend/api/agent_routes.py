import json
import logging
from fastapi import (
    APIRouter,
    WebSocket,
    Depends,
    HTTPException,
    status,
    Body,
    WebSocketDisconnect,
)
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from .connection_manager import manager
from config.database import get_session
from .models import Server, Metric
from config.jwt import jwt_auth

router = APIRouter()


@router.websocket("/ws/frontend/{token}")
async def frontend_websocket_endpoint(websocket: WebSocket, token: str):
    try:
        user_id_str = jwt_auth.get_current_user(token)
        user_id = int(user_id_str)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect_frontend(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_frontend(websocket, user_id)


@router.websocket("/ws/metrics/{api_key}")
async def agent_websocket_endpoint(
    websocket: WebSocket,
    api_key: str,
    session: AsyncSession = Depends(get_session),
):
    server_query = await session.exec(select(Server).where(Server.api_key == api_key))
    server = server_query.one_or_none()

    if not server:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect_agent(websocket, server.id)

    if not server.is_verified:
        server.is_verified = True
        session.add(server)
        await session.commit()

    await manager.send_to_user(
        server.owner_id, {"type": "AGENT_CONNECTED", "serverId": server.id}
    )

    try:
        while True:
            data_text = await websocket.receive_text()
            message = json.loads(data_text)
            print(message)

            message_type = message.get("type")
            data = message.get("data", {})

            if message_type == "metrics":
                updated_metrics_obj = []
                for metric_update in data.get("metrics", []):
                    q = await session.exec(
                        select(Metric).where(
                            Metric.server_id == server.id,
                            Metric.name == metric_update["name"],
                        )
                    )
                    metric = q.one_or_none()
                    if metric:
                        metric.current_level = metric_update["level"]
                        metric.total = metric_update.get("total", 0)
                        session.add(metric)
                        updated_metrics_obj.append(metric)
                    else:
                        new_metric = Metric(
                            name=metric_update["name"],
                            current_level=metric_update["level"],
                            total=metric_update.get("total", 0),
                            warning_level=80.0,  # Default warning level
                            server_id=server.id,
                        )
                        session.add(new_metric)
                        updated_metrics_obj.append(new_metric)

                if "top_processes" in data:
                    server.top_five_processes = json.dumps(data["top_processes"])
                    session.add(server)

                await session.commit()

                updated_metrics = [
                    m.model_dump(mode="json", exclude="created_at")
                    for m in updated_metrics_obj
                ]

                # Diffuser la mise à jour au propriétaire du serveur
                update_payload = {
                    "type": "METRICS_UPDATE",
                    "serverId": server.id,
                    "metrics": updated_metrics,
                    "top_five_processes": server.top_five_processes,
                }
                await manager.send_to_user(server.owner_id, update_payload)

            elif message_type == "kill_result":
                await manager.send_to_user(server.owner_id, message)
    except Exception as e:
        logging.error(f"Erreur survenue pour le serveur {server.id}: {e}")
    finally:
        manager.disconnect_agent(server.id)
        logging.info(f"Agent pour le serveur {server.id} déconnecté.")


@router.post("/server/{server_id}/kill-process", status_code=status.HTTP_202_ACCEPTED)
async def kill_process(
    server_id: int,
    pid: int = Body(..., embed=True),
    user_id: str = Depends(jwt_auth.get_current_user),
    session: AsyncSession = Depends(get_session),
):
    user_id_int = int(user_id)

    server_query = await session.exec(
        select(Server).where(Server.id == server_id, Server.owner_id == user_id_int)
    )
    server = server_query.one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serveur non trouvé ou permissions insuffisantes.",
        )

    if server.id not in manager.agent_connections:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'agent pour ce serveur n'est pas connecté.",
        )

    command = {"action": "kill", "pid": pid}
    res = await manager.send_to_agent(command, server.id)
    print(res)

    return {"message": f"Commande pour tuer le processus {pid} envoyée."}
