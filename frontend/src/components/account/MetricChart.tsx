'use client';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Metric } from '@/utils/types';
import UsageBar from './UsageBar';

interface MetricChartProps {
  metric: Metric;
  totalSize?: number;
  unit?: string;
}

const MetricChart: React.FC<MetricChartProps> = ({
  metric,
  totalSize,
  unit,
}) => {
  const data = (metric.history || []).map((h) => ({
    time: new Date(h.time).toLocaleTimeString(),
    level: h.level,
  }));

  const latestLevel = metric.current_level;
  const isDiskOrMemoryOrRam =
    metric.name.toLowerCase().includes('disk') ||
    metric.name.toLowerCase().includes('memory') ||
    metric.name.toLowerCase().includes('ram');

  const usedSize =
    totalSize && latestLevel ? (totalSize * latestLevel) / 100 : undefined;

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="font-mono text-sm text-green-300">{metric.name}</h4>
        {isDiskOrMemoryOrRam && latestLevel !== null && (
          <span className="font-mono text-sm text-green-300">
            {latestLevel.toFixed(1)}%
          </span>
        )}
      </div>
      {isDiskOrMemoryOrRam && latestLevel !== null && (
        <div className="mb-2">
          <UsageBar percentage={latestLevel} />
          {totalSize && usedSize !== undefined && (
            <div className="mt-1 text-right font-mono text-xs text-gray-400">
              {usedSize.toFixed(1)} {unit} / {totalSize.toFixed(1)} {unit}
            </div>
          )}
        </div>
      )}
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" stroke="#A0AEC0" fontSize={10} />
            <YAxis stroke="#A0AEC0" fontSize={10} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A202C',
                border: '1px solid #2D3748',
              }}
              labelStyle={{ color: '#E2E8F0' }}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="#48BB78"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
