import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <img 
              src="/logo_arman.jpeg" 
              alt="Arman Solutions Logo" 
              style={{ 
                height: '60px',
                width: '60px',
                borderRadius: '8px',
                marginBottom: '16px'
              }} 
            />
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Arman Finance
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary">
              Gestión Financiera Personal
            </Typography>
            <Typography variant="caption" align="center" color="textSecondary">
              by Arman Solutions
            </Typography>
          </Box>
          
          <Typography variant="h6" align="center" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Iniciar Sesión
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                ¿No tienes cuenta?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage