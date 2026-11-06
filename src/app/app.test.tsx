import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { STORAGE_KEY } from '@/shared/api';
import { expectNoAxeViolations } from '@/test/axe';
import { renderApp } from '@/test/renderApp';

const heading = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name });

describe('Plan page', () => {
  it('shows the capacity-aware plan for the demo data', async () => {
    const { container } = renderApp('/');
    await heading(/Sprint 24/);

    expect(screen.getByText('Team capacity').nextElementSibling).toHaveTextContent('245.5h');
    expect(screen.getByRole('region', { name: 'Risks to review' })).toHaveTextContent(
      'QA work needs 42h but the team has 28h.',
    );

    const committed = screen.getByRole('region', { name: 'Committed items' });
    const contract = within(committed)
      .getByRole('rowheader', { name: /Checkout API contract/ })
      .closest('tr');
    expect(contract).toHaveTextContent(/Raised from medium/);

    const deferred = screen.getByRole('region', { name: 'Not this sprint' });
    expect(deferred).toHaveTextContent('Promo code field');
    expect(deferred).toHaveTextContent('Waits on “Promo code service”');

    await expectNoAxeViolations(container);
  });

  it('offers a tooltip per bar and a table view of the chart', async () => {
    renderApp('/');
    await heading(/Sprint 24/);
    const bar = screen.getByRole('button', { name: /Jonah Vale: 20h planned of 28h capacity/ });
    await userEvent.hover(bar);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Free 8h');
    await userEvent.unhover(bar);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await userEvent.click(bar);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Show table' });
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Show chart' })).toHaveAttribute('aria-pressed', 'true');
    const table = screen.getByRole('region', { name: 'Capacity table' });
    expect(within(table).getByRole('rowheader', { name: 'Elliot Marsh' }).closest('tr')).toHaveTextContent(
      '0h',
    );
  });

  it('updates the sprint and validates its settings', async () => {
    renderApp('/');
    await heading(/Sprint 24/);
    const days = screen.getByRole('spinbutton', { name: 'Working days' });
    const save = screen.getByRole('button', { name: 'Update sprint' });
    expect(save).toBeDisabled();

    await userEvent.clear(days);
    await userEvent.type(days, '30');
    await userEvent.click(save);
    expect(await screen.findByText('At most 20 days')).toBeInTheDocument();
    expect(days).toHaveFocus();

    await userEvent.clear(days);
    await userEvent.type(days, '5');
    await userEvent.click(save);
    await waitFor(() => {
      expect(screen.getByText('Team capacity').nextElementSibling).not.toHaveTextContent('245.5h');
    });
  });

  it('resets demo data only after confirmation', async () => {
    renderApp('/');
    await heading(/Sprint 24/);
    await userEvent.click(screen.getByRole('button', { name: 'Reset demo data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep my data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reset demo data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Replace all data' }));
    expect(await screen.findByRole('button', { name: 'Reset demo data' })).toBeInTheDocument();
  });
});

