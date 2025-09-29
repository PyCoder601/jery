"use client";
import React from "react";
import { motion } from "framer-motion";
import { Metric } from "@/utils/types";

interface MetricViewProps {
  metric: Metric;
}

const MetricView: React.FC<MetricViewProps> = ({ metric }) => {
  const percentage = (metric.current_level / 100) * 100;
  const isWarning = percentage > metric.warning_level;

  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-sm">
        <span className="text-gray-300">{metric.name}</span>
        <span className={`${isWarning ? "text-red-400" : "text-green-400"}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-700">
        <motion.div
          className={`h-2 rounded-full ${
            isWarning ? "bg-red-500" : "bg-green-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
    </div>
  );
};

export default MetricView;
