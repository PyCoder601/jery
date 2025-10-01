import React from 'react';

interface UsageBarProps {
  percentage: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ percentage }) => {
  const color = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-400';

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={`${color} h-2.5 rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default UsageBar;
