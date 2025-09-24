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

    const handleCommand = () => {
      switch (workflow.step) {
        case "login-email":
          setWorkflow({
            step: "login-password",
            data: { ...workflow.data, email: command.text as string },
          });
          dispatch(setCommandType("password"));
          dispatch(addHistory(addHistoryLine("Enter your password:")));
          break;
        case "login-password":
          dispatch(setCommandType("text"));
          dispatch(addHistory(addHistoryLine("Login successful! Redirecting...")));
          setTimeout(() => (window.location.href = "/"), 2000);
          setWorkflow({ step: "done", data: {} });
          break;
        default:
          break;
      }
      dispatch(clearCommand());
    };

    handleCommand();
  }, [command, dispatch, workflow]);

  return (
    <main className="h-full font-mono text-sm text-green-400">
      <div className="h-full overflow-y-auto pr-2">
        {history.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {line.isUserInput ? (
              <>
                <span className="mr-2 text-gray-400">{`>`}</span>
                <span>
                  {line.type === "password" ? "*".repeat(line.text.length) : line.text}
                </span>
              </>
            ) : (
              <>
                <span className="mr-2 text-gray-400">{`[${line.timestamp}]>`}</span>
                <span>{line.text}</span>
              </>
            )}
          </motion.p>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </main>
  );
}
