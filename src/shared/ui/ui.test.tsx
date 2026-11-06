import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';

import { Badge, Button, Card, EmptyState, ErrorState, SelectField, Skeleton, Spinner, StatTile, TextField } from '.';

describe('Button', () => {
  it('calls onClick and is keyboard operable', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('blocks clicks while loading and announces it', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Working');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant and size classes and stays accessible', async () => {
    const { container } = render(
      <>
        <Button variant="danger" size="sm">
          Delete
        </Button>
        <Button variant="ghost" disabled>
          Skip
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Delete' }).className).toMatch(/danger/);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });
});

describe('form fields', () => {
  it('links label, hint and error to the input', async () => {
    const { container } = render(<TextField label="Name" hint="As shown on the plan" error="Too short" defaultValue="A" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('As shown on the plan Too short');
    await expectNoAxeViolations(container);
  });

  it('renders a valid field without aria-invalid', () => {
    render(<TextField label="Hours" type="number" />);
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).not.toHaveAttribute('aria-invalid');
  });

  it('renders select options and reports changes', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SelectField
        label="Skill"
        options={[
          { value: 'qa', label: 'QA' },
          { value: 'design', label: 'Design' },
        ]}
        defaultValue="qa"
        onChange={onChange}
        error="Pick one"
      />,
    );
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Skill' }), 'design');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe('display components', () => {
  it('labels a card region by its title', async () => {
    const { container } = render(
      <Card title="Capacity" description="By person" actions={<Button size="sm">Edit</Button>}>
        body
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Capacity' })).toHaveTextContent('body');
    await expectNoAxeViolations(container);
  });

  it('renders a card without a header', () => {
    render(<Card>plain</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows stat values, details and loading skeletons', async () => {
    const { container, rerender } = render(<StatTile label="Committed" value="120h" detail="of 200h" />);
    expect(screen.getByText('Committed')).toBeInTheDocument();
    expect(screen.getByText('120h')).toBeInTheDocument();
    await expectNoAxeViolations(container);
    rerender(<StatTile label="Committed" value="120h" detail="of 200h" loading />);
    expect(screen.queryByText('120h')).not.toBeInTheDocument();
  });

  it('pairs badge color with text and a hidden icon', () => {
    render(
      <Badge tone="critical" icon="!">
        Critical
      </Badge>,
    );
    expect(screen.getByText('Critical').className).toMatch(/critical/);
    expect(screen.getByText('!')).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces errors and offers retry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Could not load" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders empty states, spinners and skeletons', () => {
    render(
      <>
        <EmptyState title="No items" description="Add one" action={<Button>Add</Button>} />
        <ErrorState title="Broken" message="No retry offered" />
        <Spinner label="Loading plan" />
        <Skeleton width="10px" />
      </>,
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading plan');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});
