import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { MarketContent, MarketDocument } from '@/lib/types';
import { generateFallbackContent } from '@/lib/content/market-explanation';

interface MarketExplanationProps {
  content: MarketContent | null;
  market: MarketDocument;
}

export function MarketExplanation({ content, market }: MarketExplanationProps) {
  // Use pre-generated content or fall back to runtime generation
  const displayContent = content || generateFallbackContent(market);

  if (!displayContent.introSentence) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Market</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-gray-700">
          {/* Intro sentence */}
          <p className="font-medium text-gray-900">
            {displayContent.introSentence}
          </p>

          {/* Company context (if available) */}
          {displayContent.companyContext && (
            <p>{displayContent.companyContext}</p>
          )}

          {/* Probability analysis - split by double newlines into paragraphs */}
          {displayContent.probabilityAnalysis?.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
