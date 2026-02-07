import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DeveloperSignupForm } from './DeveloperSignupForm';

export const metadata: Metadata = {
  title: 'Developer API',
  description: 'Access prediction market data programmatically. Get historical accuracy metrics, market probabilities, and resolution data via our REST API.',
};

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Developers</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Developer API</h1>
        <p className="text-gray-600">
          Access prediction market data programmatically. Get real-time market probabilities,
          historical accuracy metrics, and resolution outcomes via our REST API.
        </p>
      </div>

      {/* API Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/markets</code>
                <p className="text-gray-600 mt-1">List all active and resolved markets with metadata</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/markets/:id</code>
                <p className="text-gray-600 mt-1">Get detailed market info including resolution data</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/markets/:id/history</code>
                <p className="text-gray-600 mt-1">Probability snapshots over time</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/accuracy</code>
                <p className="text-gray-600 mt-1">Overall accuracy metrics with breakdowns</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/accuracy/companies</code>
                <p className="text-gray-600 mt-1">Per-company accuracy statistics</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-blue-600 font-mono text-xs">GET /api/v1/resolutions</code>
                <p className="text-gray-600 mt-1">Historical market outcomes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className="p-6 border-2 border-blue-500 rounded-lg relative">
              <span className="absolute -top-2 left-4 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">Standard</span>
              <p className="text-3xl font-bold text-gray-900 mt-2">$49.99<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  10,000 requests/day
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All endpoints included
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email support
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel anytime
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Need higher limits? <a href="mailto:support@predictionmarketanalytics.io" className="text-blue-600 hover:underline">Contact us</a> for enterprise pricing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signup Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Get Your API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <DeveloperSignupForm />
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Make authenticated requests using your API key:</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://predictionmarketanalytics.io/api/v1/markets`}
              </pre>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Example response:</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "data": [
    {
      "id": "abc123",
      "question": "Will AAPL beat Q1 2026 earnings?",
      "ticker": "AAPL",
      "outcomes": [
        { "name": "Yes", "probability": 0.72 },
        { "name": "No", "probability": 0.28 }
      ],
      "volume": 125000,
      "status": "active"
    }
  ],
  "meta": { "total": 150, "limit": 100 }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
