import os
from dotenv import load_dotenv

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import auth_routes, server_routes, metric_routes, agent_routes

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGins"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api")
app.include_router(server_routes.router, prefix="/api")
app.include_router(metric_routes.router, prefix="/api")
app.include_router(agent_routes.router, prefix="/api")
