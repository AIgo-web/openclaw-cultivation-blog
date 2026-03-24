import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'red' | 'blue' | 'green' | 'purple';
}

const colorClasses = {
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-500',
    trend: 'text-red-600 dark:text-red-400'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-500',
    trend: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-500',
    trend: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-500',
    trend: 'text-purple-600 dark:text-purple-400'
  }
};

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue' 
}) => {
  const { isDarkMode } = colorClasses[color] as { isDarkMode?: any };
  const colorClass = colorClasses[color];

  return (
    <div className={`
      rounded-xl p-6
      ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
      shadow-sm border border-gray-200 dark:border-gray-800
      transition-all duration-200 hover:shadow-md
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          } mb-1`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${colorClass.trend} flex items-center gap-1`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                较上月
              </span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClass.bg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
