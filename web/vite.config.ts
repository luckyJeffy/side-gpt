import { defineConfig } from 'vite';
import { join } from 'path'

import react from '@vitejs/plugin-react';

function getPathAliasEntries(entriesRecord: Record<string, string>) {
  return Object.entries(entriesRecord).reduce((acc, [aliasName, relativePath]) => {
    acc[aliasName] = join(__dirname, relativePath)
    return acc
  }, entriesRecord)
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/chat': {
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
      },
    }
  },
  resolve: {
    alias: getPathAliasEntries({
      '@': 'src/',
    }),
  },
  plugins: [react()],
});
