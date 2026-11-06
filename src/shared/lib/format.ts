/** 12 -> "12h", 45.5 -> "45.5h" */
export function formatHours(hours: number): string {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

/** 0.873 -> "87%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
