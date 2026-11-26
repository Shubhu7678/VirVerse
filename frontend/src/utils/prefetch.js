import { prefetch } from '../hooks/useAsync'
import { fetchOverview } from '../api/tasks'
import { fetchSubmissions } from '../api/execute'

const done = new Set()
const once = (name, fn) => {
  if (done.has(name)) return
  done.add(name)
  fn().catch(() => done.delete(name))
}

// Called when a link is hovered or focused: loads the page's code and data before it is clicked.
export function prefetchRoute(path = '') {
  if (path === '/dashboard') {
    prefetch('overview', fetchOverview)
    prefetch('recent-submissions-5', () => fetchSubmissions(5))
  } else if (path === '/submissions') {
    prefetch('submissions', fetchSubmissions)
  } else if (path === '/python/guide') {
    once('guide', () => import('../pages/PythonGuide'))
  } else if (path.endsWith('/playground')) {
    once('playground', () => import('../pages/Playground'))
  } else if (/\/(topics|practice|completed)$|^\/(tasks|javascript|python)$/.test(path)) {
    // The next click is usually a question, so have the editor ready.
    once('task-editor', () => import('../pages/TaskDetail'))
  } else if (path.startsWith('/admin')) {
    once('admin', () => import('../pages/admin/Students'))
  }
}
