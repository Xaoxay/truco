import assert from 'node:assert/strict';
import test from 'node:test';
import { initialNavigation, navigate } from '../src/navigation';

test('Back retraces visited tabs and stays open at the initial board', () => {
  let state = navigate(initialNavigation, { type: 'tab', tab: 'history' });
  state = navigate(state, { type: 'tab', tab: 'settings' });
  state = navigate(state, { type: 'back' });
  assert.equal(state.tabs.at(-1), 'history');
  state = navigate(state, { type: 'back' });
  assert.deepEqual(state, initialNavigation);
  assert.equal(navigate(state, { type: 'back' }), state);
});

test('Back returns from a menu option to the menu before the underlying tab', () => {
  let state = navigate(initialNavigation, { type: 'tab', tab: 'settings' });
  state = navigate(state, { type: 'modal', modal: 'menu' });
  state = navigate(state, { type: 'modal', modal: 'cards' });
  state = navigate(state, { type: 'back' });
  assert.deepEqual(state.modals, ['menu']);
  state = navigate(state, { type: 'back' });
  assert.deepEqual(state.modals, []);
  assert.equal(state.tabs.at(-1), 'settings');
});

test('Choosing a tab from the menu closes overlays without resurrecting them', () => {
  let state = navigate(initialNavigation, { type: 'modal', modal: 'menu' });
  state = navigate(state, { type: 'tab', tab: 'history' });
  state = navigate(state, { type: 'modal', modal: null });
  assert.deepEqual(navigate(state, { type: 'back' }), initialNavigation);
});

test('Repeated tab selection and explicit return to menu do not create loops', () => {
  let state = navigate(initialNavigation, { type: 'tab', tab: 'board' });
  assert.deepEqual(state, initialNavigation);
  state = navigate(state, { type: 'modal', modal: 'menu' });
  state = navigate(state, { type: 'modal', modal: 'calls' });
  state = navigate(state, { type: 'modal', modal: 'menu' });
  assert.deepEqual(navigate(state, { type: 'back' }), initialNavigation);
});

test('Dismissing a dialog clears its navigation history', () => {
  let state = navigate(initialNavigation, { type: 'modal', modal: 'menu' });
  state = navigate(state, { type: 'modal', modal: 'new' });
  state = navigate(state, { type: 'modal', modal: null });
  assert.deepEqual(navigate(state, { type: 'back' }), initialNavigation);
});
