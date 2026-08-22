/**
 * Fixture data for development and demo mode
 */
import { type EmailInsight } from '@mailmind/contracts';

export interface FixtureEmail {
  id: string;
  from: { name: string; email: string };
  subject: string;
  date: string;
  body: string;
}

export const FIXTURE_EMAILS: FixtureEmail[] = [
  {
    id: 'fixture-001',
    from: { name: 'Michael Chen', email: 'michael@globalmanufacturing.com' },
    subject: 'Re: Order #4521 - Quantity Confirmation Needed',
    date: '2026-08-21T09:15:00+08:00',
    body: `Dear Sales Team,

Thank you for your quote on the GS-120 air springs. We confirm we want to proceed with the order.

Order Details:
- Product: GS-120 Locked Air Spring
- Quantity: 500 pieces
- Unit Price: $45.00
- Total: $22,500.00

Could you please confirm the delivery timeline? We need these by August 27th (Thursday) as our production line cannot proceed without them.

Please respond by end of day today so we can coordinate with our logistics.

Best regards,
Michael Chen
Procurement Manager
Global Manufacturing Co.`,
  },
  {
    id: 'fixture-002',
    from: { name: 'Logistics Dept', email: 'shipping@logistics-intl.com' },
    subject: 'URGENT: Port Delay Notification - VESSEL CONTENDER Departure Postponed',
    date: '2026-08-21T14:32:00+08:00',
    body: `Dear Valued Customer,

We regret to inform you that the vessel "CONTENDER" (Voyage #2408) has been delayed at Port of Shanghai due to congestion. The new estimated departure time is now 48 hours later than originally scheduled.

Affected Shipments:
- B/L: SHG-2026-8821 (your order #4521 partial shipment)
- Estimated delay: 48 hours
- Impact: On-time delivery to Shanghai port may be compromised

We are monitoring the situation closely and will notify you once the vessel departs. Please advise if this delay affects your production schedule.

Shipping Department
Logistics International Ltd.`,
  },
  {
    id: 'fixture-003',
    from: { name: 'Sarah Chen', email: 'admin@company.com' },
    subject: 'Meeting Rescheduled: Q3 Strategy Review - Now 4:30 PM Today',
    date: '2026-08-21T11:45:00+08:00',
    body: `Hi Team,

The Q3 Strategy Review meeting originally scheduled for 3:00 PM today has been rescheduled to 4:30 PM due to a scheduling conflict with the Board presentation.

Updated Details:
- Date: Today, August 21, 2026
- Time: 4:30 PM - 6:00 PM (instead of 3:00-4:30)
- Location: Conference Room A (same as before)
- Agenda: Same as circulated

Please update your calendars accordingly. If you have any conflicts with the new time, please let me know immediately.

Best,
Sarah Chen
Executive Assistant`,
  },
];

export const FIXTURE_INSIGHTS: EmailInsight[] = [
  {
    schemaVersion: '1.1',
    sourceEmailId: 'fixture-001',
    outputLocale: 'zh-CN',
    oneLineSummary: '客户确认样品规格，要求本周四前回复交付时间',
    category: 'customer_order',
    priority: 'P1',
    requiresAction: true,
    suggestedActions: [
      { action: '确认现货与生产周期', due_at: '2026-08-27T17:00:00+08:00', reason: '客户要求周四前给出交期' },
    ],
    keyFacts: [
      { label: '产品', value: '锁定气弹簧 GS-120' },
      { label: '数量', value: '500 件' },
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
      { action: '通知客户物流延迟', due_at: '2026-08-22T18:00:00+08:00', reason: '港口延迟影响交期' },
    ],
    keyFacts: [
      { label: '延迟时间', value: '48小时' },
      { label: '原因', value: '港口拥堵' },
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
      { action: '更新日历并通知参会者' },
    ],
    keyFacts: [],
    deadline: { value: '2026-08-21T16:30:00+08:00', source: '今日16:30', confidence: 0.95 },
    riskFlags: [],
    confidence: 0.95,
    needsHumanReview: false,
  },
];
