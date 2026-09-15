export type Team = 0 | 1;
export type Goal = 15 | 30;
export type Move = { team: Team; points: number; at: number };
export type Match = { id: string; names: [string, string]; goal: Goal; moves: Move[]; startedAt: number };
export type State = { version: 1; match: Match; finished: Match[]; dark: boolean; haptics: boolean };
export function newMatch(names: [string, string] = ['Nosotros', 'Ellos'], goal: Goal = 30): Match {
  return { id: crypto.randomUUID(), names: names.map((n, i) => n.trim().slice(0, 24) || ['Nosotros', 'Ellos'][i]) as [string, string], goal, moves: [], startedAt: Date.now() };
}
export function initialState(): State { return { version: 1, match: newMatch(), finished: [], dark: false, haptics: true }; }
export function scores(match: Match): [number, number] {
  return match.moves.reduce<[number, number]>((sum, move) => { sum[move.team] += move.points; return sum; }, [0, 0]);
}
export function winner(match: Match): Team | null { const s = scores(match); return s[0] >= match.goal ? 0 : s[1] >= match.goal ? 1 : null; }
export function addPoints(match: Match, team: Team, points: number): Match {
  if (winner(match) !== null || !Number.isInteger(points) || points === 0 || ![0, 1].includes(team)) return match;
  const current = scores(match)[team];
  const actual = Math.max(0, Math.min(match.goal, current + points)) - current;
  return actual === 0 ? match : { ...match, moves: [...match.moves, { team, points: actual, at: Date.now() }] };
}
export function undo(match: Match): Match { return { ...match, moves: match.moves.slice(0, -1) }; }
export function startNext(state: State, names: [string, string], goal: Goal): State {
  return { ...state, finished: winner(state.match) === null ? state.finished : [...state.finished, state.match].slice(-100), match: newMatch(names, goal) };
}
function validMatch(value: unknown): value is Match {
  if (!value || typeof value !== 'object') return false;
  const m = value as Match;
  if (typeof m.id !== 'string' || !Array.isArray(m.names) || m.names.length !== 2 || !m.names.every(n => typeof n === 'string' && n.length > 0 && n.length <= 24) || ![15,30].includes(m.goal) || !Number.isFinite(m.startedAt) || !Array.isArray(m.moves)) return false;
  const totals = [0, 0];
  for (const move of m.moves) {
    if (!move || ![0,1].includes(move.team) || !Number.isInteger(move.points) || move.points === 0 || !Number.isFinite(move.at) || totals.some(t => t >= m.goal)) return false;
    totals[move.team] += move.points;
    if (totals[move.team] < 0 || totals[move.team] > m.goal) return false;
  }
  return true;
}
export function restore(raw: string): State | null {
  try {
    const s = JSON.parse(raw);
    if (s.version !== 1 || !validMatch(s.match) || !Array.isArray(s.finished) || s.finished.length > 100 || !s.finished.every((m: unknown) => validMatch(m) && winner(m) !== null) || typeof s.dark !== 'boolean' || typeof s.haptics !== 'boolean') return null;
    return s as State;
  } catch { return null; }
}
