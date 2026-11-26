import assert from "node:assert/strict";
import test from "node:test";
import { addDrop, advanceRound, FALL_MS, newRound } from "../src/round.js";
import { needsMotion, renderFront } from "../src/render.js";
import { SHAPES } from "../src/shapes.js";

function rows(bitmap) {
  const lines = bitmap.split("\n");
  return lines.slice(2 + Number(lines[1].split(" ")[2]));
}

test("each rapid tap reserves one slot and landing alone advances the counter", () => {
  const round = newRound();
  assert.equal(addDrop(round, 3, 100), true);
  assert.equal(addDrop(round, 3, 101), true);
  assert.equal(addDrop(round, 3, 102), true);
  assert.equal(addDrop(round, 3, 103), false);
  assert.equal(round.filled, 0);
  advanceRound(round, 3, 100 + FALL_MS - 1);
  assert.equal(round.filled, 0);
  advanceRound(round, 3, 100 + FALL_MS);
  assert.equal(round.filled, 1);
  assert.equal(round.completedAt, null);
  const finalLandingAt = round.pending[1] + FALL_MS;
  advanceRound(round, 3, finalLandingAt + 80);
  assert.equal(round.filled, 3);
  assert.equal(round.completedAt, finalLandingAt);
  assert.equal(round.pending.length, 0);
  assert.equal(addDrop(round, 3, finalLandingAt + 81), false);
});

test("completion waits for the last pixel to land even after returning to a shape", () => {
  const round = newRound();
  const other = newRound();
  addDrop(round, 1, 500);
  advanceRound(other, 1, 1500);
  assert.deepEqual(other, newRound());
  advanceRound(round, 1, 1500);
  assert.equal(round.completedAt, 500 + FALL_MS);
  assert.deepEqual(newRound(), { filled: 0, pending: [], completedAt: null });
});

test("each silhouette uses unique bottom-up fill slots and fits the display", () => {
  assert.equal(new Set(SHAPES.map(({ id }) => id)).size, 8);
  for (const shape of SHAPES) {
    assert.ok(shape.slots.length >= 18, shape.name);
    assert.ok(shape.offsetY + shape.rows.length <= 16, shape.name);
    assert.ok(shape.rows.every((row) => row.length === shape.width), shape.name);
    assert.equal(new Set(shape.slots.map(({ x, y }) => x + ":" + y)).size, shape.slots.length);
    shape.slots.forEach(({ x, y }, index) => {
      assert.match(shape.rows[y][x], /[+*]/);
      assert.equal(shape.order[y][x], index);
      if (index) assert.ok(shape.slots[index - 1].y >= y);
    });
  }
});

test("a reserved heart pixel is visible in the air before it becomes part of the heart", () => {
  const heart = SHAPES[0];
  const round = newRound();
  addDrop(round, heart.slots.length, 0);
  assert.equal(rows(renderFront(heart, round, 0))[0].replace(/[^A]/g, ""), "A");
  advanceRound(round, heart.slots.length, FALL_MS);
  assert.equal(round.filled, 1);
  assert.ok(rows(renderFront(heart, round, FALL_MS)).every((row) => !row.includes("A")));
});

test("every reveal changes pixels and only the finite scenes stop redrawing", () => {
  for (const shape of SHAPES) {
    const done = { filled: shape.slots.length, pending: [], completedAt: 0 };
    const opening = renderFront(shape, done, 0);
    const moved = renderFront(shape, done, 700);
    assert.notEqual(opening, moved, shape.name);
    assert.ok(rows(opening).length === 16 && rows(opening).every((row) => row.length === 72), shape.name);
    const finite = ["popcorn", "rocket", "flower"].includes(shape.id);
    assert.equal(needsMotion(shape, done, 4800), !finite);
    if (finite) assert.equal(renderFront(shape, done, 4800), renderFront(shape, done, 5000));
  }
});
