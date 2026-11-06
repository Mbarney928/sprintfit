import { useEffect } from 'react';

import { applyTheme, useThemeStore, type ThemePreference } from '../model/theme';
import styles from './ThemeToggle.module.css';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** A labelled radio group: arrow keys move between options, as users expect. */
export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  return (
    <fieldset className={styles.toggle}>
      <legend className="visually-hidden">Color theme</legend>
      {OPTIONS.map((o) => (
        <label key={o.value} className={styles.option}>
          <input
            type="radio"
            name="theme"
            value={o.value}
            checked={preference === o.value}
            onChange={() => {
              setPreference(o.value);
            }}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
