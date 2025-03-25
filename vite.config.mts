import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import eslint from '@nabla/vite-plugin-eslint';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [react(), mode !== 'test' && eslint()],
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
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*'],
      provider: 'istanbul',
    },
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
}));
