import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
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
  Divider
} from '@mui/material'
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import api from '../services/api'

const ManageCreditCardsModal = ({ open, onClose }) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Función para formatear las fechas de cierre y vencimiento
  const formatCardDates = (closingDay, paymentDay) => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11
    
    // Mes de cierre (generalmente el mes actual)
    const closingMonth = currentMonth
    
    // Mes de vencimiento (generalmente el mes siguiente)
    let paymentMonth = currentMonth + 1
    if (paymentMonth > 12) {
      paymentMonth = 1
    }
    
    return {
      closing: `${closingDay}/${closingMonth.toString().padStart(2, '0')}`,
      payment: `${paymentDay}/${paymentMonth.toString().padStart(2, '0')}`
    }
  }
  
  // Función para obtener el último viernes del mes
  const getLastFridayOfMonth = (date = new Date()) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const lastDay = new Date(year, month + 1, 0) // Último día del mes
    
    // Encontrar el último viernes
    let lastFriday = lastDay
    while (lastFriday.getDay() !== 5) { // 5 = viernes
      lastFriday.setDate(lastFriday.getDate() - 1)
    }
    return lastFriday.getDate()
  }

  // Función para obtener el segundo lunes del mes siguiente
  const getSecondMondayOfNextMonth = (date = new Date()) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDayNextMonth = new Date(year, month + 1, 1)
    
    // Encontrar el primer lunes
    let firstMonday = firstDayNextMonth
    while (firstMonday.getDay() !== 1) { // 1 = lunes
      firstMonday.setDate(firstMonday.getDate() + 1)
    }
    
    // El segundo lunes es 7 días después
    const secondMonday = new Date(firstMonday)
    secondMonday.setDate(firstMonday.getDate() + 7)
    return secondMonday.getDate()
  }

  const [formData, setFormData] = useState({
    bankId: '',
    cardTypeId: 1, // Visa por defecto
    cardName: '',
    lastFourDigits: '',
    closingDay: getLastFridayOfMonth(),
    paymentDay: getSecondMondayOfNextMonth(),
    creditLimit: '',
    cardMode: 'credit' // Por defecto crédito
  })

  // Queries
  const { data: creditCards } = useQuery(
    ['creditCards'],
    async () => {
      const response = await api.get('/onboarding/credit-cards')
      return response.creditCards || []
    }
  )

  const { data: banks } = useQuery(
    ['banks'],
    async () => {
      const response = await api.get('/onboarding/banks')
      return response.banks || []
    }
  )

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

  const handleAddCard = async () => {
    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        closingDay: parseInt(formData.closingDay),
        paymentDay: parseInt(formData.paymentDay),
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null
      }

      await api.post('/onboarding/credit-cards', submitData)
      
      // Reset form
      setFormData({
        bankId: '',
        cardTypeId: 1,
        cardName: '',
        lastFourDigits: '',
        closingDay: getLastFridayOfMonth(),
        paymentDay: getSecondMondayOfNextMonth(),
        creditLimit: '',
        cardMode: 'credit'
      })
      
      setShowAddForm(false)
      queryClient.invalidateQueries(['creditCards'])
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error al agregar tarjeta de crédito')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCard = async (cardId, cardName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarjeta ${cardName}?`)) {
      try {
        await api.delete(`/onboarding/credit-cards/${cardId}`)
        queryClient.invalidateQueries(['creditCards'])
      } catch (error) {
        console.error('Error deleting card:', error)
        setError('Error al eliminar la tarjeta')
      }
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setShowAddForm(false)
      setError('')
      setFormData({
        bankId: '',
        cardTypeId: 1,
        cardName: '',
        lastFourDigits: '',
        closingDay: getLastFridayOfMonth(),
        paymentDay: getSecondMondayOfNextMonth(),
        creditLimit: '',
        cardMode: 'credit'
      })
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Gestionar Tarjetas de Crédito</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Lista de tarjetas existentes */}
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mis Tarjetas ({creditCards?.length || 0})
            </Typography>
            
            {creditCards && creditCards.length > 0 ? (
              <List>
                {creditCards.map((card) => (
                  <ListItem key={card.id} divider>
                    <ListItemText
                      primary={`${card.cardType?.name} ${card.cardMode === 'debit' ? 'Débito' : 'Crédito'} ${card.bank?.name} ****${card.lastFourDigits}`}
                      secondary={
                        card.cardMode === 'debit'
                          ? card.cardName
                          : (() => {
                              const dates = formatCardDates(card.closingDay, card.paymentDay)
                              return `${card.cardName} • Límite: $${parseFloat(card.creditLimit || 0).toLocaleString()} • Cierre ${dates.closing} • Vto: ${dates.payment}`
                            })()
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        color="error"
                        onClick={() => handleDeleteCard(card.id, `${card.cardType?.name} ${card.bank?.name} ****${card.lastFourDigits}`)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No tienes tarjetas registradas aún
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Botón para agregar nueva tarjeta */}
        {!showAddForm ? (
          <Box textAlign="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              size="large"
            >
              Agregar Nueva Tarjeta
            </Button>
          </Box>
        ) : (
          /* Formulario para agregar tarjeta */
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nueva Tarjeta {formData.cardMode === 'credit' ? 'de Crédito' : 'de Débito'}
            </Typography>
            
            {formData.cardMode === 'credit' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                📅 <strong>Fechas calculadas automáticamente:</strong><br/>
                • <strong>Día de cierre:</strong> {getLastFridayOfMonth()} (último viernes del mes)<br/>
                • <strong>Día de vencimiento:</strong> {getSecondMondayOfNextMonth()} (segundo lunes del mes siguiente)<br/>
                <em>Puedes modificar estos valores si tu tarjeta tiene fechas diferentes.</em>
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
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
                <FormControl fullWidth required>
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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Modalidad</InputLabel>
                  <Select
                    value={formData.cardMode}
                    onChange={handleChange('cardMode')}
                    label="Modalidad"
                  >
                    <MenuItem value="credit">Crédito</MenuItem>
                    <MenuItem value="debit">Débito</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de la tarjeta"
                  value={formData.cardName}
                  onChange={handleChange('cardName')}
                  placeholder="ej: Tarjeta Black"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Últimos 4 dígitos"
                  value={formData.lastFourDigits}
                  onChange={handleChange('lastFourDigits')}
                  placeholder="1234"
                  inputProps={{ maxLength: 4, pattern: "[0-9]*" }}
                />
              </Grid>

              {formData.cardMode === 'credit' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Día de cierre"
                      value={formData.closingDay}
                      onChange={handleChange('closingDay')}
                      InputProps={{ inputProps: { min: 1, max: 31 } }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Día de vencimiento"
                      value={formData.paymentDay}
                      onChange={handleChange('paymentDay')}
                      InputProps={{ inputProps: { min: 1, max: 31 } }}
                      required
                    />
                  </Grid>
                </>
              )}

              {formData.cardMode === 'credit' && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Límite de crédito"
                    value={formData.creditLimit}
                    onChange={handleChange('creditLimit')}
                    placeholder="100000"
                    required
                    helperText="Obligatorio para tarjetas de crédito"
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setShowAddForm(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleAddCard}
                disabled={loading || !formData.bankId || !formData.cardName || (formData.cardMode === 'credit' && !formData.creditLimit)}
                startIcon={loading ? undefined : <CreditCardIcon />}
              >
                {loading ? 'Agregando...' : 'Agregar Tarjeta'}
              </Button>
            </Box>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManageCreditCardsModal