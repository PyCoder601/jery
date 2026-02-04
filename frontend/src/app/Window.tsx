"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectInputValue,
  setCommand,
  setInputValue,
  addHistory,
  selectCommand,
} from "@/redux/uiSlice";
import { addHistoryLine } from "@/utils/helpes";
import { Github, Star } from "lucide-react";

const GitHubBadge = () => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/PyCoder601/jery");
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  return (
    <a
      href="https://github.com/PyCoder601/jery"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 rounded-md border border-gray-700/50 bg-gray-900/50 px-2.5 py-1 transition-all hover:border-blue-500/50 hover:bg-gray-800/80"
      title="View on GitHub"
    >
      <Github className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-blue-400" />
      {!loading && stars !== null && (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400">{stars}</span>
        </div>
      )}
    </a>
  );
};

const Window = ({ children }: { children: React.ReactNode }) => {
  const inputValue = useAppSelector(selectInputValue);
  const curr_command = useAppSelector(selectCommand);
  const dispatch = useAppDispatch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      dispatch(setCommand(inputValue));
      dispatch(addHistory(addHistoryLine(inputValue, true, curr_command.type)));
      dispatch(setInputValue(""));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto h-[90vh] w-full max-w-[85vw] rounded-lg border border-white/10 bg-[#1a202c]/60 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex h-10 w-full items-center justify-between border-b border-white/10 bg-gray-800/50 px-4">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 font-mono text-sm text-gray-400">
          Jery - Server Monitoring
        </div>
        <GitHubBadge />
      </div>
      <div className="h-[calc(90vh-3.5rem)] p-2">
        {children}
        <div className="flex items-center">
          <span className="mr-2 text-gray-400">{`>`}</span>
          <input
            type={curr_command?.type}
            value={inputValue}
            onChange={(e) => dispatch(setInputValue(e.target.value))}
            onKeyDown={handleKeyDown}
            className="flex-grow border-none bg-transparent text-green-400 focus:outline-none"
            autoFocus
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-4 w-2 bg-green-400"
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Window;
