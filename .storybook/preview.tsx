import type { Preview } from '@storybook/react-vite';

import '../src/shared/ui/styles/tokens.css';
import '../src/shared/ui/styles/global.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    // Fail the story's a11y panel (and the CI test run) on any axe violation.
    a11y: { test: 'error' },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset['theme'] = context.globals['theme'] === 'dark' ? 'dark' : 'light';
      return <Story />;
    },
  ],
};

export default preview;
