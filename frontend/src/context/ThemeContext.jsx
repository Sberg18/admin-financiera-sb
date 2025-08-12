import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '../theme/theme'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Leer preferencia guardada o usar preferencia del sistema
    const savedTheme = localStorage.getItem('arman-finance-theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Detectar preferencia del sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode
      localStorage.setItem('arman-finance-theme', newMode ? 'dark' : 'light')
      return newMode
    })
  }

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Solo cambiar si no hay preferencia guardada
      if (!localStorage.getItem('arman-finance-theme')) {
        setIsDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const theme = isDarkMode ? darkTheme : lightTheme

  const value = {
    isDarkMode,
    toggleTheme,
    theme
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}