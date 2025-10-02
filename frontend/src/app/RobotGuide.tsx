"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";

const TypingText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;
    setDisplayedText("");

    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((current) => current + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 20);

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <p className="mb-3 text-sm text-gray-300">{displayedText}</p>;
};

const RobotGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    switch (pathname) {
      case "/login":
        setMessage(
          "If you don't have an account, you can use the `/signup` command to create one.",
        );
        setSuggestions(["/signup"]);
        break;
      case "/signup":
        setMessage(
          "If you already have an account, you can use the `/login` command to sign in.",
        );
        setSuggestions(["/login"]);
        break;
      case "/account":
        setMessage(
          "This page allows you to manage your servers. Use the `add-server` command to add a new server and start monitoring your applications.",
        );
        setSuggestions(["add-server", "logout"]);
        break;
      default:
        setMessage(
          "Not sure where to start? Try one of these commands in the terminal:",
        );
        setSuggestions(["signup", "login"]);
        break;
    }
    setShowSuggestions(false);
  }, [pathname]);

  const handleTypingComplete = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions]);

  return (
    <div className="fixed right-8 bottom-8 z-50 flex items-end space-x-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="max-w-[15rem] origin-bottom-right rounded-lg bg-gray-800 p-4 text-white shadow-lg"
          >
            <div className="mb-2 flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
              <h3 className="font-bold">Suggestions</h3>
            </div>
            <TypingText text={message} onComplete={handleTypingComplete} />
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col space-y-2"
              >
                {suggestions.map((cmd, i) => (
                  <motion.code
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="rounded bg-gray-900 px-2 py-1 text-center text-sm text-red-400"
                  >
                    {cmd}
                  </motion.code>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setShowSuggestions(false);
          }
        }}
        whileHover={{ scale: 1.1 }}
        animate={{
          scale: [1, 1.05, 1],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="cursor-pointer rounded-full bg-green-500 p-4 shadow-lg"
      >
        <Bot className="h-8 w-8 text-white" />
      </motion.div>
    </div>
  );
};

export default RobotGuide;
