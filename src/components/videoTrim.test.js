import test from "node:test";
import assert from "node:assert/strict";
import { clipName, formatTime, getVideoFormat, MAX_VIDEO_BYTES, trimArguments } from "./videoTrim.js";

test("accepts supported video containers regardless of extension case", () => {
  assert.deepEqual(getVideoFormat("my.clip.MP4"), { extension: "mp4", type: "video/mp4" });
  assert.equal(getVideoFormat("clip.txt"), null);
  assert.equal(MAX_VIDEO_BYTES, 250 * 1024 * 1024);
});

test("formats elapsed time and preserves source container in output name", () => {
  assert.equal(formatTime(62.345), "01:02.35");
  assert.equal(formatTime(3601.2), "1:00:01.20");
  assert.equal(clipName("trip.final.MP4", "mp4"), "trip.final-clip.mp4");
});

test("seeks at input so stream copy retains the decodable starting GOP", () => {
  assert.deepEqual(trimArguments(12.25, 18.75, "webm"), [
    "-ss", "12.250", "-noaccurate_seek", "-i", "source.webm", "-t", "6.500",
    "-map", "0", "-c", "copy", "-avoid_negative_ts", "make_zero", "clip.webm",
  ]);
});

test("rejects invalid clip boundaries and unsupported containers", () => {
  assert.throws(() => trimArguments(3, 3, "mp4"));
  assert.throws(() => trimArguments(-1, 2, "mp4"));
  assert.throws(() => trimArguments(NaN, 2, "mp4"));
  assert.throws(() => trimArguments(0, 2, "avi"));
});
