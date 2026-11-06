import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelectField } from './SelectField';

const options = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'qa', label: 'QA' },
] as const;

const meta = {
  title: 'Shared/SelectField',
  component: SelectField,
  args: { label: 'Skill', name: 'skill', options, defaultValue: 'backend' },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Work is only assigned to people with this skill.' } };
export const Invalid: Story = { args: { error: 'Choose a skill' } };
export const Disabled: Story = { args: { disabled: true } };
