from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str = Field(unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_mail_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    servers: list["Server"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Server(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str = Field(nullable=False)
    api_key: str = Field(nullable=False)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    owner_id: int = Field(foreign_key="user.id", nullable=False)
    owner: Optional[User] = Relationship(back_populates="servers")

    metrics: list["Metric"] = Relationship(
        back_populates="server",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Metric(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str = Field(nullable=False)
    current_level: float = Field(nullable=False)
    warning_level: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.now)

    server_id: int = Field(foreign_key="server.id", nullable=False)
    server: Optional[Server] = Relationship(back_populates="metrics")
