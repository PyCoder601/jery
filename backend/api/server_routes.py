from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from .helpers import generate_api_key
from .models import Server
from .schemas import ServerRequestData, ServerData
from config.database import get_session
from config.jwt import jwt_auth

router = APIRouter()


@router.post("/server", response_model=ServerData, status_code=status.HTTP_201_CREATED)
async def create_server(
    data: ServerRequestData,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    api_key = generate_api_key()

    new_server = Server(name=data.name, api_key=api_key, owner_id=user_id)

    async_session.add(new_server)
    await async_session.commit()
    await async_session.refresh(new_server)

    return new_server


@router.get("/servers", response_model=List[ServerData])
async def get_servers(
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)

    result = await async_session.exec(
        select(Server)
        .where(Server.owner_id == user_id)
        .options(selectinload(Server.metrics))  # type: ignore
    )
    servers = result.all()
    return servers


@router.get("/server/{server_id}", response_model=ServerData)
async def get_server(
    server_id: int,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)

    result = await async_session.exec(
        select(Server)
        .where(Server.id == server_id, Server.owner_id == user_id)
        .options(selectinload(Server.metrics))  # type: ignore
    )
    server = result.one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Server not found"
        )
    if server.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this server",
        )
    return server


@router.delete("/server/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_server(
    server_id: int,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    query = select(Server).where(Server.id == server_id, Server.owner_id == user_id)
    result = await async_session.exec(query)
    server = result.one_or_none()

    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Server not found"
        )
    if server.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this server",
        )

    await async_session.delete(server)
    await async_session.commit()
    return None
