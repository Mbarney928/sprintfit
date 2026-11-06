import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib';

import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

const button = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      danger: styles.danger,
    },
    size: { sm: styles.sm, md: styles.md },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  /** Shows a spinner, sets aria-busy and blocks further clicks. */
  loading?: boolean;
}

export function Button({ variant, size, loading = false, disabled, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(button({ variant, size }), className)}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" label="Working" />}
      {children}
    </button>
  );
}
