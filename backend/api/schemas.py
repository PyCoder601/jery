from typing import Optional

from pydantic import BaseModel, Field


class UserData(BaseModel):
    id: int
    username: str
    email: str
    is_mail_verified: bool
    created_at: str


class UserLoginResponseData(BaseModel):
    user_data: UserData
    access_token: str


class UserLoginRequestData(BaseModel):
    username: str
    password: str = Field(min_length=8)


class UserSignupRequestData(UserLoginRequestData):
    email: str


class ServerData(BaseModel):
    id: int
    name: str
    api_key: str
    is_verified: bool
    created_at: str
    owner_id: int
    top_five_processes: Optional[str] = None
    metrics: list["MetricData"] = []


class ServerRequestData(BaseModel):
    name: str


class MetricData(BaseModel):
    id: int
    name: str
    current_level: float
    warning_level: float
    created_at: str


class MetricRequestData(BaseModel):
    name: Optional[str] = None
    warning_level: Optional[float] = None


class EmailCheckRequest(BaseModel):
    email: str


class UsernameCheckRequest(BaseModel):
    username: str
