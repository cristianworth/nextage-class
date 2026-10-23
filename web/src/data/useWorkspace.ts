import { useState } from 'react'
import { loadBrowserWorkspace, saveWorkspace } from './workspace-storage'
import type { Workspace } from '../domain/models'

export function useWorkspace() {
  const [loaded, setLoaded] = useState(loadBrowserWorkspace)

  function commit(next: Workspace) {
    saveWorkspace(window.localStorage, next)
    setLoaded({ state: next, error: null })
  }

  return { ...loaded, commit }
}
