import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addPoints,
  clearHistory,
  initialState,
  newMatch,
  restore,
  scores,
  startNext,
  undo,
  winner,
} from "../src/game.ts";

test("15 malas pasan a buenas sin reiniciar el total", () => {
  let m = newMatch();
  m = addPoints(m, 0, 14);
  m = addPoints(m, 0, 1);
  assert.deepEqual(scores(m), [15, 0]);
  assert.equal(winner(m), null);
});
test('Fileteado es el original para una instalación nueva', () => {
  assert.equal(initialState().design, 'fileteado');
});
test('borrar historial conserva el anotador y las preferencias, y persiste el borrado', () => {
  let state = initialState();
  state.match = addPoints(state.match, 0, 30);
  state = startNext(state, state.match.names, 30);
  state.match = addPoints(state.match, 1, 30);
  const cleared = clearHistory(state);
  assert.equal(cleared.finished.length, 0);
  assert.deepEqual(cleared.match, state.match);
  assert.equal(cleared.design, state.design);
  assert.equal(cleared.clearedMatchId, state.match.id);
  assert.deepEqual(restore(JSON.stringify(cleared)), cleared);
  const next = startNext(cleared, cleared.match.names, 30);
  assert.equal(next.finished.length, 0);
  next.match = addPoints(next.match, 0, 30);
  assert.equal(startNext(next, next.match.names, 30).finished.length, 1);
});
test("no supera el objetivo y bloquea tantos después de ganar", () => {
  let m = addPoints(newMatch(), 0, 29);
  m = addPoints(m, 0, 4);
  assert.deepEqual(scores(m), [30, 0]);
  assert.equal(winner(m), 0);
  assert.deepEqual(addPoints(m, 1, 4), m);
  assert.deepEqual(addPoints(m, 0, -1), m);
});
test("deshacer victoria devuelve el puntaje anterior exacto", () => {
  const m = addPoints(addPoints(newMatch(), 1, 28), 1, 4);
  const reverted = undo(m);
  assert.equal(winner(reverted), null);
  assert.deepEqual(scores(reverted), [0, 28]);
});
test("partida corta termina a 15", () => {
  const m = addPoints(newMatch(["Ana", "Leo"], 15), 1, 16);
  assert.equal(winner(m), 1);
  assert.deepEqual(scores(m), [0, 15]);
});
test("restar nunca produce negativos y se puede deshacer la corrección", () => {
  let m = addPoints(newMatch(), 0, -1);
  assert.equal(m.moves.length, 0);
  m = addPoints(m, 1, 2);
  m = addPoints(m, 1, -4);
  assert.deepEqual(scores(m), [0, 0]);
  assert.deepEqual(scores(undo(m)), [0, 2]);
});
test("rechaza puntos no enteros e inválidos", () => {
  const m = newMatch();
  for (const points of [NaN, Infinity, 0, 1.5])
    assert.deepEqual(addPoints(m, 0, points), m);
});
test("revancha archiva solo una vez y conserva los equipos", () => {
  let s = initialState();
  s.match = addPoints(s.match, 0, 30);
  s = startNext(s, s.match.names, s.match.goal);
  assert.equal(s.finished.length, 1);
  assert.deepEqual(scores(s.match), [0, 0]);
  s = startNext(s, s.match.names, s.match.goal);
  assert.equal(s.finished.length, 1);
});
test("partida incompleta no se registra como victoria", () => {
  let s = initialState();
  s.match = addPoints(s.match, 1, 14);
  s = startNext(s, ["Uno", "Dos"], 15);
  assert.equal(s.finished.length, 0);
  assert.equal(s.match.goal, 15);
  assert.deepEqual(s.match.names, ["Uno", "Dos"]);
});
test("guardado y restauración preservan puntos, historial y preferencias", () => {
  let s = initialState();
  s.match = addPoints(s.match, 0, 30);
  s = startNext(s, s.match.names, 30);
  s.match = addPoints(s.match, 1, 7);
  s.dark = true;
  assert.deepEqual(restore(JSON.stringify(s)), s);
});
test("datos corruptos, versiones desconocidas y marcadores imposibles no se cargan", () => {
  assert.equal(restore("{"), null);
  assert.equal(restore("null"), null);
  const s = initialState();
  assert.equal(restore(JSON.stringify({ ...s, version: 2 })), null);
  s.match.moves = [{ team: 0, points: -1, at: Date.now() }];
  assert.equal(restore(JSON.stringify(s)), null);
  s.match.moves = [
    { team: 0, points: 30, at: Date.now() },
    { team: 1, points: 1, at: Date.now() },
  ];
  assert.equal(restore(JSON.stringify(s)), null);
});
test("limita el archivo a las últimas 100 partidas", () => {
  let s = initialState();
  for (let i = 0; i < 102; i++) {
    s.match = addPoints(s.match, 0, 30);
    s = startNext(s, s.match.names, 30);
  }
  assert.equal(s.finished.length, 100);
});

test("conserva cada diseño y modo oscuro al recuperar la partida", () => {
  for (const design of ["fileteado", "moderno", "sakura", "retro", "comic", "cyberpunk"] as const) {
    const s = { ...initialState(), design, dark: true };
    assert.deepEqual(restore(JSON.stringify(s)), s);
  }
});
test("recupera partidas anteriores al selector de diseño", () => {
  const s = initialState();
  const { design, ...legacy } = s;
  assert.equal(restore(JSON.stringify(legacy))?.design, "fileteado");
  assert.equal(restore(JSON.stringify({ ...s, design: "inexistente" })), null);
});

test("los temas retirados migran al original sin perder partida ni preferencias", () => {
  const s = initialState();
  s.match = addPoints(s.match, 1, 30);
  const playing = startNext(s, s.match.names, 30);
  playing.match = addPoints(playing.match, 0, 12);
  playing.dark = true;
  for (const design of ["criollo", "patriota", "rosa", "rustico", "pampa"]) {
    const restored = restore(JSON.stringify({ ...playing, design }));
    assert.deepEqual(restored, { ...playing, design: "fileteado" });
  }
});
