import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatTile } from './StatTile';

const meta = {
  title: 'Shared/StatTile',
  component: StatTile,
  args: { label: 'Team capacity', value: '245.5h', detail: '7 people · 10 days' },
  decorators: [(Story) => <div style={{ maxWidth: 240 }}>{Story()}</div>],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { label: 'Not this sprint', value: 0, detail: '0h deferred' } };
