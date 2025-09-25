import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { HistoryLine } from "@/utils/types";

function AuthHistories({ history }: { history: HistoryLine[] }) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

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

export default AuthHistories;
