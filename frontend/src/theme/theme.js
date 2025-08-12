import { createTheme } from '@mui/material/styles'

// Colores extraídos del logo de Arman Solutions
const armanColors = {
  primary: '#7B68EE',      // Púrpura principal del logo
  primaryDark: '#6A5ACD',   // Púrpura más oscuro
  primaryLight: '#9370DB',  // Púrpura más claro
  secondary: '#8A7FE8',     // Variación secundaria
  accent: '#B8B0FF'         // Accent color suave
}

// Tema claro
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: armanColors.primary,
      dark: armanColors.primaryDark,
      light: armanColors.primaryLight,
    },
    secondary: {
      main: armanColors.secondary,
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: armanColors.primary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

// Tema oscuro
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: armanColors.primaryLight,
      dark: armanColors.primary,
      light: armanColors.accent,
    },
    secondary: {
      main: armanColors.accent,
    },
    success: {
      main: '#66BB6A',
    },
    error: {
      main: '#EF5350',
    },
    warning: {
      main: '#FFA726',
    },
    info: {
      main: '#42A5F5',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: armanColors.primaryDark,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})