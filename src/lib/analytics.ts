'use client';

import type { AnalyticsEvent } from './types';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return 'server';
  sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return sessionId;
}

async function sendEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: Date.now(),
        sessionId: getSessionId(),
      }),
    });
  } catch {
    // Silently fail analytics
  }
}

export function trackPageview(page: string): void {
  sendEvent({ type: 'pageview', page });
}

export function trackClick(element: string, metadata?: Record<string, string>): void {
  sendEvent({ type: 'click', element, metadata });
}

export function trackSession(): void {
  sendEvent({ type: 'session' });
}
