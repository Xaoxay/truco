// A drag has to travel down clearly; sideways/upward movement never scores.
export function touchPoints(dx: number, dy: number, maxTravel: number): -1 | 0 | 1 {
  if (![dx, dy, maxTravel].every(Number.isFinite)) return 0;
  if (dy >= 35 && dy > Math.abs(dx)) return -1;
  return maxTravel < 12 ? 1 : 0;
}
