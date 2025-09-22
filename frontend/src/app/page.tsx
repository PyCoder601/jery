"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const lines = [
  { text: "Booting Jery Monitoring System...", delay: 100 },
  { text: "Version: 1.0.0-beta", delay: 150 },
  { text: "Status: Connected to server.", delay: 200 },
  { text: "Type 'signup' to create an account.", delay: 100 },
  { text: "Type 'login' to login.", delay: 100 },
  { text: "Type 'about' to learn more.", delay: 100 },
];

const TerminalUI = () => {
  const [currentLines, setCurrentLines] = useState<{ text: string }[]>([]);
  const [input, setInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const showLines = (index: number) => {
      if (index < lines.length) {
        timeoutId = setTimeout(() => {
          setCurrentLines((prev) => [...prev, lines[index]]);
          showLines(index + 1);
        }, lines[index].delay);
      }
    };

    showLines(0);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const command = input.toLowerCase().trim();
      if (command === "signup") {
        router.push("/signup");
      }
      setInput("");
    }
  };

  const colorizeText = (text: string) => {
    const wordsToColor = ["'signup'", "'login'", "'about'"];
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
      <div className="flex-grow">
        {currentLines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            <span className="mr-2 text-gray-400">{`[${new Date().toLocaleTimeString()}]>`}</span>
            {colorizeText(line.text)}
          </motion.p>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="h-full">
      <TerminalUI />
    </main>
  );
}
