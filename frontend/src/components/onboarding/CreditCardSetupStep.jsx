import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Paper,
  Chip
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../../services/api'

const CreditCardSetupStep = ({ onNext }) => {
  const [creditCards, setCreditCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    bankId: '',
    cardTypeId: 1, // Visa por defecto
    cardName: '',
    lastFourDigits: '',
    closingDay: 31,
    paymentDay: 10,
    creditLimit: ''
  })

  const { data: banks } = useQuery(['banks'], async () => {
    const response = await api.get('/onboarding/banks')
    return response.banks
  })

  const cardTypes = [
    { id: 1, name: 'Visa' },
    { id: 2, name: 'Mastercard' },
    { id: 3, name: 'American Express' }
  ]

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const addCreditCard = async () => {
    if (!formData.bankId || !formData.cardName) return

    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null
      }

      const response = await api.post('/onboarding/credit-cards', submitData)
      
      setCreditCards([...creditCards, { 
        ...response.creditCard, 
        bank: banks.find(b => b.id === formData.bankId),
        cardType: cardTypes.find(c => c.id === formData.cardTypeId)
      }])
      
      // Reset form
      setFormData({
        bankId: '',
        cardTypeId: 1,
        cardName: '',
        lastFourDigits: '',
        closingDay: 31,
        paymentDay: 10,
        creditLimit: ''
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Error al agregar tarjeta de crédito')
    } finally {
      setLoading(false)
    }
  }

  const removeCreditCard = async (id) => {
    try {
      await api.delete(`/onboarding/credit-cards/${id}`)
      setCreditCards(creditCards.filter(card => card.id !== id))
    } catch (error) {
      setError('Error al eliminar tarjeta de crédito')
    }
  }

  const commonCardNames = [
    'Tarjeta Principal',
    'Tarjeta Oro',
    'Tarjeta Platinum',
    'Tarjeta Black',
    'Tarjeta Empresarial',
    'Tarjeta Universitaria'
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configura tus Tarjetas de Crédito
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Registra tus tarjetas de crédito para un mejor control de gastos y cuotas.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        💡 <strong>Días por defecto:</strong> Si no conoces las fechas exactas, no te preocupes. 
        Usaremos día de cierre <strong>31</strong> y día de pago <strong>10</strong> como valores por defecto.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Agregar Nueva Tarjeta
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select
                value={formData.bankId}
                onChange={handleChange('bankId')}
                label="Banco"
              >
                {banks?.map((bank) => (
                  <MenuItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Tarjeta</InputLabel>
              <Select
                value={formData.cardTypeId}
                onChange={handleChange('cardTypeId')}
                label="Tipo de Tarjeta"
              >
                {cardTypes.map((cardType) => (
                  <MenuItem key={cardType.id} value={cardType.id}>
                    {cardType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth>
              <InputLabel>Nombre de la Tarjeta</InputLabel>
              <Select
                value={formData.cardName}
                onChange={handleChange('cardName')}
                label="Nombre de la Tarjeta"
              >
                {commonCardNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Últimos 4 dígitos"
              value={formData.lastFourDigits}
              onChange={handleChange('lastFourDigits')}
              inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Día de Cierre (opcional)"
              type="number"
              value={formData.closingDay}
              onChange={handleChange('closingDay')}
              inputProps={{ min: 1, max: 31 }}
              helperText="Por defecto: 31"
              placeholder="31"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Día de Pago (opcional)"
              type="number"
              value={formData.paymentDay}
              onChange={handleChange('paymentDay')}
              inputProps={{ min: 1, max: 31 }}
              helperText="Por defecto: 10"
              placeholder="10"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Límite de Crédito (opcional)"
              type="number"
              value={formData.creditLimit}
              onChange={handleChange('creditLimit')}
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addCreditCard}
              disabled={loading || !formData.bankId || !formData.cardName}
              fullWidth
            >
              Agregar Tarjeta
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {creditCards.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tarjetas Configuradas ({creditCards.length})
          </Typography>
          <List>
            {creditCards.map((card) => (
              <ListItem key={card.id}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {card.cardName}
                      </Typography>
                      <Chip 
                        label={cardTypes.find(c => c.id === card.cardTypeId)?.name || 'Visa'} 
                        size="small" 
                        color="primary" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {card.bank?.name || 'Banco no especificado'}
                        {card.lastFourDigits && ` • **** ${card.lastFourDigits}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cierre: {card.closingDay} | Pago: {card.paymentDay}
                        {card.creditLimit && ` | Límite: $${parseFloat(card.creditLimit).toLocaleString()}`}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeCreditCard(card.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={onNext}
              fullWidth
              size="large"
            >
              Continuar con Activos e Inversiones
            </Button>
          </Box>
        </Paper>
      )}

      {creditCards.length === 0 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Puedes agregar tus tarjetas de crédito más tarde si prefieres continuar
          </Typography>
          <Button
            variant="outlined"
            onClick={onNext}
          >
            Saltar este paso
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default CreditCardSetupStep