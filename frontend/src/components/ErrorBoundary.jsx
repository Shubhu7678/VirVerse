import { Component } from 'react'

// Keeps one broken page from blanking the whole app.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-semibold text-fg">Something went wrong</h2>
        <p className="text-sm text-fg-muted">This page hit an unexpected problem. Your saved code is safe. Reloading usually fixes it.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-control bg-accent px-4 py-2 text-sm font-medium text-white">
          Reload page
        </button>
      </div>
    )
  }
}
