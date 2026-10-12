/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O app é publicado em https://<usuario>.github.io/vitrine-dummyjson/,
// então todos os assets e rotas precisam desse prefixo. Usamos o mesmo base
// em dev, preview e build para que os links se comportem igual em todo lugar.
export default defineConfig({
  base: '/vitrine-dummyjson/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa as bibliotecas em chunks próprios (melhor cache entre deploys).
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications'],
          data: ['axios', 'zod'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
