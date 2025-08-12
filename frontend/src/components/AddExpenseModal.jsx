import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Add as AddIcon, Palette } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const AddExpenseModal = ({ open, onClose }) => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    expenseDate: dayjs(),
    paymentMethod: 'cash',
    installments: 1,
    creditCardId: '',
    categoryId: '',
    paymentDate: null
  })
  
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#2196F3'
  })
  
  const categoryColors = [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', 
    '#9C27B0', '#00BCD4', '#795548', '#607D8B'
  ]

  const { data: creditCards } = useQuery(
    ['creditCards'],
    async () => {
      const response = await api.get('/onboarding/credit-cards')
      return response.creditCards
    }
  )

  const { data: expenseCategories } = useQuery(
    ['expense-categories'],
    async () => {
      const response = await api.get('/categories/expenses')
      return response.categories
    }
  )

  // Función para calcular la fecha de pago de la tarjeta
  const calculatePaymentDate = (expenseDate, creditCard) => {
    if (!creditCard || !expenseDate) return expenseDate
    
    const expenseDateObj = dayjs(expenseDate)
    const closingDay = creditCard.closingDay || 31
    const paymentDay = creditCard.paymentDay || 10
    
    // Determinar el mes de cierre
    let closingMonth = expenseDateObj.month()
    let closingYear = expenseDateObj.year()
    
    // Si la compra es después del día de cierre, va al cierre del mes siguiente
    if (expenseDateObj.date() > closingDay) {
      closingMonth += 1
      if (closingMonth > 11) {
        closingMonth = 0
        closingYear += 1
      }
    }
    
    // La fecha de pago es el día de pago del mes siguiente al cierre
    let paymentMonth = closingMonth + 1
    let paymentYear = closingYear
    
    if (paymentMonth > 11) {
      paymentMonth = 0
      paymentYear += 1
    }
    
    // Crear fecha de pago
    const paymentDate = dayjs()
      .year(paymentYear)
      .month(paymentMonth)
      .date(paymentDay)
    
    return paymentDate
  }

  const handleChange = (field) => (event) => {
    const newValue = event.target.value
    let newFormData = {
      ...formData,
      [field]: newValue
    }
    
    // Si cambió el método de pago a tarjeta de crédito, calcular fecha de pago
    if (field === 'paymentMethod' && newValue === 'credit_card' && formData.creditCardId) {
      const selectedCard = creditCards?.find(card => card.id === formData.creditCardId)
      if (selectedCard) {
        const paymentDate = calculatePaymentDate(formData.expenseDate, selectedCard)
        newFormData.paymentDate = paymentDate
      }
    }
    
    // Si cambió la tarjeta de crédito o la fecha, recalcular fecha de pago
    if ((field === 'creditCardId' || field === 'expenseDate') && 
        (formData.paymentMethod === 'credit_card' || (field === 'paymentMethod' && newValue === 'credit_card'))) {
      const selectedCard = creditCards?.find(card => card.id === (field === 'creditCardId' ? newValue : formData.creditCardId))
      if (selectedCard) {
        const expenseDate = field === 'expenseDate' ? newValue : formData.expenseDate
        const paymentDate = calculatePaymentDate(expenseDate, selectedCard)
        newFormData.paymentDate = paymentDate
      }
    }
    
    // Si cambió el método de pago a algo distinto de tarjeta, limpiar fecha de pago
    if (field === 'paymentMethod' && newValue !== 'credit_card') {
      newFormData.paymentDate = null
    }
    
    setFormData(newFormData)
  }

  const handleCreateCategory = async () => {
    try {
      setLoading(true)
      const response = await api.post('/categories/expenses', newCategory)
      
      // Actualizar la lista de categorías
      queryClient.invalidateQueries(['expense-categories'])
      
      // Seleccionar automáticamente la nueva categoría
      setFormData({
        ...formData,
        categoryId: response.category.id
      })
      
      // Resetear formulario de categoría
      setNewCategory({ name: '', color: '#2196F3' })
      setShowNewCategoryForm(false)
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        expenseDate: formData.expenseDate.format('YYYY-MM-DD'),
        amount: parseFloat(formData.amount)
      }

      if (submitData.paymentMethod !== 'credit_card') {
        delete submitData.creditCardId
        submitData.installments = 1
      }

      await api.post('/expenses', submitData)
      
      queryClient.invalidateQueries(['expenses'])
      queryClient.invalidateQueries(['expenses-current-month'])
      queryClient.invalidateQueries(['incomes'])
      queryClient.invalidateQueries(['expense-categories'])
      queryClient.invalidateQueries(['creditCards'])
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        expenseDate: dayjs(),
        paymentMethod: 'cash',
        installments: 1,
        creditCardId: '',
        categoryId: '',
        paymentDate: null
      })
      
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el gasto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      scroll={isMobile ? "body" : "paper"}
    >
      <DialogTitle sx={{ 
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        px: { xs: 2, sm: 3 }
      }}>
        Agregar Nuevo Gasto
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 1 }
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha"
              value={formData.expenseDate}
              onChange={(date) => setFormData({ ...formData, expenseDate: date })}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Descripción"
              value={formData.description}
              onChange={handleChange('description')}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={handleChange('categoryId')}
                  label="Categoría"
                >
                  {expenseCategories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color || '#2196F3'
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Crear nueva categoría">
                <IconButton
                  color="primary"
                  onClick={() => setShowNewCategoryForm(true)}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          
          {/* Formulario para nueva categoría */}
          {showNewCategoryForm && (
            <>
              <Grid item xs={12}>
                <Alert severity="info">
                  Crear nueva categoría de gastos
                </Alert>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de la categoría"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Ej: Pedidos, Combustible, etc."
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box>
                  <InputLabel sx={{ mb: 1 }}>Color</InputLabel>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {categoryColors.map((color) => (
                      <Chip
                        key={color}
                        sx={{
                          backgroundColor: color,
                          color: 'white',
                          border: newCategory.color === color ? '3px solid #000' : 'none'
                        }}
                        label=" "
                        onClick={() => setNewCategory({...newCategory, color})}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleCreateCategory}
                    disabled={!newCategory.name || loading}
                  >
                    Crear Categoría
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setShowNewCategoryForm(false)
                      setNewCategory({ name: '', color: '#2196F3' })
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Grid>
            </>
          )}
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={formData.paymentMethod}
                onChange={handleChange('paymentMethod')}
                label="Método de Pago"
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="debit_card">Tarjeta de Débito</MenuItem>
                <MenuItem value="credit_card">Tarjeta de Crédito</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.paymentMethod === 'credit_card' && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tarjeta de Crédito</InputLabel>
                  <Select
                    value={formData.creditCardId}
                    onChange={handleChange('creditCardId')}
                    label="Tarjeta de Crédito"
                  >
                    {creditCards?.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {card.cardName} - {card.bank?.name} 
                        {card.lastFourDigits && ` (**** ${card.lastFourDigits})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cuotas"
                  type="number"
                  value={formData.installments}
                  onChange={handleChange('installments')}
                  inputProps={{ min: 1, max: 60 }}
                  helperText="1 = pago único"
                />
              </Grid>
              
              {formData.paymentDate && (
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Fecha de Pago (Estimada)"
                    value={formData.paymentDate}
                    onChange={(date) => setFormData({ ...formData, paymentDate: date })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Basado en el vencimiento de tu tarjeta"
                      }
                    }}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 2 }
      }}>
        <Button 
          onClick={onClose}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !formData.amount || !formData.description}
        >
          {loading ? <CircularProgress size={20} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddExpenseModal