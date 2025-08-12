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
  CircularProgress,
  Grid
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()

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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    
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
            Crear Cuenta
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
            Únete para gestionar tus finanzas de manera inteligente
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="Nombre"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Apellido"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage