/** Round axis steps (1, 2, 2.5 or 5 × 10^n) so ticks read 0h, 10h, 20h… rather than 12h, 25h, 37h. */
export function niceScale(dataMax: number, targetTicks = 4): { max: number; ticks: number[] } {
  if (dataMax <= 0) return { max: 1, ticks: [0, 1] };
  const rough = dataMax / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10]
    .map((m) => m * magnitude)
    .reduce((best, s) => (Math.abs(s - rough) < Math.abs(best - rough) ? s : best));
  const max = Math.ceil(dataMax / step) * step;
  return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) };
}
