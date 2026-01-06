import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  className?: string;
  color?: 'positive' | 'negative' | 'neutral';
}

export function Sparkline({ data, className, color = 'neutral' }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 60;
  const height = 20;
  const padding = 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] > data[0] ? 'positive' : data[data.length - 1] < data[0] ? 'negative' : 'neutral';
  const actualColor = color === 'neutral' ? trend : color;

  const strokeColor = actualColor === 'positive' 
    ? 'hsl(var(--success))' 
    : actualColor === 'negative' 
    ? 'hsl(var(--destructive))' 
    : 'hsl(var(--muted-foreground))';

  return (
    <svg 
      className={cn('inline-block', className)} 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
