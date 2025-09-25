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
      return (await api.get("/servers")) as Server[];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addServer = createAsyncThunk(
  "account/addServer",
  async (name: string, { rejectWithValue }) => {
    try {
      return (await api.post("/server", { name })) as Server;
    } catch (error) {
      return rejectWithValue(error);
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
      });
  },
});

export const { selectServer, setUser } = accountSlice.actions;
export default accountSlice.reducer;
