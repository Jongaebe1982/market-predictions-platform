import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Market Predictions - Stock & Earnings Prediction Markets',
    template: '%s | Market Predictions',
  },
  description:
    'Track stock and earnings prediction markets from Polymarket and Kalshi. See analytics, calibration data, and market trends.',
  openGraph: {
    title: 'Market Predictions - Stock & Earnings Prediction Markets',
    description: 'Track prediction markets with accuracy scoring and calibration data.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <Providers>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
