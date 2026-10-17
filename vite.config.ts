import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // относительные пути — сборку можно разместить в любой папке веб-сервера
  base: './',
  server: { port: 5173 },
  css: {
    modules: {
      // БЭМ-имя класса остаётся читаемым в DOM: sidebar__item--active_x1y2z
      generateScopedName: '[local]_[hash:base64:5]',
    },
  },
});
