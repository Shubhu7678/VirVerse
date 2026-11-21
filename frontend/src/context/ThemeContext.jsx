import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'virvese:theme'
const ThemeContext = createContext(null)

// Dark is the default; an existing saved choice (including the old editor-theme key) wins.
function readInitial() {
  try {
    const saved = localStorage.getItem(KEY) || localStorage.getItem('virvese:editor-theme')
    return saved === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // storage unavailable: the theme still applies for this session
    }
  }, [])

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])
  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
