"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addHistory,
  clearCommand,
  clearHistory,
  selectCommand,
  selectHistory,
  setCommandType,
} from "@/redux/uiSlice";
import { AppDispatch } from "@/redux/store";
import { UserLoginData } from "@/utils/types";
import { addHistoryLine } from "@/utils/helpes";
import { authenticate } from "@/services/auth";
import AuthHistories from "@/components/AuthHistories";

export default function LoginPage() {
  const dispatch: AppDispatch = useDispatch();
  const command = useSelector(selectCommand);
  const history = useSelector(selectHistory);

  const [workflow, setWorkflow] = useState<{
    step: string;
    data: Partial<UserLoginData>;
  }>({
    step: "login-email",
    data: {},
  });
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(clearHistory());
    dispatch(addHistory(addHistoryLine("Starting login process...")));
    dispatch(addHistory(addHistoryLine("Enter your email or username:")));
  }, [dispatch]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!command?.text) return;

    const handleCommand = async () => {
      switch (workflow.step) {
        case "login-email":
          setWorkflow({
            step: "login-password",
            data: { ...workflow.data, username: command.text as string },
          });
          dispatch(setCommandType("password"));
          dispatch(addHistory(addHistoryLine("Enter your password:")));
          break;
        case "login-password":
          const res: true | number | null = await authenticate(
            { ...workflow.data, password: command.text as string } as UserLoginData,
            "login",
          );
          console.log("res", res);
          if (res === 401) {
            dispatch(addHistory(addHistoryLine("Invalid username or password.")));
            break;
          }
          if (res === 422) {
            dispatch(
              addHistory(addHistoryLine("Password is too short, min 8 characters.")),
            );
            break;
          }
          if (!res) {
            dispatch(addHistory(addHistoryLine("An error occurred. Please try again.")));
            break;
          }
          dispatch(setCommandType("text"));
          dispatch(addHistory(addHistoryLine("Login successful! Redirecting...")));
          // setTimeout(() => (window.location.href = "/account"), 5000);
          setWorkflow({ step: "done", data: {} });
          break;
        default:
          break;
      }
      dispatch(clearCommand());
    };

    handleCommand();
  }, [command, dispatch, workflow]);

  return <AuthHistories history={history} />;
}
