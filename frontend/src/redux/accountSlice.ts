"use client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Server, UserData } from "@/utils/types";
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
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(addServer.fulfilled, (state, action) => {
        state.servers.push(action.payload);
      })
      .addCase(addServer.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { selectServer, setUser } = accountSlice.actions;
export default accountSlice.reducer;
