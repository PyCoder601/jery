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
    navigator.clipboard.writeText(text).then(() => {
      // Optionally, add some user feedback here, like a toast notification.
    });
  };

  const dockerCommand = `docker run -d --restart=always \
  -e API_KEY="${server.api_key}" \
  -e BACKEND_URL="ws://host.docker.internal:8000/api/ws/metrics/" \
  --name jery-agent-${server.id} \
  jery/agent:latest`;

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

      {server.is_verified ? (
        <div>
          <h3 className="mb-4 flex items-center font-mono text-lg text-green-400">
            <Zap className="mr-2 h-5 w-5" />
            Metrics
          </h3>
          <div className="space-y-4">
            {server.metrics.map((metric) => (
              <MetricChart key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-600 bg-yellow-900/20 p-4">
          <h3 className="mb-3 font-mono text-lg text-yellow-300">
            Activation du serveur requise
          </h3>
          <div>
            <p className="mb-3 text-sm text-yellow-100">
              Si Docker est installé sur votre serveur, vous pouvez utiliser
              cette commande unique pour démarrer l'agent.
            </p>
            <div className="group relative">
              <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-sm text-white">
                <code>{dockerCommand}</code>
              </pre>
              <button
                onClick={() => handleCopyToClipboard(dockerCommand)}
                className="absolute right-2 top-2 rounded-md bg-gray-700 p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Note: L'image{" "}
              <code className="font-mono text-xs">jery/agent:latest</code> est un
              exemple. Remplacez-la par l'image fournie par votre
              administrateur.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ServerDetail;
