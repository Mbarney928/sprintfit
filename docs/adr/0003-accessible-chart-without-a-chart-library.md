# ADR 0003: An accessible, hand-built capacity chart instead of a chart library

- Status: accepted
- Date: 2026-11-06

## Context

The plan page needs one chart: planned hours against capacity, one bar per person. Chart libraries
add 40–100 KB gzip and usually render an SVG that screen readers announce poorly. They are also hard
to make keyboard-navigable.

## Decision

Build the chart from HTML and CSS:

- Each bar is a `<button>` with an accessible name ("Jonah Vale: 20h planned of 28h capacity"). It shows
  a tooltip on hover, focus or tap, and Escape dismisses it.
- A single series uses one validated color (`#2a78d6` light, `#3987e5` dark). There is no legend; the
  title names the series. Every bar is labelled directly with its values.
- Status ("Unavailable", overload) always pairs an icon with text, never color alone.
- A "Show table" toggle gives the same data as a real `<table>`.
- Axis ticks come from a small `niceScale` helper (1/2/2.5/5/10 × 10ⁿ).

## Consequences

- No chart dependency. The plan route chunk is about 4 KB gzip.
- The chart passes axe in light and dark mode and works fully from the keyboard.
- More complex charts (burndown, stacked skills) would need revisiting. A library like visx could then
  be lazy-loaded on that route only.
