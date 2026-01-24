'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageview, trackSession } from '@/lib/analytics';

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    trackSession();
  }, []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </QueryClientProvider>
  );
}
