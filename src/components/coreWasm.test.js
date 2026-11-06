import test from "node:test";
import assert from "node:assert/strict";
import { loadCoreWasm } from "./coreWasm.js";

test("development loads the original WASM URL", async () => {
  const core = await loadCoreWasm("/assets/core.wasm", false);
  assert.equal(core.url, "/assets/core.wasm");
  core.release();
});

test("production reassembles all WASM parts in order", async (context) => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    if (url.endsWith(".parts.json")) return new Response(JSON.stringify({ count: 3 }));
    const part = Number(url.slice(-1));
    return new Response(Uint8Array.of(part + 1));
  };
  context.after(() => { globalThis.fetch = originalFetch; });

  const core = await loadCoreWasm("/assets/core.wasm", true);
  assert.deepEqual(requests, [
    "/assets/core.wasm.parts.json",
    "/assets/core.wasm.part0",
    "/assets/core.wasm.part1",
    "/assets/core.wasm.part2",
  ]);
  assert.deepEqual(new Uint8Array(await originalFetch(core.url).then((response) => response.arrayBuffer())), Uint8Array.of(1, 2, 3));
  core.release();
});

test("production fails clearly if an asset is missing", async (context) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => url.endsWith(".parts.json")
    ? new Response(JSON.stringify({ count: 2 }))
    : new Response(null, { status: 404 });
  context.after(() => { globalThis.fetch = originalFetch; });

  await assert.rejects(loadCoreWasm("/assets/core.wasm", true), /Could not load the local video engine/);
});
