import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_')
  if (
    environment.VITE_APP_MODE === 'pilot' &&
    environment.VITE_SUPABASE_PUBLISHABLE_KEY &&
    !environment.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')
  )
    throw new Error(
      'Use somente uma chave publicável em VITE_SUPABASE_PUBLISHABLE_KEY. Chaves administrativas não podem entrar no cliente.',
    )
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: { '/api': 'http://127.0.0.1:5080' },
    },
    test: { include: ['src/**/*.test.ts'] },
  }
})
