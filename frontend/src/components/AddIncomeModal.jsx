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
  FormControlLabel,
  Switch
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const AddIncomeModal = ({ open, onClose }) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    incomeDate: dayjs(),
    isRecurring: false,
    recurringFrequency: 'monthly',
    categoryId: ''
  })

  const { data: incomeCategories } = useQuery(
    ['income-categories'],
    async () => {
      const response = await api.get('/categories/incomes')
      return response.categories
    }
  )

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        incomeDate: formData.incomeDate.format('YYYY-MM-DD'),
        amount: parseFloat(formData.amount)
      }

      if (!submitData.isRecurring) {
        delete submitData.recurringFrequency
      }

      await api.post('/incomes', submitData)
      
      queryClient.invalidateQueries(['incomes'])
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        incomeDate: dayjs(),
        isRecurring: false,
        recurringFrequency: 'monthly',
        categoryId: ''
      })
      
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el ingreso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Nuevo Ingreso</DialogTitle>
      <DialogContent>
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
              value={formData.incomeDate}
              onChange={(date) => setFormData({ ...formData, incomeDate: date })}
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
              placeholder="Ej: Sueldo, Freelance, Venta, etc."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={handleChange('categoryId')}
                label="Categoría"
              >
                {incomeCategories?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={handleSwitchChange('isRecurring')}
                />
              }
              label="Ingreso recurrente"
            />
          </Grid>
          
          {formData.isRecurring && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={formData.recurringFrequency}
                  onChange={handleChange('recurringFrequency')}
                  label="Frecuencia"
                >
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="biweekly">Quincenal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="quarterly">Trimestral</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.amount}
        >
          {loading ? <CircularProgress size={20} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddIncomeModal