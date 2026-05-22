import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  // Dual publish: ESM + CJS, with type declarations for both.
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Headless core: zero runtime dependencies, nothing to externalize.
})
