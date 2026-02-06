"use client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Metric, Server, UserData } from "@/utils/types";
import api from "@/services/api";
import type { RootState } from "./store";

// Types
interface AccountState {
  user: UserData | null;
  servers: Server[];
  selectedServer: Server | null;
  loading: boolean;
  error: string | null;
  operationLoading: {
    fetchServers: boolean;
    addServer: boolean;
    deleteServer: boolean;
    killProcess: boolean;
  };
}

interface SerializedError {
  message: string;
  code?: string;
}

// État initial
const initialState: AccountState = {
  user: null,
  servers: [],
  selectedServer: null,
  loading: false,
  error: null,
  operationLoading: {
    fetchServers: false,
    addServer: false,
    deleteServer: false,
    killProcess: false,
  },
};

// Helper pour extraire les messages d'erreur
const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((error as any)?.response?.data?.detail) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error as any).response.data.detail;
  }
  return "Une erreur inattendue s'est produite";
};

// Thunks async
export const fetchServers = createAsyncThunk<
  Server[],
  void,
  { rejectValue: SerializedError }
>("account/fetchServers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/servers");
    return response.data as Server[];
  } catch (error) {
    return rejectWithValue({
      message: getErrorMessage(error),
    });
  }
});

export const addServer = createAsyncThunk<
  Server,
  string,
  { rejectValue: SerializedError }
>("account/addServer", async (name, { rejectWithValue }) => {
  try {
    const response = await api.post("/server", { name });
    return response.data as Server;
  } catch (error) {
    return rejectWithValue({
      message: getErrorMessage(error),
    });
  }
});

export const deleteServer = createAsyncThunk<
  number,
  number,
  { rejectValue: SerializedError }
>("account/deleteServer", async (serverId, { rejectWithValue }) => {
  try {
    await api.delete(`/server/${serverId}`);
    return serverId;
  } catch (error) {
    return rejectWithValue({
      message: getErrorMessage(error),
    });
  }
});

export const killProcess = createAsyncThunk<
  { serverId: number; pid: number },
  { serverId: number; pid: number },
  { rejectValue: SerializedError }
>("account/killProcess", async ({ serverId, pid }, { rejectWithValue }) => {
  try {
    await api.post(`/server/${serverId}/kill-process`, { pid });
    return { serverId, pid };
  } catch (error) {
    return rejectWithValue({
      message: getErrorMessage(error),
    });
  }
});

// Slice
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
    logout: (state) => {
      state.user = null;
      state.servers = [];
      state.selectedServer = null;
      state.error = null;
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
    // Fetch servers
    builder
      .addCase(fetchServers.pending, (state) => {
        state.operationLoading.fetchServers = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.operationLoading.fetchServers = false;
        state.loading = false;
        state.servers = action.payload.map((server) => ({
          ...server,
          metrics: server.metrics.map((metric) => ({
            ...metric,
            history: [],
          })),
        }));
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.operationLoading.fetchServers = false;
        state.loading = false;
        state.error = action.payload?.message || "Échec du chargement des serveurs";
      })
      // Add server
      .addCase(addServer.pending, (state) => {
        state.operationLoading.addServer = true;
        state.error = null;
      })
      .addCase(addServer.fulfilled, (state, action) => {
        state.operationLoading.addServer = false;
        state.servers.push({
          ...action.payload,
          metrics: action.payload.metrics.map((metric) => ({
            ...metric,
            history: [],
          })),
        });
      })
      .addCase(addServer.rejected, (state, action) => {
        state.operationLoading.addServer = false;
        state.error = action.payload?.message || "Échec de l'ajout du serveur";
      })
      // Delete server
      .addCase(deleteServer.pending, (state) => {
        state.operationLoading.deleteServer = true;
        state.error = null;
      })
      .addCase(deleteServer.fulfilled, (state, action) => {
        state.operationLoading.deleteServer = false;
        state.servers = state.servers.filter((s) => s.id !== action.payload);
        if (state.selectedServer?.id === action.payload) {
          state.selectedServer = null;
        }
      })
      .addCase(deleteServer.rejected, (state, action) => {
        state.operationLoading.deleteServer = false;
        state.error = action.payload?.message || "Échec de la suppression du serveur";
      })
      // Kill process
      .addCase(killProcess.pending, (state) => {
        state.operationLoading.killProcess = true;
        state.error = null;
      })
      .addCase(killProcess.fulfilled, (state) => {
        state.operationLoading.killProcess = false;
      })
      .addCase(killProcess.rejected, (state, action) => {
        state.operationLoading.killProcess = false;
        state.error = action.payload?.message || "Échec de l'arrêt du processus";
      });
  },
});

// Actions
export const { selectServer, setUser, updateMetrics, updateServerStatus, logout } =
  accountSlice.actions;

export default accountSlice.reducer;

// Sélecteurs de base
export const selectServers = (state: RootState) => state.account.servers;
export const selectSelectedServer = (state: RootState) => state.account.selectedServer;
export const selectLoading = (state: RootState) => state.account.loading;
export const selectError = (state: RootState) => state.account.error;
