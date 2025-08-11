import React from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  AccountBalance,
  CreditCard,
  TrendingUp,
  Assessment,
  Security
} from '@mui/icons-material'

const WelcomeStep = ({ user }) => {
  const features = [
    {
      icon: <AccountBalance color="primary" />,
      title: 'Gestión de Ingresos',
      description: 'Registra tus sueldos, freelance y otros ingresos'
    },
    {
      icon: <CreditCard color="primary" />,
      title: 'Control de Gastos',
      description: 'Maneja gastos en efectivo y con tarjetas de crédito'
    },
    {
      icon: <TrendingUp color="primary" />,
      title: 'Activos e Inversiones',
      description: 'Trackea acciones, bonos, dólares y criptomonedas'
    },
    {
      icon: <Assessment color="primary" />,
      title: 'Reportes Detallados',
      description: 'Visualiza tu situación financiera con gráficos y resúmenes'
    }
  ]

  return (
    <Box>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          ¡Hola {user?.firstName}!
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Estás a unos pasos de tener el control total de tus finanzas personales
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Security sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Seguridad Garantizada
                </Typography>
                <Typography variant="body2">
                  Todos tus datos están encriptados y seguros. Solo tú tienes acceso a tu información financiera.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default WelcomeStep