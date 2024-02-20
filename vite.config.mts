import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import graphqlLoader from "vite-plugin-graphql-loader";

export default ({mode}) => {

  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
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
  });
}
