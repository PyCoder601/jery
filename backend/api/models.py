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


class Server(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str = Field(nullable=False)
    api_key: str = Field(nullable=False)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    owner_id: int = Field(foreign_key="user.id", nullable=False)
    owner: Optional[User] = Relationship(back_populates="servers")
