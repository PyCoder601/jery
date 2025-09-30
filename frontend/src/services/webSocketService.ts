import { store } from "@/redux/store";
import { updateMetrics, updateServerStatus } from "@/redux/accountSlice";

let socket: WebSocket | null = null;

const getWebSocketURL = (token: string): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";
  const wsUrl = apiUrl.replace(/^http/, "ws");
  return `${wsUrl}/ws/frontend/${token}`;
};

export const initWebSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  const url = getWebSocketURL(token);
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message);
    switch (message.type) {
      case "METRICS_UPDATE":
        store.dispatch(updateMetrics(message));
        break;
      case "AGENT_CONNECTED":
        store.dispatch(
          updateServerStatus({
            serverId: message.serverId,
            is_verified: true,
          }),
        );
        break;
      default:
        break;
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    socket = null;
  };

  socket.onerror = (error) => {
    console.log("WebSocket error:", error);
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
};
