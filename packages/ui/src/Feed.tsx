import { type EmailCardViewModel } from '@mailmind/contracts';
import { EmailCard } from './EmailCard';

export interface FeedProps {
  cards: EmailCardViewModel[];
  loading?: boolean;
  onCardClick?: (card: EmailCardViewModel) => void;
  emptyMessage?: string;
}

export function Feed({ cards, loading = false, onCardClick, emptyMessage }: FeedProps) {
  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          正在分析邮件...
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', color: 'var(--text-secondary)' }}>
          {emptyMessage || '暂无邮件'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {cards.map((card, idx) => (
        <EmailCard
          key={`${card.receivedAt}-${card.subject}-${idx}`}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
