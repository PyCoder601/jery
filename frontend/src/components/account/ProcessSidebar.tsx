"use client";
import React from "react";
import { Cpu, MemoryStick, Terminal, XCircle } from "lucide-react";
import { Server, TopProcess } from "@/utils/types";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { killProcess } from "@/redux/accountSlice";
import { motion } from "framer-motion";

interface ProcessSidebarProps {
  server: Server;
}

const ProcessSidebar: React.FC<ProcessSidebarProps> = ({ server }) => {
  const dispatch: AppDispatch = useDispatch();
  const processes: TopProcess[] = server.top_five_processes
    ? JSON.parse(server.top_five_processes)
    : [];

  const handleKillProcess = (pid: number) => {
    if (window.confirm(`Are you sure you want to kill process ${pid}?`)) {
      dispatch(killProcess({ serverId: server.id, pid }));
    }
  };

  return (
    <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <h2 className="mb-4 flex items-center font-mono text-lg text-green-400">
        <Terminal className="mr-2 h-5 w-5" />
        Top Processes
      </h2>
      {processes.length > 0 ? (
        <ul className="space-y-2 font-mono text-xs">
          {processes.map((p, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md p-1 hover:bg-gray-700/50"
            >
              <div className="truncate">
                <span className="text-gray-400" title={p.name}>
                  {p.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center">
                <div className="mr-3 flex items-center" title="CPU Usage">
                  <Cpu size={12} className="mr-1 text-gray-500" />
                  <span className="text-green-300">
                    {p.cpu_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="mr-2 flex items-center" title="Memory Usage">
                  <MemoryStick size={12} className="mr-1 text-gray-500" />
                  <span className="text-blue-300">
                    {p.memory_percent.toFixed(1)}%
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2, color: "#ef4444" }}
                  onClick={() => handleKillProcess(p.pid)}
                  className="text-gray-500 transition-colors hover:text-red-500"
                  title={`Kill process ${p.pid}`}
                >
                  <XCircle size={14} />
                </motion.button>
              </div>
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
