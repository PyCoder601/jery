import React from 'react';

interface UsageBarProps {
  percentage: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ percentage }) => {
  return (
    <div className="h-2.5 w-full rounded-full bg-gray-700 dark:bg-gray-700">
      <div
        className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default UsageBar;
