"use client";
import React from "react";
import { Server, History } from "lucide-react";
import { motion } from "framer-motion";
import { Server as ServerType, HistoryLine } from "@/utils/types";

interface ServerListProps {
  servers: ServerType[];
  history: HistoryLine[];
  selectedServerId: number | undefined;
  onSelectServer: (id: number) => void;
  loading: boolean;
}

const ServerList: React.FC<ServerListProps> = ({
  servers,
  history,
  selectedServerId,
  onSelectServer,
  loading,
}) => {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-1/2 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <h2 className="mb-4 font-mono text-lg text-green-400">Servers</h2>
        {loading ? (
          <p>Loading servers...</p>
        ) : servers.length === 0 ? (
          <p>No servers found.</p>
        ) : (
          <ul className="space-y-2 overflow-y-auto">
            {servers.map((server) => (
              <motion.li
                key={server.id}
                onClick={() => onSelectServer(server.id)}
                className={`flex cursor-pointer items-center rounded-md p-2 transition-colors ${
                  selectedServerId === server.id
                    ? "bg-green-500/20 text-green-300"
                    : "hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <Server className="mr-3 h-5 w-5" />
                <span>{server.name}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex h-1/2 flex-col rounded-lg border border-gray-700 bg-gray-800/50 p-2">
        <h2 className="mb-4 flex shrink-0 items-center font-mono text-lg text-green-400">
          <History className="mr-2 h-5 w-5" />
          History
        </h2>
        <div className="flex-grow space-y-1 overflow-y-auto font-mono text-xs">
          {history.map((line, index) => (
            <p key={index}>
              <span className="text-gray-500">{`[${line.timestamp}]>`}</span>
              <span
                className={`${line.isUserInput ? "text-green-300" : "text-gray-400"}`}
              >
                {line.text}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServerList;
