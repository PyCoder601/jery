"use client";
import React from "react";
import { Terminal } from "lucide-react";
import { Server } from "@/utils/types";

interface ProcessSidebarProps {
  server: Server;
}

const ProcessSidebar: React.FC<ProcessSidebarProps> = ({ server }) => {
  const processes = server.top_five_processes
    ? JSON.parse(server.top_five_processes)
    : [];

  return (
    <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <h2 className="mb-4 flex items-center font-mono text-lg text-green-400">
        <Terminal className="mr-2 h-5 w-5" />
        Top Processes
      </h2>
      {processes.length > 0 ? (
        <ul className="space-y-2 font-mono text-xs">
          {processes.map((p: any, i: number) => (
            <li key={i} className="flex justify-between">
              <span className="text-gray-400">{p.name}</span>
              <span className="text-green-300">{p.cpu_percent.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No process data available.</p>
      )}
    </div>
  );
};

export default ProcessSidebar;
