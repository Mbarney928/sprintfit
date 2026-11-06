import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollRegion } from './ScrollRegion';

const meta = {
  title: 'Shared/ScrollRegion',
  component: ScrollRegion,
  args: {
    label: 'Wide table',
    children: (
      <table style={{ minWidth: 900 }}>
        <thead>
          <tr>
            {['Item', 'Priority', 'Skill', 'Estimate', 'Depends on', 'Owner'].map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Card form</th>
            <td>Critical</td>
            <td>Frontend</td>
            <td>16h</td>
            <td>Checkout API contract</td>
            <td>Jonah Vale</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Keyboard users can focus the region and scroll it with arrow keys. */
export const Overflowing: Story = {};
