"use client";
import React from "react";
import { Server, Zap, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { Server as ServerType } from "@/utils/types";
import MetricChart from "./MetricChart";

interface ServerDetailProps {
  server: ServerType;
}

const ServerDetail: React.FC<ServerDetailProps> = ({ server }) => {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {});
  };

  const dockerCommand = `docker run -d --restart=always --network="host" --pid="host" -e API_KEY="${server.api_key}" --name jery-agent romeomanoela/jery-agent:latest`;
  server.metrics.find(
    (m) =>
      m.name.toLowerCase().includes("disk") && m.name.toLowerCase().includes("total"),
  );
  server.metrics.find(
    (m) =>
      (m.name.toLowerCase().includes("memory") || m.name.toLowerCase().includes("ram")) &&
      m.name.toLowerCase().includes("total"),
  );
  server.metrics.filter((m) => !m.name.toLowerCase().includes("total"));
  return (
    <motion.div
      key={server.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50 p-6"
    >
      <div className="mb-6 flex items-center">
        <Server className="mr-4 h-8 w-8 text-green-400" />
        <div>
          <h2 className="font-mono text-2xl text-green-300">{server.name}</h2>
          <p className="text-xs text-gray-500">API Key: {server.api_key}</p>
        </div>
      </div>

      {server.is_verified ? (
        <div>
          <h3 className="mb-4 flex items-center font-mono text-lg text-green-400">
            <Zap className="mr-2 h-5 w-5" />
            Metrics
          </h3>
          <div className="space-y-4">
            {server.metrics.map((metric) => {
              let unit: string | undefined;
              if (metric.name.toLowerCase().includes("disk")) {
                unit = "GB";
              } else if (
                metric.name.toLowerCase().includes("memory") ||
                metric.name.toLowerCase().includes("ram")
              ) {
                unit = "MB";
              }
              return (
                <MetricChart
                  key={metric.id}
                  metric={metric}
                  totalSize={metric.total}
                  unit={unit}
                />
              );
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-gray-800/50 p-4 text-sm">
            <h4 className="mb-2 font-bold text-yellow-500">Agent Uninstallation</h4>
            <p className="text-gray-400">
              To completely remove the monitoring agent from this server, run the
              following commands on your server:
            </p>
            <div className="mt-3 space-y-1">
              <code className="block w-full rounded bg-gray-900 p-2 text-center text-red-400">
                docker stop jery-agent
              </code>
              <code className="block w-full rounded bg-gray-900 p-2 text-center text-red-400">
                docker rm jery-agent
              </code>
              <code className="block w-full rounded bg-gray-900 p-2 text-center text-red-400">
                docker rmi romeomanoela/jery-agent:latest
              </code>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-600 bg-yellow-900/20 p-4">
          <h3 className="mb-3 font-mono text-lg text-yellow-300">
            Activation is required
          </h3>
          <div>
            <p className="mb-3 text-sm text-yellow-100">
              If you have Docker installed on your server, you can use this single command
              to start the agent.
            </p>
            <div className="group relative">
              <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-sm text-white">
                <code>{dockerCommand}</code>
              </pre>
              <button
                onClick={() => handleCopyToClipboard(dockerCommand)}
                className="absolute top-2 right-2 rounded-md bg-gray-700 p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ServerDetail;
