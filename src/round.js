export const FALL_MS = 320;
const DROP_GAP_MS = 65;

export function newRound() {
  return { filled: 0, pending: [], completedAt: null };
}

export function addDrop(round, capacity, now) {
  if (round.filled + round.pending.length >= capacity) return false;
  const previous = round.pending[round.pending.length - 1];
  round.pending.push(Math.max(now, previous === undefined ? now : previous + DROP_GAP_MS));
  return true;
}

export function advanceRound(round, capacity, now) {
  let landed = 0;
  while (landed < round.pending.length && now >= round.pending[landed] + FALL_MS) {
    landed++;
  }
  if (landed === 0) return;
  round.filled += landed;
  if (round.filled === capacity) round.completedAt = round.pending[landed - 1] + FALL_MS;
  round.pending.splice(0, landed);
}
