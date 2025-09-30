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

interface MetricChartProps {
  metric: Metric;
}

const MetricChart: React.FC<MetricChartProps> = ({ metric }) => {
  const data = (metric.history || []).map((h) => ({
    time: new Date(h.time).toLocaleTimeString(),
    level: h.level,
  }));

  return (
    <div className="mb-4">
      <h4 className="font-mono text-sm text-green-300">{metric.name}</h4>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" stroke="#A0AEC0" fontSize={10} />
            <YAxis stroke="#A0AEC0" fontSize={10} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748' }}
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
