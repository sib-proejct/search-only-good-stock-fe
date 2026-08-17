import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 84,
  height = 24,
  color,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = color || (isPositive ? '#34C759' : '#FF3B30');

  const padding = 2;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * usableWidth;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const firstX = padding;
  const lastX = width - padding;
  const bottomY = height;
  const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  const gradientId = `apple-spark-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
