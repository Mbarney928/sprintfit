import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ErrorState } from './ErrorState';

const meta = {
  title: 'Shared/ErrorState',
  component: ErrorState,
  args: { title: 'Could not load the workspace', message: 'An unexpected error occurred. Try again.' },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRetry: Story = { args: { onRetry: fn() } };
export const WithoutRetry: Story = {
  args: { title: 'Saved data is unreadable', message: 'Reset the demo data to continue.' },
};
