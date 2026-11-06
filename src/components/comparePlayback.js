export function commonDuration(durations) {
  return durations.every((duration) => Number.isFinite(duration) && duration > 0)
    ? Math.min(...durations)
    : 0;
}

export function comparisonTime(time, duration) {
  return Math.max(0, Math.min(Number.isFinite(time) ? time : 0, duration));
}
