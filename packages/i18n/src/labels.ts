import { zhCN } from './zh-CN';
import { en } from './en';

/** Category display labels (stable keys, translated values) */
export const labels = {
  email: {
    category: {
      customer_order: zhCN.email.category.customer_order,
      logistics: zhCN.email.category.logistics,
      meeting: zhCN.email.category.meeting,
      billing: zhCN.email.category.billing,
      notification: zhCN.email.category.notification,
      marketing: zhCN.email.category.marketing,
      social: zhCN.email.category.social,
      other: zhCN.email.category.other,
      needs_review: zhCN.email.category.needs_review,
    },
  },
  priority: {
    P0: zhCN.emailCard.priority.P0,
    P1: zhCN.emailCard.priority.P1,
    P2: zhCN.emailCard.priority.P2,
    P3: zhCN.emailCard.priority.P3,
  },
} as const;

export const enLabels = {
  email: {
    category: {
      customer_order: en.email.category.customer_order,
      logistics: en.email.category.logistics,
      meeting: en.email.category.meeting,
      billing: en.email.category.billing,
      notification: en.email.category.notification,
      marketing: en.email.category.marketing,
      social: en.email.category.social,
      other: en.email.category.other,
      needs_review: en.email.category.needs_review,
    },
  },
  priority: {
    P0: en.emailCard.priority.P0,
    P1: en.emailCard.priority.P1,
    P2: en.emailCard.priority.P2,
    P3: en.emailCard.priority.P3,
  },
} as const;

export type Labels = typeof labels;
export type EnLabels = typeof enLabels;
