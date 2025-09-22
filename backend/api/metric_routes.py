from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.api.models import Server, Metric
from backend.api.schemas import MetricData, MetricRequestData
from backend.config.database import get_session
from backend.config.jwt import jwt_auth

router = APIRouter()


async def _get_server_if_owner(
    server_id: int, user_id: int, session: AsyncSession
) -> Server:
    """Helper function to get a server and verify ownership."""
    query = select(Server).where(Server.id == server_id, Server.owner_id == user_id)
    result = await session.exec(query)
    server = result.one_or_none()
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found or you do not have permission to access it.",
        )
    return server


@router.post(
    "/server/{server_id}/metric",
    response_model=MetricData,
    status_code=status.HTTP_201_CREATED,
)
async def create_metric(
    server_id: int,
    data: MetricRequestData,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    await _get_server_if_owner(server_id, user_id, async_session)

    new_metric = Metric(
        name=data.name,
        warning_level=data.warning_level,
        server_id=server_id,
    )

    async_session.add(new_metric)
    await async_session.commit()
    await async_session.refresh(new_metric)

    return new_metric


@router.get("/server/{server_id}/metrics", response_model=List[MetricData])
async def get_metrics_for_server(
    server_id: int,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    server = await _get_server_if_owner(server_id, user_id, async_session)
    return server.metrics


@router.get("/metric/{metric_id}", response_model=MetricData)
async def get_metric(
    metric_id: int,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    query = (
        select(Metric)
        .join(Server)
        .where(Metric.id == metric_id, Server.owner_id == user_id)
    )
    result = await async_session.exec(query)
    metric = result.one_or_none()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found"
        )
    return metric


@router.patch("/metric/{metric_id}", response_model=MetricData)
async def update_metric(
    metric_id: int,
    data: MetricRequestData,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    query = (
        select(Metric)
        .join(Server)
        .where(Metric.id == metric_id, Server.owner_id == user_id)
    )
    result = await async_session.exec(query)
    metric = result.one_or_none()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found"
        )

    if data.name:
        metric.name = data.name
    if data.warning_level:
        metric.warning_level = data.warning_level

    async_session.add(metric)
    await async_session.commit()
    await async_session.refresh(metric)
    return metric


@router.delete("/metric/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metric(
    metric_id: int,
    user_id: str = Depends(jwt_auth.get_current_user),
    async_session: AsyncSession = Depends(get_session),
):
    user_id = int(user_id)
    query = (
        select(Metric)
        .join(Server)
        .where(Metric.id == metric_id, Server.owner_id == user_id)
    )
    result = await async_session.exec(query)
    metric = result.one_or_none()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Metric not found"
        )

    await async_session.delete(metric)
    await async_session.commit()
    return None
