export async function loadCoreWasm(url, isProduction, signal) {
  if (!isProduction) return { url, release() {} };

  const manifest = await fetch(`${url}.parts.json`, { signal });
  if (!manifest.ok) throw new Error("Could not load the local video engine. Refresh and try again.");
  const { count } = await manifest.json();
  if (!Number.isInteger(count) || count < 1) throw new Error("The video engine assets are incomplete. Refresh and try again.");

  const parts = await Promise.all(Array.from({ length: count }, async (_, part) => {
    const response = await fetch(`${url}.part${part}`, { signal });
    if (!response.ok) throw new Error("Could not load the local video engine. Refresh and try again.");
    return response.blob();
  }));
  const blobURL = URL.createObjectURL(new Blob(parts, { type: "application/wasm" }));
  return { url: blobURL, release: () => URL.revokeObjectURL(blobURL) };
}
