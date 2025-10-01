"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
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
  <pre className="mb-4 text-lg font-bold select-none">
    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
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
);

const WelcomeText = () => (
  <div className="mb-4 text-gray-300">
    <p className="mb-2 font-bold">Tips for getting started:</p>
    <ul className="list-inside list-disc">
      <li>
        Type <code className="text-red-400">signup</code> to create a new account.
      </li>
      <li>
        Type <code className="text-red-400">login</code> if you already have an account.
      </li>
    </ul>
  </div>
);

const Footer = () => (
  <div className="p-4 text-left text-xs text-gray-500">
    <p className="mb-2">
      <a
        href="https://github.com/your-repo"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center hover:text-gray-400"
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub Repository
      </a>
    </p>
  </div>
);

const lines = [
  { text: "Booting Jery Monitoring System...", delay: 100 },
  { text: "Version: 1.0.0-beta", delay: 150 },
  { text: "Status: Connected to server.", delay: 200 },
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
          <span key={i} className="text-red-500">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-full flex-col font-mono text-sm text-green-400">
      <div className="flex-grow overflow-y-auto pr-2">
        <JeryAscii />
        <WelcomeText />
        <Footer />
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
                {colorizeText(line.text)}
              </>
            )}
          </motion.p>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