describe('Backlog page', () => {
  it('validates, adds an item and replans', async () => {
    const { container, router } = renderApp('/backlog');
    await heading('Backlog');
    await expectNoAxeViolations(container);

    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    const form = screen.getByRole('form', { name: 'Add work item' });
    const estimate = within(form).getByRole('spinbutton', { name: 'Estimate (hours)' });
    await userEvent.clear(estimate);
    await userEvent.click(within(form).getByRole('button', { name: 'Add item' }));
    expect(await within(form).findByText('Use at least 3 characters')).toBeInTheDocument();
    expect(within(form).getByText('Enter a number')).toBeInTheDocument();
    expect(within(form).getByRole('textbox', { name: 'Title' })).toHaveFocus();
    await expectNoAxeViolations(container);

    await userEvent.type(within(form).getByRole('textbox', { name: 'Title' }), 'Gift card redemption');
    await userEvent.type(estimate, '4');
    await userEvent.selectOptions(within(form).getByRole('combobox', { name: 'Priority' }), 'critical');
    await userEvent.selectOptions(within(form).getByRole('combobox', { name: 'Skill' }), 'qa');
    await userEvent.click(within(form).getByRole('checkbox', { name: 'Promo code field' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Add item' }));

    const row = (await screen.findByRole('rowheader', { name: /Gift card redemption/ })).closest('tr');
    expect(row).toHaveTextContent('Depends on Promo code field');

    await act(() => router.navigate('/'));
    await heading(/Sprint 24/);
    // The critical QA item pulls its blocked dependency chain into the sprint.
    const committed = screen.getByRole('region', { name: 'Committed items' });
    expect(within(committed).getByRole('rowheader', { name: 'Gift card redemption' })).toBeInTheDocument();
    expect(
      within(committed).getByRole('rowheader', { name: 'Promo code field' }).closest('tr'),
    ).toHaveTextContent(/Raised from/);
  });

  it('edits and deletes items', async () => {
    renderApp('/backlog');
    await heading('Backlog');
    await userEvent.click(screen.getByRole('button', { name: 'Edit Dark mode polish' }));
    const form = screen.getByRole('form', { name: 'Edit Dark mode polish' });
    const title = within(form).getByRole('textbox', { name: 'Title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'Dark theme polish');
    await userEvent.click(within(form).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('rowheader', { name: 'Dark theme polish' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete Dark theme polish' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete Dark theme polish' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete item' }));
    await waitFor(() => {
      expect(screen.queryByRole('rowheader', { name: 'Dark theme polish' })).not.toBeInTheDocument();
    });
  });

  it('closes the form on cancel', async () => {
    renderApp('/backlog');
    await heading('Backlog');
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});

describe('Team page', () => {
  it('adds, edits and removes members with a live capacity preview', async () => {
    const { container } = renderApp('/team');
    await heading('Team');
    await expectNoAxeViolations(container);

    await userEvent.click(screen.getByRole('button', { name: 'Add member' }));
    const form = screen.getByRole('form', { name: 'Add team member' });
    await userEvent.type(within(form).getByRole('textbox', { name: 'Name' }), 'Noor Example');
    await userEvent.selectOptions(within(form).getByRole('combobox', { name: 'Skill' }), 'qa');
    expect(within(form).getByText('Capacity this sprint: 49h')).toBeInTheDocument();
    const focus = within(form).getByRole('spinbutton', { name: /Focus factor/ });
    await userEvent.clear(focus);
    await userEvent.type(focus, '10');
    expect(within(form).getByText('Fix the highlighted fields to see capacity.')).toBeInTheDocument();
    await userEvent.click(within(form).getByRole('button', { name: 'Add member' }));
    expect(await within(form).findByText('At least 30%')).toBeInTheDocument();
    await userEvent.clear(focus);
    await userEvent.type(focus, '80');
    await userEvent.click(within(form).getByRole('button', { name: 'Add member' }));
    expect((await screen.findByRole('rowheader', { name: 'Noor Example' })).closest('tr')).toHaveTextContent(
      '56h',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit Noor Example' }));
    const edit = screen.getByRole('form', { name: 'Edit Noor Example' });
    const pto = within(edit).getByRole('spinbutton', { name: 'PTO days' });
    await userEvent.clear(pto);
    await userEvent.type(pto, '5');
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(screen.getByRole('rowheader', { name: 'Noor Example' }).closest('tr')).toHaveTextContent('28h');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Remove Noor Example' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Noor Example' }));
    await waitFor(() => {
      expect(screen.queryByRole('rowheader', { name: 'Noor Example' })).not.toBeInTheDocument();
    });
  });
});

describe('app shell and failure handling', () => {
  it('switches theme and remembers it', async () => {
    renderApp('/');
    await heading(/Sprint 24/);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await userEvent.click(screen.getByRole('radio', { name: 'Auto' }));
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('marks the current page in navigation and shows a 404 page', async () => {
    renderApp('/nowhere');
    await heading('Page not found');
    expect(screen.getByRole('link', { name: 'Go to the sprint plan' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Team' }));
    await heading('Team');
    expect(screen.getByRole('link', { name: 'Team' })).toHaveAttribute('aria-current', 'page');
  });

  it('recovers from corrupt saved data', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('Saved data is unreadable');
    await userEvent.click(screen.getByRole('button', { name: 'Reset demo data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Replace all data' }));
    await heading(/Sprint 24/);
  });
});
