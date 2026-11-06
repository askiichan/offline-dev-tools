import assert from "node:assert/strict";
import test from "node:test";
import { commonDuration, comparisonTime } from "./comparePlayback.js";

test("comparison ends at the shorter video's duration", () => {
  assert.equal(commonDuration([12, 8]), 8);
  assert.equal(commonDuration([0, 8]), 0);
  assert.equal(commonDuration([Infinity, 8]), 0);
});

test("seeking stays inside the shared timeline", () => {
  assert.equal(comparisonTime(10, 8), 8);
  assert.equal(comparisonTime(-3, 8), 0);
  assert.equal(comparisonTime(NaN, 8), 0);
});
