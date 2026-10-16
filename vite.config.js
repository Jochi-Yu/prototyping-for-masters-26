import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { bookshelfMiddleware } from './server/bookshelf.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    plugins: [{
      name: 'bookshelf-api',
      configureServer(server) { server.middlewares.use(bookshelfMiddleware(env)); },
      configurePreviewServer(server) { server.middlewares.use(bookshelfMiddleware(env)); },
    }],
    build: { rollupOptions: { input: {
      main: resolve('index.html'), bookshelf: resolve('prototypes/my-bookshelf/index.html'),
    } } },
  };
});
