import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './TextField';

const meta = {
  title: 'Shared/TextField',
  component: TextField,
  args: { label: 'Title', name: 'title', defaultValue: '' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = {
  args: { label: 'Estimate (hours)', type: 'number', hint: 'Whole or half hours.' },
};
export const Invalid: Story = { args: { defaultValue: 'ab', error: 'Use at least 3 characters' } };
export const Disabled: Story = { args: { defaultValue: 'Checkout API contract', disabled: true } };
