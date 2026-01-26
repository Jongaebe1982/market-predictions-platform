import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { InterestButton } from './InterestButton';

export const metadata: Metadata = {
  title: 'Coming Soon - Pro & Enterprise Features',
  description: 'Upcoming Pro and Enterprise features for Market Predictions: CSV exports, saved markets, custom dashboards, email alerts, and API access.',
};

// Revalidate every 30 seconds to show updated interest count
export const revalidate = 30;

const proFeatures = [
  {
    title: 'Download Filtered Markets as CSV',
    description: 'Export your filtered market data to CSV for analysis in Excel, Google Sheets, or your favorite tools.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Save Markets & Companies',
    description: 'Bookmark your favorite markets and companies for quick access. Build your personalized watchlist.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    title: 'Custom Dashboards',
    description: 'Create personalized dashboards with the metrics and markets that matter most to you.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: 'Email Alerts for Probability Moves',
    description: 'Get notified when markets move significantly. Set custom thresholds for the probability changes you care about.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

async function getInterestCount(): Promise<number> {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    const doc = await db.collection('interest').doc('coming-soon').get();
    if (!doc.exists) return 0;
    return doc.data()?.count || 0;
  } catch {
    return 0;
  }
}

export default async function ComingSoonPage() {
  const interestCount = await getInterestCount();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Coming Soon</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full mb-4">
          Coming Soon
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pro & Enterprise Features
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We&apos;re building powerful tools to help you get more out of prediction market data.
          Let us know if you&apos;re interested!
        </p>
      </div>

      {/* Pro Features */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="px-2 py-0.5 text-sm bg-blue-100 text-blue-700 rounded">Pro</span>
          Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {proFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="px-2 py-0.5 text-sm bg-purple-100 text-purple-700 rounded">Enterprise</span>
          Features
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">API Access</h3>
                <p className="text-sm text-gray-600">
                  Full programmatic access to our prediction market data. Build integrations,
                  automate analysis, and incorporate market probabilities into your own applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interest Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Interested in these features?
          </h2>
          <p className="text-gray-600 mb-6">
            Let us know! Your interest helps us prioritize what to build next.
          </p>

          <InterestButton initialCount={interestCount} />

          <p className="text-sm text-gray-500 mt-4">
            {interestCount > 0 ? (
              <>
                <span className="font-medium text-gray-700">{interestCount.toLocaleString()}</span>
                {' '}{interestCount === 1 ? 'person has' : 'people have'} expressed interest
              </>
            ) : (
              'Be the first to express interest!'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
