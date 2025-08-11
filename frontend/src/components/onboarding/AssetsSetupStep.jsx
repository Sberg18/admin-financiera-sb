import React, { useState } from 'react'
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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp,
  AccountBalance,
  CurrencyExchange,
  Savings
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import api from '../../services/api'

const AssetsSetupStep = ({ onNext }) => {
  const [assets, setAssets] = useState([])
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

  const addAsset = async () => {
    if (!formData.assetTypeId || !formData.name || !formData.quantity) return

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

      const response = await api.post('/onboarding/assets', submitData)
      
      setAssets([...assets, { 
        ...response.asset,
        assetType: assetTypes[selectedCategory]?.find(t => t.id === formData.assetTypeId)
      }])
      
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
    } catch (error) {
      setError(error.response?.data?.message || 'Error al agregar activo')
    } finally {
      setLoading(false)
    }
  }

  const removeAsset = async (id) => {
    try {
      await api.delete(`/onboarding/assets/${id}`)
      setAssets(assets.filter(asset => asset.id !== id))
    } catch (error) {
      setError('Error al eliminar activo')
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'stocks': return <TrendingUp />
      case 'bonds': return <AccountBalance />
      case 'currency': return <CurrencyExchange />
      case 'savings': return <Savings />
      case 'crypto': return <TrendingUp />
      default: return <TrendingUp />
    }
  }

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

  const categories = [
    { key: 'currency', label: 'Divisas (USD, EUR)', color: 'success' },
    { key: 'stocks', label: 'Acciones', color: 'primary' },
    { key: 'bonds', label: 'Bonos', color: 'info' },
    { key: 'crypto', label: 'Criptomonedas', color: 'warning' },
    { key: 'savings', label: 'Ahorros/Plazos Fijos', color: 'secondary' }
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configura tus Activos e Inversiones
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Registra tus inversiones, ahorros en dólares, acciones y otros activos para una visión completa de tu patrimonio.
      </Typography>

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
                startIcon={getCategoryIcon(category.key)}
              >
                {category.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Agregar {getCategoryLabel(selectedCategory)}
        </Typography>
        
        <Grid container spacing={2}>
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

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addAsset}
              disabled={loading || !formData.assetTypeId || !formData.name || !formData.quantity}
              fullWidth
            >
              Agregar Activo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {assets.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Activos Configurados ({assets.length})
          </Typography>
          <List>
            {assets.map((asset) => (
              <ListItem key={asset.id}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {asset.name}
                      </Typography>
                      <Chip 
                        label={asset.assetType?.name || 'Tipo no especificado'} 
                        size="small" 
                        color="primary" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Cantidad: {parseFloat(asset.quantity).toLocaleString()} {asset.currency}
                      </Typography>
                      {asset.purchasePrice && (
                        <Typography variant="body2" color="textSecondary">
                          Precio compra: {asset.currency} {parseFloat(asset.purchasePrice).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeAsset(asset.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box textAlign="center" mt={3}>
        <Typography variant="body2" color="textSecondary" paragraph>
          ¡Perfecto! Ya tienes configurado tu perfil financiero básico.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Puedes agregar más activos en cualquier momento desde el dashboard.
        </Typography>
      </Box>
    </Box>
  )
}

export default AssetsSetupStep