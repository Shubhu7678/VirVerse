import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'virvese:theme'
const PALETTE_KEY = 'virvese:palette'
const ThemeContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const PALETTES = [
  { id: 'violet', name: 'Violet', color: '#6366f1' },
  { id: 'blue', name: 'Ocean blue', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'orange', name: 'Sunset orange', color: '#f97316' },
  { id: 'rose', name: 'Ruby rose', color: '#f43f5e' },
]

// Dark is the default; an existing saved choice (including the old editor-theme key) wins.
function readInitial() {
  try {
    return localStorage.getItem(KEY) || localStorage.getItem('virvese:editor-theme') || 'dark'
  } catch {
    return 'dark'
  }
}

function readInitialPalette() {
  try {
    const saved = localStorage.getItem(PALETTE_KEY)
    return PALETTES.some(({ id }) => id === saved) ? saved : 'violet'
  } catch {
    return 'violet'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitial)
  const [palette, setPaletteState] = useState(readInitialPalette)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.palette = palette
  }, [palette])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // storage unavailable: the theme still applies for this session
    }
  }, [])

  const setPalette = useCallback((next) => {
    if (!PALETTES.some(({ id }) => id === next)) {
      throw new Error(`Unknown color palette: ${next}`)
    }
    setPaletteState(next)
    try {
      localStorage.setItem(PALETTE_KEY, next)
    } catch {
      // storage unavailable: the palette still applies for this session
    }
  }, [])

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])
  const value = useMemo(
    () => ({ theme, setTheme, toggle, palette, setPalette }),
    [theme, setTheme, toggle, palette, setPalette],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
