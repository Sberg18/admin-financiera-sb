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
  Switch,
  IconButton,
  Tooltip,
  Box,
  Chip
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
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
    categoryId: '',
    type: 'variable'
  })
  
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#4CAF50'
  })
  
  const categoryColors = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', 
    '#9C27B0', '#00BCD4', '#795548', '#607D8B'
  ]

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

  const handleCreateCategory = async () => {
    try {
      setLoading(true)
      const response = await api.post('/categories/incomes', newCategory)
      
      // Actualizar la lista de categorías
      queryClient.invalidateQueries(['income-categories'])
      
      // Seleccionar automáticamente la nueva categoría
      setFormData({
        ...formData,
        categoryId: response.category.id
      })
      
      // Resetear formulario de categoría
      setNewCategory({ name: '', color: '#4CAF50' })
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
        incomeDate: formData.incomeDate.format('YYYY-MM-DD'),
        amount: parseFloat(formData.amount)
      }

      if (!submitData.isRecurring) {
        delete submitData.recurringFrequency
      }

      await api.post('/incomes', submitData)
      
      queryClient.invalidateQueries(['incomes'])
      queryClient.invalidateQueries(['incomes-current-month'])
      queryClient.invalidateQueries(['expenses'])
      queryClient.invalidateQueries(['income-categories'])
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        incomeDate: dayjs(),
        isRecurring: false,
        recurringFrequency: 'monthly',
        categoryId: '',
        type: 'variable'
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
              <InputLabel>Tipo de Ingreso</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Tipo de Ingreso"
              >
                <MenuItem value="fixed">🔒 Fijo</MenuItem>
                <MenuItem value="variable">📈 Variable</MenuItem>
              </Select>
            </FormControl>
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
                  {incomeCategories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color || '#4CAF50'
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
                  Crear nueva categoría de ingresos
                </Alert>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de la categoría"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Ej: Bonus, Freelance, Ventas, etc."
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
                      setNewCategory({ name: '', color: '#4CAF50' })
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Grid>
            </>
          )}
          
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