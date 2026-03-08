import { cn } from '@/lib/utils';

interface FeaturedStat {
  label: string;
  value: string;
}

interface BlogStatsProps {
  stats: FeaturedStat[];
  className?: string;
}

export function BlogStats({ stats, className }: BlogStatsProps) {
  if (stats.length === 0) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100',
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
          <p className="text-xs text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
