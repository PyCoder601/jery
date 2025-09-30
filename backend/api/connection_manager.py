from fastapi import WebSocket
import logging
from collections import defaultdict


class ConnectionManager:
    def __init__(self):
        self.agent_connections: dict[int, WebSocket] = {}
        self.frontend_connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect_agent(self, websocket: WebSocket, server_id: int):
        await websocket.accept()
        self.agent_connections[server_id] = websocket
        logging.info(f"Agent connecté pour le serveur ID: {server_id}")

    def disconnect_agent(self, server_id: int):
        if server_id in self.agent_connections:
            del self.agent_connections[server_id]
            logging.info(f"Agent déconnecté pour le serveur ID: {server_id}")

    async def connect_frontend(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.frontend_connections[user_id].append(websocket)

    def disconnect_frontend(self, websocket: WebSocket, user_id: int):
        if user_id in self.frontend_connections:
            self.frontend_connections[user_id].remove(websocket)
            if not self.frontend_connections[user_id]:
                del self.frontend_connections[user_id]

    async def send_to_agent(self, message, server_id: int):
        if server_id in self.agent_connections:
            websocket = self.agent_connections[server_id]
            await websocket.send_json(message)

    async def send_to_user(self, user_id: int, message):
        if user_id in self.frontend_connections:
            for connection in self.frontend_connections[user_id]:
                await connection.send_json(message)


manager = ConnectionManager()
