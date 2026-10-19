import { test } from 'node:test';
import assert from 'node:assert/strict';
import { touchPoints } from '../src/touch.ts';

test('tap tolerates small finger movement but not a drag returning to its start', () => {
  assert.equal(touchPoints(0, 0, 0), 1);
  assert.equal(touchPoints(4, 5, 7), 1);
  assert.equal(touchPoints(0, 0, 60), 0);
  assert.equal(touchPoints(12, 0, 12), 0);
});
test('only a clear downward swipe subtracts one point', () => {
  assert.equal(touchPoints(0, 35, 35), -1);
  assert.equal(touchPoints(10, 70, 71), -1);
  assert.equal(touchPoints(0, 34, 34), 0);
  assert.equal(touchPoints(70, 10, 71), 0);
  assert.equal(touchPoints(0, -70, 70), 0);
  assert.equal(touchPoints(35, 35, 50), 0);
  assert.equal(touchPoints(NaN, 40, 40), 0);
});
