import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    'react/index': 'src/react/index.ts',
    'compat/index': 'src/compat/index.tsx',
    'adapters/emoji-mart': 'src/adapters/emoji-mart.ts',
    'adapters/emojibase': 'src/adapters/emojibase.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  outputOptions: (options, format) =>
    format === 'cjs' ? { ...options, exports: 'named' } : options,
  deps: {
    neverBundle: ['react', 'react-dom', '@emoji-mart/data', 'emojibase-data'],
  },
});
