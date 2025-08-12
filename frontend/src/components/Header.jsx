import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  Logout
} from '@mui/icons-material'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))

  const handleLogout = () => {
    logout()
  }

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img 
            src="/logo_arman.jpeg" 
            alt="Arman Solutions Logo" 
            style={{ 
              height: isMobile ? '32px' : '40px',
              width: isMobile ? '32px' : '40px',
              borderRadius: '4px'
            }} 
          />
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="h1"
              sx={{ 
                fontWeight: 700,
                color: 'white',
                lineHeight: 1
              }}
            >
              Arman Finance
            </Typography>
            {!isMobile && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  display: 'block',
                  lineHeight: 1,
                  mt: 0.5
                }}
              >
                by Arman Solutions
              </Typography>
            )}
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            size={isMobile ? "small" : "medium"}
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          <IconButton 
            onClick={handleLogout} 
            color="inherit"
            size={isMobile ? "small" : "medium"}
            title="Cerrar sesión"
          >
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header