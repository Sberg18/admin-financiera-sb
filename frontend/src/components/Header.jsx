import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle,
  Person,
  Settings,
  MoreVert
} from '@mui/icons-material'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import UserProfileModal from './UserProfileModal'

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { logout, user } = useAuth()
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false)
    logout()
  }

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false)
  }

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true)
    handleProfileMenuClose()
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
          
          {/* Menú de perfil */}
          <IconButton 
            onClick={handleProfileMenuOpen}
            color="inherit"
            size={isMobile ? "small" : "medium"}
            title="Mi perfil"
          >
            {user?.profileImage ? (
              <Avatar 
                src={user.profileImage} 
                sx={{ 
                  width: isMobile ? 28 : 32, 
                  height: isMobile ? 28 : 32 
                }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Menú desplegable de perfil */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="textSecondary">
            Bienvenido
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {user?.name || user?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleOpenProfileModal}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => { handleProfileMenuClose(); handleLogoutClick(); }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modal de perfil */}
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Dialog de confirmación para logout */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCancelLogout}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirmar cierre de sesión
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea cerrar su sesión? Deberá iniciar sesión nuevamente para acceder a sus datos financieros.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelLogout}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
            autoFocus
          >
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}

export default Header