import type { Priority } from '@/shared/api';
import { Badge, type BadgeProps } from '@/shared/ui';

import { PRIORITY_LABEL } from '../model/labels';

const TONE: Record<Priority, NonNullable<BadgeProps['tone']>> = {
  critical: 'critical',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};
const ICON: Record<Priority, string> = { critical: '▲▲', high: '▲', medium: '■', low: '▼' };

/** Priority shown with shape and text, so it never relies on color alone. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={TONE[priority]} icon={ICON[priority]}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
