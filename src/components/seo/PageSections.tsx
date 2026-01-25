import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// PageContents - "What this page contains" bullet list
interface PageContentsProps {
  items: Array<{
    label: string;
    anchor: string;
  }>;
}

export function PageContents({ items }: PageContentsProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>What this page contains</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-gray-600">
          {items.map((item) => (
            <li key={item.anchor}>
              •{' '}
              <a href={`#${item.anchor}`} className="text-blue-600 hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// KeyTakeaways - Key facts with concrete numbers
interface KeyTakeaway {
  label: string;
  value: string | number;
  description?: string;
}

interface KeyTakeawaysProps {
  title?: string;
  items: KeyTakeaway[];
}

export function KeyTakeaways({ title = 'Key Takeaways', items }: KeyTakeawaysProps) {
  return (
    <Card className="mb-8 bg-blue-50 border-blue-100">
      <CardHeader>
        <CardTitle className="text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <div>
                <span className="font-medium text-gray-900">{item.label}:</span>{' '}
                <span className="text-gray-700 font-semibold">{item.value}</span>
                {item.description && (
                  <span className="text-gray-500 text-sm"> — {item.description}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// DataFreshness - Last updated timestamp
interface DataFreshnessProps {
  lastUpdated?: Date | string;
  refreshInterval?: string;
}

export function DataFreshness({
  lastUpdated = new Date(),
  refreshInterval = 'hourly',
}: DataFreshnessProps) {
  const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="text-xs text-gray-400 mt-4 flex items-center gap-2">
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        Last updated: {formattedDate} • Refreshes {refreshInterval}
      </span>
    </div>
  );
}

// SummaryBlock - A visually distinct summary for key page information
interface SummaryBlockProps {
  title: string;
  children: React.ReactNode;
}

export function SummaryBlock({ title, children }: SummaryBlockProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
}

// QuickStats - Inline stats display
interface QuickStat {
  label: string;
  value: string | number;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="flex flex-wrap gap-4 text-sm mb-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-1">
          <span className="text-gray-500">{stat.label}:</span>
          <span className="font-semibold text-gray-900">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
