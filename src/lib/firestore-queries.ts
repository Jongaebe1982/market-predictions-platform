import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { MarketDocument, MarketResolution, AccuracyMetrics, MarketSnapshot } from './types';

const COLLECTIONS = {
  MARKETS: 'markets',
  SNAPSHOTS: 'snapshots',
  RESOLUTIONS: 'resolutions',
  ACCURACY: 'accuracy',
  ANALYTICS: 'analytics',
} as const;

export async function getMarkets(filters?: {
  sector?: string;
  source?: string;
  status?: string;
  ticker?: string;
  limitCount?: number;
}): Promise<MarketDocument[]> {
  const db = getDb();
  const constraints: QueryConstraint[] = [];

  if (filters?.sector) constraints.push(where('sector', '==', filters.sector));
  if (filters?.source) constraints.push(where('source', '==', filters.source));
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  if (filters?.ticker) constraints.push(where('ticker', '==', filters.ticker));
  constraints.push(orderBy('volume', 'desc'));
  if (filters?.limitCount) constraints.push(limit(filters.limitCount));

  const q = query(collection(db, COLLECTIONS.MARKETS), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MarketDocument);
}

export async function getMarketBySlug(slug: string): Promise<MarketDocument | null> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.MARKETS), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as MarketDocument;
}

export async function getResolutions(): Promise<MarketResolution[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.RESOLUTIONS), orderBy('resolvedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MarketResolution);
}

export async function getAccuracyMetrics(): Promise<AccuracyMetrics | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.ACCURACY, 'current');
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as AccuracyMetrics;
}

export async function getMarketSnapshots(marketId: string): Promise<MarketSnapshot[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.SNAPSHOTS),
    where('marketId', '==', marketId),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as MarketSnapshot);
}

export async function getMarketsByTicker(ticker: string): Promise<MarketDocument[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.MARKETS),
    where('ticker', '==', ticker),
    orderBy('volume', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MarketDocument);
}
