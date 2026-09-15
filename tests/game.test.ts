import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addPoints, initialState, newMatch, restore, scores, startNext, undo, winner } from '../src/game.ts';

test('15 malas pasan a buenas sin reiniciar el total', () => {
  let m = newMatch(); m = addPoints(m,0,14); m = addPoints(m,0,1);
  assert.deepEqual(scores(m), [15,0]); assert.equal(winner(m),null);
});
test('no supera el objetivo y bloquea tantos después de ganar', () => {
  let m = addPoints(newMatch(),0,29); m = addPoints(m,0,4);
  assert.deepEqual(scores(m),[30,0]); assert.equal(winner(m),0);
  assert.deepEqual(addPoints(m,1,4),m); assert.deepEqual(addPoints(m,0,-1),m);
});
test('deshacer victoria devuelve el puntaje anterior exacto', () => {
  const m = addPoints(addPoints(newMatch(),1,28),1,4);
  const reverted = undo(m); assert.equal(winner(reverted),null); assert.deepEqual(scores(reverted),[0,28]);
});
test('partida corta termina a 15', () => {
  const m=addPoints(newMatch(['Ana','Leo'],15),1,16);
  assert.equal(winner(m),1); assert.deepEqual(scores(m),[0,15]);
});
test('restar nunca produce negativos y se puede deshacer la corrección', () => {
  let m=addPoints(newMatch(),0,-1); assert.equal(m.moves.length,0);
  m=addPoints(m,1,2); m=addPoints(m,1,-4); assert.deepEqual(scores(m),[0,0]);
  assert.deepEqual(scores(undo(m)),[0,2]);
});
test('rechaza puntos no enteros e inválidos', () => {
  const m=newMatch(); for(const points of [NaN,Infinity,0,1.5]) assert.deepEqual(addPoints(m,0,points),m);
});
test('revancha archiva solo una vez y conserva los equipos', () => {
  let s=initialState(); s.match=addPoints(s.match,0,30);
  s=startNext(s,s.match.names,s.match.goal); assert.equal(s.finished.length,1); assert.deepEqual(scores(s.match),[0,0]);
  s=startNext(s,s.match.names,s.match.goal); assert.equal(s.finished.length,1);
});
test('partida incompleta no se registra como victoria', () => {
  let s=initialState(); s.match=addPoints(s.match,1,14); s=startNext(s,['Uno','Dos'],15);
  assert.equal(s.finished.length,0); assert.equal(s.match.goal,15); assert.deepEqual(s.match.names,['Uno','Dos']);
});
test('guardado y restauración preservan puntos, historial y preferencias', () => {
  let s=initialState(); s.match=addPoints(s.match,0,30); s=startNext(s,s.match.names,30);
  s.match=addPoints(s.match,1,7); s.dark=true; assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('datos corruptos, versiones desconocidas y marcadores imposibles no se cargan', () => {
  assert.equal(restore('{'),null); assert.equal(restore('null'),null);
  const s=initialState(); assert.equal(restore(JSON.stringify({...s,version:2})),null);
  s.match.moves=[{team:0,points:-1,at:Date.now()}]; assert.equal(restore(JSON.stringify(s)),null);
  s.match.moves=[{team:0,points:30,at:Date.now()},{team:1,points:1,at:Date.now()}]; assert.equal(restore(JSON.stringify(s)),null);
});
test('limita el archivo a las últimas 100 partidas', () => {
  let s=initialState(); for(let i=0;i<102;i++){s.match=addPoints(s.match,0,30);s=startNext(s,s.match.names,30);}
  assert.equal(s.finished.length,100);
});
