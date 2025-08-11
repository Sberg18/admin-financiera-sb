import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import { 
  Delete as DeleteIcon,
  TrendingUp,
  AccountBalance,
  CurrencyExchange,
  Savings
} from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const AssetsList = () => {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery(
    ['assets'],
    async () => {
      const response = await api.get('/onboarding/assets')
      return response.assets
    }
  )

  const handleDelete = async (id) => {
    try {
      await api.delete(`/onboarding/assets/${id}`)
      queryClient.invalidateQueries(['assets'])
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'stocks': return <TrendingUp color="primary" />
      case 'bonds': return <AccountBalance color="info" />
      case 'currency': return <CurrencyExchange color="success" />
      case 'savings': return <Savings color="secondary" />
      case 'crypto': return <TrendingUp color="warning" />
      default: return <TrendingUp />
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'stocks': return 'Acciones'
      case 'bonds': return 'Bonos'
      case 'currency': return 'Divisas'
      case 'savings': return 'Ahorros'
      case 'crypto': return 'Crypto'
      default: return category
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'stocks': return 'primary'
      case 'bonds': return 'info'
      case 'currency': return 'success'
      case 'savings': return 'secondary'
      case 'crypto': return 'warning'
      default: return 'default'
    }
  }

  const calculateTotalValue = (asset) => {
    const price = parseFloat(asset.currentPrice || asset.purchasePrice || 0)
    const quantity = parseFloat(asset.quantity || 0)
    return price * quantity
  }

  const groupedAssets = data?.reduce((groups, asset) => {
    const category = asset.assetType?.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(asset)
    return groups
  }, {}) || {}

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error al cargar los activos
      </Typography>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
        No hay activos registrados. ¡Comienza agregando tus inversiones!
      </Typography>
    )
  }

  return (
    <Box>
      {Object.entries(groupedAssets).map(([category, assets]) => (
        <Box key={category} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {getCategoryIcon(category)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {getCategoryLabel(category)} ({assets.length})
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Compra</TableCell>
                  <TableCell align="right">Precio Actual</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell>Fecha Compra</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {asset.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asset.assetType?.name || 'Sin tipo'}
                        color={getCategoryColor(category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {parseFloat(asset.quantity).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {asset.purchasePrice ? (
                        <Typography variant="body2">
                          {asset.currency} {parseFloat(asset.purchasePrice).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {asset.currentPrice ? (
                        <Typography variant="body2">
                          {asset.currency} {parseFloat(asset.currentPrice).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        color={calculateTotalValue(asset) > 0 ? 'success.main' : 'textSecondary'}
                      >
                        {calculateTotalValue(asset) > 0 
                          ? `${asset.currency} ${calculateTotalValue(asset).toLocaleString()}`
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {asset.purchaseDate ? dayjs(asset.purchaseDate).format('DD/MM/YYYY') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {/* Resumen por categoría */}
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen por Categoría
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(groupedAssets).map(([category, assets]) => {
            const totalValue = assets.reduce((sum, asset) => sum + calculateTotalValue(asset), 0)
            return (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getCategoryIcon(category)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {getCategoryLabel(category)}
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="primary">
                      ${totalValue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {assets.length} activo{assets.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Paper>
    </Box>
  )
}

export default AssetsList