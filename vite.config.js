import { Buffer } from 'node:buffer'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const WASM_PART_SIZE = 20 * 1024 * 1024

function splitLargeWasm() {
  return {
    name: 'split-large-wasm-for-pages',
    generateBundle(_options, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !fileName.endsWith('.wasm')) continue
        const bytes = Buffer.from(asset.source)
        if (bytes.length <= WASM_PART_SIZE) continue

        for (let offset = 0, part = 0; offset < bytes.length; offset += WASM_PART_SIZE, part++) {
          this.emitFile({
            type: 'asset',
            fileName: `${fileName}.part${part}`,
            source: bytes.subarray(offset, offset + WASM_PART_SIZE),
          })
        }
        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.parts.json`,
          source: JSON.stringify({ count: Math.ceil(bytes.length / WASM_PART_SIZE) }),
        })
        delete bundle[fileName]
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), splitLargeWasm()],
})
