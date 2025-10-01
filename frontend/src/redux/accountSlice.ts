"use client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Metric, Server, UserData } from "@/utils/types";
import api from "@/services/api";

interface AccountState {
  user: UserData | null;
  servers: Server[];
  selectedServer: Server | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  user: null,
  servers: [],
  selectedServer: null,
  loading: false,
  error: null,
};

export const fetchServers = createAsyncThunk(
  "account/fetchServers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/servers");
      return response.data as Server[];
    } catch (error) {
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        error.response?.data?.detail || error.message || "Failed to fetch servers.";
      return rejectWithValue(errorMessage);
    }
  },
);

export const addServer = createAsyncThunk(
  "account/addServer",
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/server", { name });
      return response.data as Server;
    } catch (error) {
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        error.response?.data?.detail || error.message || "Failed to add server.";
      return rejectWithValue(errorMessage);
    }
  },
);

export const killProcess = createAsyncThunk(
  "account/killProcess",
  async ({ serverId, pid }: { serverId: number; pid: number }, { rejectWithValue }) => {
    try {
      await api.post(`/server/${serverId}/kill-process`, { pid });
      return { serverId, pid }; // Return serverId and pid for potential UI updates
    } catch (error) {
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        error.response?.data?.detail || error.message || "Failed to kill process.";
      return rejectWithValue(errorMessage);
    }
  },
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    selectServer: (state, action: PayloadAction<number>) => {
      state.selectedServer = state.servers.find((s) => s.id === action.payload) || null;
    },
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
    },
    updateMetrics: (
      state,
      action: PayloadAction<{
        serverId: number;
        metrics: Metric[];
        top_five_processes: string;
      }>,
    ) => {
      const { serverId, metrics: incomingMetrics, top_five_processes } = action.payload;

      const serverIndex = state.servers.findIndex((s) => s.id === serverId);
      if (serverIndex === -1) return;

      const oldServer = state.servers[serverIndex];

      const newMetrics = oldServer.metrics.map((metric) => {
        const incoming = incomingMetrics.find((im) => im.name === metric.name);
        if (!incoming) return metric;

        const newHistory = [...(metric.history || [])];
        newHistory.push({ time: Date.now(), level: incoming.current_level });
        if (newHistory.length > 60) newHistory.shift();

        return {
          ...metric,
          current_level: incoming.current_level,
          history: newHistory,
        };
      });

      incomingMetrics.forEach((incoming) => {
        if (!newMetrics.some((m) => m.name === incoming.name)) {
          newMetrics.push({
            ...incoming,
            history: [{ time: Date.now(), level: incoming.current_level }],
          });
        }
      });

      const newServer: Server = {
        ...oldServer,
        top_five_processes: top_five_processes,
        metrics: newMetrics,
      };

      state.servers[serverIndex] = newServer;

      if (state.selectedServer?.id === serverId) {
        state.selectedServer = newServer;
      }
    },
    updateServerStatus: (
      state,
      action: PayloadAction<{ serverId: number; is_verified: boolean }>,
    ) => {
      const { serverId, is_verified } = action.payload;
      const serverIndex = state.servers.findIndex((s) => s.id === serverId);
      if (serverIndex !== -1) {
        state.servers[serverIndex].is_verified = is_verified;
      }
      if (state.selectedServer?.id === serverId) {
        state.selectedServer.is_verified = is_verified;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServers.fulfilled, (state, action: PayloadAction<Server[]>) => {
        state.loading = false;
        state.servers = action.payload.map((server) => ({
          ...server,
          metrics: server.metrics.map((metric) => ({
            ...metric,
            history: [],
          })),
        }));
      })
      .addCase(addServer.fulfilled, (state, action) => {
        state.servers.push(action.payload);
      })
      .addCase(addServer.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(killProcess.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { selectServer, setUser, updateMetrics, updateServerStatus } =
  accountSlice.actions;
export default accountSlice.reducer;
