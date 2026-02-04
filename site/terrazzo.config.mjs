import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
export default defineConfig({
  tokens: ['./tokens.json'],
  plugins: [
    css(),
  ],
  outDir: './dist/',
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});