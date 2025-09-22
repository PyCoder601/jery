"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const addHistoryLine = (text: string, isUserInput = false) => ({
  text,
  isUserInput,
  timestamp: new Date().toLocaleTimeString(),
});

export default function SignupPage() {
  const [history, setHistory] = useState([
    addHistoryLine("Starting account creation..."),
    addHistoryLine("Enter your email address:"),
  ]);
  const [input, setInput] = useState("");
  const [workflow, setWorkflow] = useState({ step: "signup-email", data: {} as any });
  const [isPassword, setIsPassword] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const command = input.trim();
    const newHistory = [...history, addHistoryLine(command, true)];
    setInput("");

    switch (workflow.step) {
      case "signup-email":
        setWorkflow({
          step: "signup-username",
          data: { ...workflow.data, email: command },
        });
        setHistory([...newHistory, addHistoryLine("Enter your desired username:")]);
        break;
      case "signup-username":
        setWorkflow({
          step: "signup-password",
          data: { ...workflow.data, username: command },
        });
        setIsPassword(true);
        setHistory([...newHistory, addHistoryLine("Enter your password:")]);
        break;
      case "signup-password":
        setWorkflow({
          step: "signup-confirm-password",
          data: { ...workflow.data, password: command },
        });
        setHistory([...newHistory, addHistoryLine("Confirm your password:")]);
        break;
      case "signup-confirm-password":
        setIsPassword(false);
        if (command === workflow.data.password) {
          setHistory([
            ...newHistory,
            addHistoryLine("Account created successfully! Redirecting..."),
          ]);
          // In a real app, you'd make an API call here and then redirect.
          setTimeout(() => (window.location.href = "/"), 2000);
        } else {
          setHistory([
            ...newHistory,
            addHistoryLine("Passwords do not match. Please start over."),
          ]);
          setTimeout(() => window.location.reload(), 2000);
        }
        setWorkflow({ step: "done", data: {} });
        break;
      default:
        // Do nothing if workflow is done
        break;
    }
  };

  return (
    <main
      className="h-full font-mono text-sm text-green-400"
      onClick={() => document.getElementById("terminal-input")?.focus()}
    >
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
      {workflow.step !== "done" && (
        <div className="mt-2 flex items-center">
          <span className="mr-2 text-gray-400">{`>`}</span>
          <input
            id="terminal-input"
            type={isPassword ? "password" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow border-none bg-transparent text-green-400 focus:outline-none"
            autoFocus
          />
        </div>
      )}
    </main>
  );
}
