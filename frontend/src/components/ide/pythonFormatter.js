let workspacePromise

export async function formatPythonCode(code) {
  if (!workspacePromise) {
    workspacePromise = (async () => {
      const { default: initialize, PositionEncoding, Workspace } = await import('@astral-sh/ruff-wasm-web')
      await initialize()
      return new Workspace({
        'line-length': 88,
        'indent-width': 4,
        format: {
          'indent-style': 'space',
          'quote-style': 'double',
        },
      }, PositionEncoding.UTF16)
    })().catch((error) => {
      workspacePromise = undefined
      throw error
    })
  }

  const workspace = await workspacePromise
  return workspace.format(code)
}
