import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Administración Financiera
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Hola, {user?.firstName}!
          </Typography>
          <Button color="inherit" onClick={logout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout