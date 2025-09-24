"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HistoryLine, UiState } from "@/utils/types";

const initialState: UiState = {
  inputValue: "",
  command: { type: "text", text: null },
  history: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.inputValue = action.payload;
    },
    setCommand: (state, action: PayloadAction<string>) => {
      console.log("Clearing command", state.command);
      state.command.text = action.payload;
    },
    clearCommand: (state) => {
      state.command.text = null;
    },
    setCommandType: (state, action: PayloadAction<"text" | "password">) => {
      state.command.type = action.payload;
    },
    addHistory: (state, action: PayloadAction<HistoryLine>) => {
      state.history.push(action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  setInputValue,
  setCommand,
  clearCommand,
  addHistory,
  clearHistory,
  setCommandType,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectInputValue = (state: { ui: UiState }) => state.ui.inputValue;
export const selectCommand = (state: { ui: UiState }) => state.ui.command;
export const selectHistory = (state: { ui: UiState }) => state.ui.history;
