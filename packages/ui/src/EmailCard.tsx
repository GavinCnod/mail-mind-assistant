import { type EmailCardViewModel, type Priority, type EmailCategoryCode } from '@mailmind/contracts';

export interface EmailCardProps {
  card: EmailCardViewModel;
  onClick?: (card: EmailCardViewModel) => void;
  className?: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  P0: { label: 'P0', color: 'var(--priority-p0)', bgColor: 'rgba(200, 32, 20, 0.1)' },
  P1: { label: 'P1', color: 'var(--priority-p1)', bgColor: 'rgba(251, 188, 5, 0.1)' },
  P2: { label: 'P2', color: 'var(--priority-p2)', bgColor: 'rgba(0, 117, 74, 0.1)' },
  P3: { label: 'P3', color: 'var(--priority-p3)', bgColor: 'rgba(0, 0, 0, 0.05)' },
};

export function EmailCard({ card, onClick, className = '' }: EmailCardProps) {
  const priorityConfig = PRIORITY_CONFIG[card.priority];

  return (
    <article
      className={`email-card ${className}`}
      onClick={() => onClick?.(card)}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--space-4)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Identity Layer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            fontSize: '1.4rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {card.senderName || card.senderDomain}
          </span>
          {card.hasAttachments && (
            <span aria-label="Has attachments" title="Has attachments">
              📎
            </span>
          )}
        </div>
        <span style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
        }}>
          {card.receivedAt}
        </span>
      </div>

      {/* Subject */}
      <h3 style={{
        margin: '0 0 var(--space-2) 0',
        fontSize: '1.6rem',
        fontWeight: 600,
        lineHeight: '1.4',
        color: 'var(--text-primary)',
      }}>
        {card.subject}
      </h3>

      {/* Judgment Layer */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        {/* Priority Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-button)',
          background: priorityConfig.bgColor,
          color: priorityConfig.color,
          fontSize: '1.3rem',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-tight)',
        }}>
          {priorityConfig.label}
        </span>

        {/* Requires Action Badge */}
        {card.requiresAction && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-button)',
            background: 'rgba(0, 117, 74, 0.1)',
            color: 'var(--priority-p2)',
            fontSize: '1.3rem',
            fontWeight: 500,
          }}>
            ⚡ {card.requiresAction ? '需行动' : ''}
          </span>
        )}

        {/* Deadline */}
        {card.deadline && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-button)',
            background: 'rgba(0, 0, 0, 0.05)',
            color: 'var(--text-secondary)',
            fontSize: '1.3rem',
          }}>
            ⏰ {card.deadline.source}
          </span>
        )}
      </div>

      {/* Summary Layer */}
      <p style={{
        margin: '0 0 var(--space-3) 0',
        fontSize: '1.5rem',
        lineHeight: '1.6',
        color: 'var(--text-primary)',
      }}>
        {card.oneLineSummary}
      </p>

      {/* Key Facts */}
      {card.keyFacts.length > 0 && (
        <div style={{
          marginBottom: 'var(--space-3)',
          padding: 'var(--space-2) 0',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            关键事实
          </span>
          <ul style={{
            margin: 'var(--space-2) 0 0 0',
            padding: '0 0 0 var(--space-3)',
            listStyle: 'none',
          }}>
            {card.keyFacts.slice(0, 3).map((fact, idx) => (
              <li key={idx} style={{
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
              }}>
                <strong>{fact.label}:</strong> {fact.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Actions */}
      {card.suggestedActions.length > 0 && (
        <div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            建议行动
          </span>
          <ol style={{
            margin: 'var(--space-2) 0 0 0',
            padding: '0 0 0 var(--space-3)',
          }}>
            {card.suggestedActions.map((action, idx) => (
              <li key={idx} style={{
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
                marginBottom: 'var(--space-1)',
              }}>
                {action.action}
                {action.due_at && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    {' '}⏰ {action.due_at}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Confidence & Human Review */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-3)',
        paddingTop: 'var(--space-2)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
        }}>
          置信度: {Math.round(card.confidence * 100)}%
        </span>
        {card.needsHumanReview && (
          <span style={{
            fontSize: '1.2rem',
            color: 'var(--warning)',
            fontWeight: 500,
          }}>
            ⚠️ 需人工确认
          </span>
        )}
      </div>
    </article>
  );
}
