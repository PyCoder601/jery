"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addHistory,
  clearCommand,
  clearHistory,
  selectCommand,
  selectHistory,
  setCommandType,
} from "@/redux/uiSlice";
import { UserSignupData } from "@/utils/types";
import { addHistoryLine } from "@/utils/helpes";
import { authenticate, checkEmail, checkUsername } from "@/services/auth";
import AuthHistories from "@/components/AuthHistories";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const command = useAppSelector(selectCommand);
  const history = useAppSelector(selectHistory);

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

    if (command.text === "/login") {
      dispatch(addHistory(addHistoryLine("Redirecting to login...")));
      dispatch(clearCommand());
      window.location.href = "/login";
      return;
    }

    const handleCommand = async () => {
      switch (workflow.step) {
        case "signup-email":
          const emailExists = await checkEmail(command.text as string);
          if (emailExists) {
            dispatch(addHistory(addHistoryLine("This email is already taken.")));
            dispatch(
              addHistory(addHistoryLine("Please enter a different email address:")),
            );
          } else {
            setWorkflow({
              step: "signup-username",
              data: { ...workflow.data, email: command.text as string },
            });
            dispatch(addHistory(addHistoryLine("Enter your desired username:")));
          }
          break;
        case "signup-username":
          const usernameExists = await checkUsername(command.text as string);
          if (usernameExists) {
            dispatch(addHistory(addHistoryLine("This username is already taken.")));
            dispatch(addHistory(addHistoryLine("Please enter a different username:")));
          } else {
            setWorkflow({
              step: "signup-password",
              data: { ...workflow.data, username: command.text as string },
            });
            dispatch(setCommandType("password"));
            dispatch(
              addHistory(addHistoryLine("Enter your password (min 8 characters):")),
            );
          }
          break;
        case "signup-password":
          if ((command.text as string).length < 8) {
            dispatch(
              addHistory(addHistoryLine("Password must be at least 8 characters long.")),
            );
            dispatch(addHistory(addHistoryLine("Please enter a new password:")));
          } else {
            setWorkflow({
              step: "signup-confirm-password",
              data: { ...workflow.data, password: command.text as string },
            });
            dispatch(addHistory(addHistoryLine("Confirm your password:")));
          }
          break;
        case "signup-confirm-password":
          if (command.text !== workflow.data.password) {
            dispatch(addHistory(addHistoryLine("Passwords do not match.")));
            setWorkflow((prev) => ({
              ...prev,
              step: "signup-password",
              data: { ...prev.data, password: "" },
            }));
            dispatch(setCommandType("password"));
            dispatch(addHistory(addHistoryLine("Enter your password:")));
            break;
          }

          const res: true | number | null = await authenticate(
            workflow.data as UserSignupData,
            "signup",
          );

          if (res === true) {
            dispatch(setCommandType("text"));
            dispatch(
              addHistory(addHistoryLine("Account created successfully! Redirecting...")),
            );
            window.location.href = "/account";
            setWorkflow({ step: "done", data: {} });
            break;
          }

          if (res === 400) {
            dispatch(addHistory(addHistoryLine("Email or username already exists.")));
            dispatch(addHistory(addHistoryLine("Please start over.")));
            setWorkflow({
              step: "signup-email",
              data: {},
            });
            dispatch(setCommandType("text"));
            dispatch(addHistory(addHistoryLine("Enter your email address:")));
            break;
          }

          if (res === 422) {
            dispatch(
              addHistory(addHistoryLine("Password is too short, min 8 characters.")),
            );
            setWorkflow((prev) => ({
              ...prev,
              step: "signup-password",
              data: { ...prev.data, password: "" },
            }));
            dispatch(setCommandType("password"));
            dispatch(addHistory(addHistoryLine("Enter a new password:")));
            break;
          } else {
            dispatch(addHistory(addHistoryLine("An error occurred. Please try again.")));
            setWorkflow({
              step: "signup-email",
              data: {},
            });
            dispatch(setCommandType("text"));
            dispatch(addHistory(addHistoryLine("Enter your email address:")));
            break;
          }
        default:
          break;
      }
      dispatch(clearCommand());
    };

    handleCommand();
  }, [command, dispatch, workflow]);

  return <AuthHistories history={history} />;
}
