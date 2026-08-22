/**
 * Mock fixture data for development and demo
 * Replace with real IMAP adapter for production
 */
import { type EmailInsight } from '@mailmind/contracts';

export const FIXTURE_INSIGHTS: EmailInsight[] = [
  {
    schemaVersion: '1.1',
    sourceEmailId: 'fixture-001',
    outputLocale: 'zh-CN',
    oneLineSummary: '客户确认样品规格，并要求本周四前回复交付时间',
    category: 'customer_order',
    priority: 'P1',
    requiresAction: true,
    suggestedActions: [
      { action: '确认现货与生产周期', due_at: '2026-08-27T17:00:00+08:00', reason: '客户要求周四前给出交期' }
    ],
    keyFacts: [
      { label: '产品', value: '锁定气弹簧 GS-120' },
      { label: '数量', value: '500 件' }
    ],
    deadline: { value: '2026-08-27', source: '本周四', confidence: 0.88 },
    riskFlags: ['交付期限临近'],
    confidence: 0.86,
    needsHumanReview: false,
  },
  {
    schemaVersion: '1.1',
    sourceEmailId: 'fixture-002',
    outputLocale: 'zh-CN',
    oneLineSummary: '物流异常：港口延迟48小时，需通知客户',
    category: 'logistics',
    priority: 'P0',
    requiresAction: true,
    suggestedActions: [
      { action: '通知客户物流延迟', due_at: '2026-08-22T18:00:00+08:00', reason: '港口延迟影响交期' }
    ],
    keyFacts: [
      { label: '延迟时间', value: '48小时' },
      { label: '原因', value: '港口拥堵' }
    ],
    deadline: null,
    riskFlags: ['物流延迟', '可能影响客户满意度'],
    confidence: 0.92,
    needsHumanReview: false,
  },
  {
    schemaVersion: '1.1',
    sourceEmailId: 'fixture-003',
    outputLocale: 'zh-CN',
    oneLineSummary: '今日15:00会议改期至16:30',
    category: 'meeting',
    priority: 'P1',
    requiresAction: true,
    suggestedActions: [
      { action: '更新日历并通知参会者' }
    ],
    keyFacts: [],
    deadline: { value: '2026-08-22T16:30:00+08:00', source: '今日16:30', confidence: 0.95 },
    riskFlags: [],
    confidence: 0.95,
    needsHumanReview: false,
  },
];
