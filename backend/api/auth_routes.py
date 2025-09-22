from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, or_
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette.responses import JSONResponse

from .helpers import hash_password, verify_password
from .models import User
from .schemas import (
    UserSignupRequestData,
    UserLoginResponseData,
    UserLoginRequestData,
)
from config.database import get_session
from config.jwt import jwt_auth

router = APIRouter()


@router.post("/user-signup", response_model=UserLoginResponseData)
async def user_signup(
    data: UserSignupRequestData, async_session: AsyncSession = Depends(get_session)
):
    existing_user = await async_session.exec(
        select(User).where(
            or_(User.username == data.username, User.email == data.email)
        )
    )

    is_existing_user = existing_user.one_or_none()

    if is_existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email or username already exists."
        )

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )

    async_session.add(new_user)
    await async_session.commit()
    await async_session.refresh(new_user)

    access_token = jwt_auth.create_access_token(user_id=new_user.id)

    refresh_token = jwt_auth.create_refresh_token(user_id=new_user.id)

    response = JSONResponse(
        content={"access_token": access_token, "user": new_user},
        status_code=201,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        max_age=3600 * 24,
    )

    return response


@router.post("/user-login", response_model=UserLoginResponseData)
async def user_login(
    data: UserLoginRequestData, async_session: AsyncSession = Depends(get_session)
):
    user = await async_session.exec(select(User).where(User.username == data.username))

    is_user = user.one_or_none()

    if not is_user:
        raise HTTPException(status_code=400, detail="User not found.")

    if not verify_password(data.password, is_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password.")

    access_token = jwt_auth.create_access_token(user_id=is_user.id)

    refresh_token = jwt_auth.create_refresh_token(user_id=is_user.id)

    response = JSONResponse(
        content={"access_token": access_token, "user": is_user},
        status_code=200,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        max_age=3600 * 24,
    )

    return response


@router.post("/user-refresh-token")
def user_refresh_token(new_tokens: dict = Depends(jwt_auth.refresh_token)):
    response = JSONResponse(content=new_tokens, status_code=200)

    response.set_cookie(
        key="refresh_token",
        value=new_tokens["refresh_token"],
        httponly=True,
        samesite="strict",
        max_age=3600 * 24,
    )
    return response
