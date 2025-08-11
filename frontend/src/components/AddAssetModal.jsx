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
  Paper,
  Typography,
  Box
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const AddAssetModal = ({ open, onClose }) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('currency')
  
  const [formData, setFormData] = useState({
    assetTypeId: '',
    name: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    currency: 'USD',
    purchaseDate: dayjs()
  })

  const { data: assetTypes } = useQuery(['assetTypes'], async () => {
    const response = await api.get('/onboarding/asset-types')
    return response.assetTypes
  })

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setFormData({
      ...formData,
      assetTypeId: '',
      name: '',
      currency: category === 'currency' ? 'USD' : 'ARS'
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        purchaseDate: formData.purchaseDate.format('YYYY-MM-DD'),
        quantity: parseFloat(formData.quantity),
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null
      }

      await api.post('/onboarding/assets', submitData)
      
      queryClient.invalidateQueries(['assets'])
      
      // Reset form
      setFormData({
        assetTypeId: '',
        name: '',
        quantity: '',
        purchasePrice: '',
        currentPrice: '',
        currency: selectedCategory === 'currency' ? 'USD' : 'ARS',
        purchaseDate: dayjs()
      })
      
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el activo')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: 'currency', label: 'Divisas (USD, EUR)' },
    { key: 'stocks', label: 'Acciones' },
    { key: 'bonds', label: 'Bonos' },
    { key: 'crypto', label: 'Criptomonedas' },
    { key: 'savings', label: 'Ahorros/Plazos Fijos' }
  ]

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'stocks': return 'Acciones'
      case 'bonds': return 'Bonos'
      case 'currency': return 'Divisas'
      case 'savings': return 'Ahorros'
      case 'crypto': return 'Criptomonedas'
      default: return category
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar Nuevo Activo</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Selector de Categoría */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona el tipo de activo
          </Typography>
          <Grid container spacing={1}>
            {categories.map((category) => (
              <Grid item key={category.key}>
                <Button
                  variant={selectedCategory === category.key ? 'contained' : 'outlined'}
                  color={selectedCategory === category.key ? 'primary' : 'inherit'}
                  onClick={() => handleCategoryChange(category.key)}
                  size="small"
                >
                  {category.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo específico</InputLabel>
              <Select
                value={formData.assetTypeId}
                onChange={handleChange('assetTypeId')}
                label="Tipo específico"
              >
                {assetTypes?.[selectedCategory]?.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={selectedCategory === 'currency' ? 'Descripción (ej: Ahorros en USD)' : 'Nombre del activo'}
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder={
                selectedCategory === 'stocks' ? 'ej: AAPL, GGAL' :
                selectedCategory === 'currency' ? 'ej: Ahorros en dólares' :
                selectedCategory === 'crypto' ? 'ej: Bitcoin' :
                'Nombre descriptivo'
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Cantidad"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              inputProps={{ min: 0, step: selectedCategory === 'currency' ? 1 : 0.00000001 }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Precio de compra (opcional)"
              type="number"
              value={formData.purchasePrice}
              onChange={handleChange('purchasePrice')}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Precio actual (opcional)"
              type="number"
              value={formData.currentPrice}
              onChange={handleChange('currentPrice')}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={formData.currency}
                onChange={handleChange('currency')}
                label="Moneda"
              >
                <MenuItem value="ARS">Pesos Argentinos (ARS)</MenuItem>
                <MenuItem value="USD">Dólares (USD)</MenuItem>
                <MenuItem value="EUR">Euros (EUR)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de compra"
              value={formData.purchaseDate}
              onChange={(date) => setFormData({ ...formData, purchaseDate: date })}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.assetTypeId || !formData.name || !formData.quantity}
        >
          {loading ? <CircularProgress size={20} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddAssetModal