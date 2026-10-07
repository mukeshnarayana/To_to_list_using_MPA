import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Middleware plugin to support clean URLs like /signup or /signin during dev
function mpaRewritePlugin() {
  return {
    name: 'mpa-rewrite-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url.split('?')[0];
        if (path === '/signup') {
          req.url = req.url.replace('/signup', '/signup.html');
        } else if (path === '/signin') {
          req.url = req.url.replace('/signin', '/signin.html');
        } else if (path === '/todo') {
          req.url = req.url.replace('/todo', '/todo.html');
        } else if (path === '/profile') {
          req.url = req.url.replace('/profile', '/profile.html');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mpaRewritePlugin()],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        signup: resolve(__dirname, 'signup.html'),
        signin: resolve(__dirname, 'signin.html'),
        todo: resolve(__dirname, 'todo.html'),
        profile: resolve(__dirname, 'profile.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});
