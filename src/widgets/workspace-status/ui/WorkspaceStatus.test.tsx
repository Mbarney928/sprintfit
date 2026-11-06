import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';
import { renderWithApi } from '@/test/renderWithApi';

import { WorkspaceStatus } from './WorkspaceStatus';

describe('WorkspaceStatus', () => {
  it('announces loading', () => {
    render(<WorkspaceStatus isPending error={null} onRetry={vi.fn()} />);
    expect(screen.getByText('Loading workspace').parentElement).toHaveAttribute('aria-busy', 'true');
  });

  it('offers retry for unexpected errors without leaking details', async () => {
    const onRetry = vi.fn();
    render(<WorkspaceStatus isPending={false} error={new Error('stack trace here')} onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred');
    expect(screen.getByRole('alert')).not.toHaveTextContent('stack trace');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('offers a reset instead of retry for corrupt storage', () => {
    renderWithApi(
      <WorkspaceStatus
        isPending={false}
        error={new ApiError('corrupt_storage', 'Saved data is unreadable.')}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset demo data' })).toBeInTheDocument();
  });
});
