import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Typography,
  IconButton,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment
} from '@mui/material'
import {
  PhotoCamera,
  Person,
  Lock,
  Home,
  Email,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useQueryClient } from 'react-query'
import api from '../services/api'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const UserProfileModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para datos personales
  const [personalData, setPersonalData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  })
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setError('')
    setSuccess('')
  }

  const handlePersonalDataChange = (field) => (event) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handlePasswordChange = (field) => (event) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Verificar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor seleccione un archivo de imagen válido')
        return
      }
      
      // Verificar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPersonalData(prev => ({
          ...prev,
          profileImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdatePersonalData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.put('/auth/profile', {
        name: personalData.name,
        address: personalData.address,
        phone: personalData.phone,
        profileImage: personalData.profileImage
      })

      if (response.success) {
        updateUser(response.user)
        setSuccess('Datos personales actualizados correctamente')
        queryClient.invalidateQueries(['user-profile'])
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.message || 'Error al actualizar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setLoading(true)
      setError('')

      // Validaciones
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('Todos los campos son obligatorios')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Las contraseñas nuevas no coinciden')
        return
      }

      if (passwordData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres')
        return
      }

      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        setSuccess('Contraseña cambiada correctamente')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError(error.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setActiveTab(0)
    setError('')
    setSuccess('')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Person />
          <Typography variant="h6">Mi Perfil</Typography>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label="Datos Personales" 
            icon={<Person />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            label="Seguridad" 
            icon={<Lock />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ px: 3, minHeight: isMobile ? 'auto' : 400 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tab Panel - Datos Personales */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Imagen de perfil */}
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={personalData.profileImage}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '3px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {personalData.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Cambiar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </Box>
            </Grid>

            {/* Campos de datos personales */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={personalData.name}
                onChange={handlePersonalDataChange('name')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={personalData.email}
                disabled
                helperText="El email no se puede modificar"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Domicilio"
                value={personalData.address}
                onChange={handlePersonalDataChange('address')}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={personalData.phone}
                onChange={handlePersonalDataChange('phone')}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab Panel - Cambio de Contraseña */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Para cambiar tu contraseña, ingresa tu contraseña actual y luego la nueva contraseña.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showPasswords.current ? 'text' : 'password'}
                label="Contraseña Actual"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type={showPasswords.new ? 'text' : 'password'}
                label="Nueva Contraseña"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                helperText="Mínimo 6 caracteres"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type={showPasswords.confirm ? 'text' : 'password'}
                label="Confirmar Nueva Contraseña"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        
        {activeTab === 0 && (
          <Button
            variant="contained"
            onClick={handleUpdatePersonalData}
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Guardar Datos
          </Button>
        )}
        
        {activeTab === 1 && (
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            Cambiar Contraseña
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default UserProfileModal