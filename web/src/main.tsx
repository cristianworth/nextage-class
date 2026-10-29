import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles.css'
import './features.css'

const RootApp =
  import.meta.env.MODE !== 'public-demo' && import.meta.env.VITE_APP_MODE === 'pilot'
    ? lazy(() => import('./app/PilotApp'))
    : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Carregando…</p>}>
      <RootApp />
    </Suspense>
  </StrictMode>,
)
