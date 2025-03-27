import { expect, test } from 'bun:test';

function sum(a: number, b: number): number {
  return a + b;
}

console.info('HELLO WORLD FROM BUN TEST');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
