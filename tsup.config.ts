import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/cmd.ts'],
  outDir: 'dist',
  platform: 'node',
  format: 'cjs',
});
