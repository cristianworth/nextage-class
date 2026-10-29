import { useState } from 'react'
import { loadBrowserWorkspace, saveWorkspace } from './workspace-storage'
import type { Workspace } from '../domain/models'
import { createDemo } from '../domain/demo'
import { createPublicDemo } from '../domain/public-demo'
import { isPublicDemo } from '../app/mode'
import { savePublicWorkspace } from './public-demo-storage'

export function useWorkspace() {
  const [loaded, setLoaded] = useState(loadBrowserWorkspace)

  function commit(next: Workspace) {
    if (isPublicDemo) {
      const demoCreatedAt = loaded.demoCreatedAt ?? new Date().toISOString()
      savePublicWorkspace(window.localStorage, next, demoCreatedAt)
      setLoaded({ state: next, error: null, demoCreatedAt })
    } else {
      saveWorkspace(window.localStorage, next)
      setLoaded({ state: next, error: null })
    }
  }

  function restoreExamples() {
    const now = new Date()
    if (isPublicDemo) {
      const state = createPublicDemo(now)
      const demoCreatedAt = now.toISOString()
      savePublicWorkspace(window.localStorage, state, demoCreatedAt)
      setLoaded({ state, error: null, demoCreatedAt })
    } else {
      commit(createDemo(now))
    }
  }

  return { ...loaded, commit, restoreExamples }
}
