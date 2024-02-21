import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import graphqlLoader from 'vite-plugin-graphql-loader';

export default defineConfig({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [react(), nodePolyfills(), graphqlLoader(), eslint()],
  build: {
    outDir: './build',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*'],
      provider: 'istanbul',
    },
  },
});
