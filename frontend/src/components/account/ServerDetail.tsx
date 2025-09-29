"use client";
import React from "react";
import { Server, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Server as ServerType } from "@/utils/types";
import MetricView from "./MetricView";

interface ServerDetailProps {
  server: ServerType;
}

const ServerDetail: React.FC<ServerDetailProps> = ({ server }) => {
  return (
    <motion.div
      key={server.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-lg border border-gray-700 bg-gray-800/50 p-6"
    >
      <div className="mb-6 flex items-center">
        <Server className="mr-4 h-8 w-8 text-green-400" />
        <div>
          <h2 className="font-mono text-2xl text-green-300">{server.name}</h2>
          <p className="text-xs text-gray-500">API Key: {server.api_key}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center font-mono text-lg text-green-400">
          <Zap className="mr-2 h-5 w-5" />
          Metrics
        </h3>
        <div className="space-y-4">
          {server.metrics.map((metric) => (
            <MetricView key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ServerDetail;
