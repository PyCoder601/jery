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
} from "@/redux/uiSlice";
import { AppDispatch } from "@/redux/store";
import { UserSignupData } from "@/utils/types";

const addHistoryLine = (text: string, isUserInput = false) => ({
  text,
  isUserInput,
  timestamp: new Date().toLocaleTimeString(),
});

export default function SignupPage() {
  const dispatch: AppDispatch = useDispatch();
  const command = useSelector(selectCommand);
  const history = useSelector(selectHistory);

  const [workflow, setWorkflow] = useState<{
    step: string;
    data: Partial<UserSignupData>;
  }>({
    step: "signup-email",
    data: {},
  });
  const [isPassword, setIsPassword] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(clearHistory());
    dispatch(addHistory(addHistoryLine("Starting account creation...")));
    dispatch(addHistory(addHistoryLine("Enter your email address:")));
  }, [dispatch]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!command) return;

    const handleCommand = () => {
      switch (workflow.step) {
        case "signup-email":
          setWorkflow({
            step: "signup-username",
            data: { ...workflow.data, email: command },
          });
          dispatch(addHistory(addHistoryLine("Enter your desired username:")));
          break;
        case "signup-username":
          setWorkflow({
            step: "signup-password",
            data: { ...workflow.data, username: command },
          });
          setIsPassword(true);
          dispatch(addHistory(addHistoryLine("Enter your password:")));
          break;
        case "signup-password":
          setWorkflow({
            step: "signup-confirm-password",
            data: { ...workflow.data, password: command },
          });
          dispatch(addHistory(addHistoryLine("Confirm your password:")));
          break;
        case "signup-confirm-password":
          setIsPassword(false);
          if (command === workflow.data.password) {
            dispatch(
              addHistory(addHistoryLine("Account created successfully! Redirecting...")),
            );
            // In a real app, you'd make an API call here and then redirect.
            setTimeout(() => (window.location.href = "/"), 2000);
          } else {
            dispatch(
              addHistory(addHistoryLine("Passwords do not match. Please start over.")),
            );
            setTimeout(() => window.location.reload(), 2000);
          }
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
                <span>{line.text}</span>
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
