import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  args: { title: 'Nothing fits yet', description: 'Add team members or smaller backlog items.' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = { args: { action: <Button size="sm">Add item</Button> } };
export const TitleOnly: Story = { args: { title: 'No backlog items yet', description: '' } };
