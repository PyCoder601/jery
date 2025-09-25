"use client";
import React, { useState, useEffect } from "react";
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
import { UserSignupData } from "@/utils/types";
import { addHistoryLine } from "@/utils/helpes";
import { authenticate } from "@/services/auth";
import AuthHistories from "@/components/AuthHistories";

export default function SignupPage() {
  const dispatch: AppDispatch = useDispatch();
  const command = useSelector(selectCommand);
  const history = useSelector(selectHistory);
  console.log(history);

  const [workflow, setWorkflow] = useState<{
    step: string;
    data: Partial<UserSignupData>;
  }>({
    step: "signup-email",
    data: {},
  });

  useEffect(() => {
    dispatch(clearHistory());
    dispatch(setCommandType("text"));
    dispatch(addHistory(addHistoryLine("Starting account creation...")));
    dispatch(addHistory(addHistoryLine("Enter your email address:")));
  }, [dispatch]);

  useEffect(() => {
    if (!command?.text) return;

    const handleCommand = async () => {
      switch (workflow.step) {
        case "signup-email":
          setWorkflow({
            step: "signup-username",
            data: { ...workflow.data, email: command.text as string },
          });
          dispatch(addHistory(addHistoryLine("Enter your desired username:")));
          break;
        case "signup-username":
          setWorkflow({
            step: "signup-password",
            data: { ...workflow.data, username: command.text as string },
          });
          dispatch(setCommandType("password"));
          dispatch(addHistory(addHistoryLine("Enter your password:")));
          break;
        case "signup-password":
          setWorkflow({
            step: "signup-confirm-password",
            data: { ...workflow.data, password: command.text as string },
          });
          dispatch(addHistory(addHistoryLine("Confirm your password:")));
          break;
        case "signup-confirm-password":
          if (command.text === workflow.data.password) {
            const res: true | number | null = await authenticate(
              workflow.data as UserSignupData,
              "signup",
            );
            if (res === 400) {
              dispatch(addHistory(addHistoryLine("Email or username already exists.")));
              setTimeout(() => window.location.reload(), 2000);
              break;
            }
            if (res === 422) {
              dispatch(
                addHistory(addHistoryLine("Password is too short, min 8 characters.")),
              );
              break;
            }
            if (!res) {
              dispatch(
                addHistory(addHistoryLine("An error occurred. Please try again.")),
              );
              setTimeout(() => window.location.reload(), 2000);
              break;
            }
            dispatch(
              addHistory(addHistoryLine("Account created successfully! Redirecting...")),
            );
            setTimeout(() => (window.location.href = "/account"), 2000);
          } else {
            dispatch(setCommandType("text"));
            dispatch(
              addHistory(addHistoryLine("Passwords do not match. Please start over.")),
            );
            setTimeout(() => window.location.reload(), 5000);
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

  return <AuthHistories history={history} />;
}
