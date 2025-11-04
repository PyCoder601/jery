"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  addHistory,
  clearCommand,
  clearHistory,
  selectCommand,
  selectHistory,
} from "@/redux/uiSlice";
import { AppDispatch } from "@/redux/store";
import { addHistoryLine } from "@/utils/helpes";

const JeryAscii = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="mb-6"
  >
    <pre className="text-2xl leading-tight font-bold select-none">
      <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
        {`
      ██╗███████╗██████╗ ██╗   ██╗
      ██║██╔════╝██╔══██╗╚██╗ ██╔╝
      ██║█████╗  ██████╔╝ ╚████╔╝ 
██╗   ██║██╔══╝  ██╔══██╗  ╚██╔╝  
╚██████╔╝███████╗██║  ██║   ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   
`}
      </span>
    </pre>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="-mt-2 mb-4 text-center text-sm text-gray-400"
    >
      Professional Server Monitoring & Management
    </motion.p>
  </motion.div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-start gap-3 rounded-lg border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 transition-all hover:border-blue-500/50"
  >
    <div className="rounded-md bg-blue-500/10 p-2 text-blue-400">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  </motion.div>
);

const lines = [
  { text: "🚀 Initializing Jery Monitoring System...", delay: 100 },
  { text: "📦 Version: 0.0.9 | Build: Production", delay: 150 },
  { text: "✓ Status: Connected to server.", delay: 200 },
  { text: "✓ All systems operational.", delay: 250 },
];

export default function Home() {
  const dispatch: AppDispatch = useDispatch();
  const command = useSelector(selectCommand);
  const history = useSelector(selectHistory);
  const router = useRouter();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(clearHistory());
    let timeoutId: NodeJS.Timeout;
    const showLines = (index: number) => {
      if (index < lines.length) {
        timeoutId = setTimeout(() => {
          dispatch(addHistory(addHistoryLine(lines[index].text)));
          showLines(index + 1);
        }, lines[index].delay);
      }
    };

    showLines(0);

    return () => clearTimeout(timeoutId);
  }, [dispatch]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!command?.text) return;

    const commandStr = command.text?.toLowerCase().trim();
    switch (commandStr) {
      case "signup":
        router.push("/signup");
        break;
      case "login":
        router.push("/login");
        break;
      default:
        dispatch(
          addHistory(
            addHistoryLine(`Unknown command: ${commandStr}, check the bot for help`),
          ),
        );
        break;
    }
    dispatch(clearCommand());
  }, [command.text, dispatch, router]);

  const colorizeText = (text: string) => {
    const wordsToColor = ["'signup'", "'login'"];
    const regex = new RegExp(`(${wordsToColor.join("|")})`, "g");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (wordsToColor.includes(part)) {
        return (
          <span key={i} className="font-semibold text-cyan-400">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-full flex-col font-mono text-sm">
      <div className="flex-grow overflow-y-auto pr-2">
        <JeryAscii />
        {history.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-1"
          >
            {line.isUserInput ? (
              <span className="flex items-center gap-2">
                <span className="font-bold text-blue-400">❯</span>
                <span className="text-gray-200">{line.text}</span>
              </span>
            ) : (
              <span className="flex items-start gap-2">
                <span className="mt-0.5 text-xs text-gray-500">[{line.timestamp}]</span>
                <span className="text-gray-300">{colorizeText(line.text)}</span>
              </span>
            )}
          </motion.p>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
