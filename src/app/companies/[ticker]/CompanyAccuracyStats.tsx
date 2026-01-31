'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { formatPercentage } from '@/lib/utils';
import type { CompanyAccuracy } from '@/lib/types';

interface CompanyAccuracyStatsProps {
  ticker: string;
}

export function CompanyAccuracyStats({ ticker }: CompanyAccuracyStatsProps) {
  const [accuracy, setAccuracy] = useState<CompanyAccuracy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccuracy() {
      try {
        const res = await fetch('/api/accuracy');
        if (res.ok) {
          const data = await res.json();
          const companyData = data.byCompany?.find((c: CompanyAccuracy) => c.ticker === ticker);
          setAccuracy(companyData || null);
        }
      } catch (error) {
        console.error('Failed to fetch accuracy:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccuracy();
  }, [ticker]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!accuracy) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500">Brier Score</p>
          <p className="text-2xl font-bold text-gray-900">
            {accuracy.averageBrierScore.toFixed(3)}
          </p>
          <Link href="/methodology#brier-score" className="text-xs text-blue-600 hover:underline">
            What is this?
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500">Hit Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {formatPercentage(accuracy.hitRate, 0)}
          </p>
          <Link href="/methodology#calibration" className="text-xs text-blue-600 hover:underline">
            Learn more
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500">Markets Resolved</p>
          <p className="text-2xl font-bold text-gray-900">{accuracy.resolvedCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Also export takeaway items for use in KeyTakeaways
export function CompanyAccuracyTakeaways({ ticker }: CompanyAccuracyStatsProps) {
  const [accuracy, setAccuracy] = useState<CompanyAccuracy | null>(null);

  useEffect(() => {
    async function fetchAccuracy() {
      try {
        const res = await fetch('/api/accuracy');
        if (res.ok) {
          const data = await res.json();
          const companyData = data.byCompany?.find((c: CompanyAccuracy) => c.ticker === ticker);
          setAccuracy(companyData || null);
        }
      } catch (error) {
        console.error('Failed to fetch accuracy:', error);
      }
    }
    fetchAccuracy();
  }, [ticker]);

  if (!accuracy) {
    return null;
  }

  return (
    <>
      <li>
        <strong>Brier Score:</strong> {accuracy.averageBrierScore.toFixed(3)} — lower is better
      </li>
      <li>
        <strong>Hit Rate:</strong> {formatPercentage(accuracy.hitRate, 0)} — across {accuracy.resolvedCount} resolved markets
      </li>
    </>
  );
}
