import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { 
  AttachMoney as DollarIcon,
  Refresh as RefreshIcon,
  Schedule as ClockIcon
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../services/api'

const ExchangeRateDisplay = ({ arsAmount, showRefresh = false, size = 'medium' }) => {
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const { data: exchangeData, isLoading, error, refetch } = useQuery(
    ['exchange-rate', lastRefresh],
    async () => {
      const response = await api.get('/exchange-rate/usd')
      return response.data
    },
    {
      staleTime: 30 * 60 * 1000, // 30 minutos
      cacheTime: 60 * 60 * 1000, // 1 hora
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 2
    }
  )

  const handleRefresh = async () => {
    setLastRefresh(Date.now())
    await refetch()
  }

  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getUSDAmount = () => {
    if (!exchangeData?.rate || !arsAmount) return 0
    return parseFloat((arsAmount / exchangeData.rate).toFixed(2))
  }

  const getLastUpdateText = () => {
    if (!exchangeData?.lastUpdate) return 'Sin datos'
    const updateDate = new Date(exchangeData.lastUpdate)
    const now = new Date()
    const diffMinutes = Math.floor((now - updateDate) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Hace menos de 1 min'
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    
    return updateDate.toLocaleDateString()
  }

  if (error) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <DollarIcon color="disabled" fontSize={size} />
        <Typography variant="body2" color="text.secondary">
          Error tipo cambio
        </Typography>
      </Box>
    )
  }

  if (isLoading || !exchangeData) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Cargando USD...
        </Typography>
      </Box>
    )
  }

  const usdAmount = getUSDAmount()

  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <Chip
        icon={<DollarIcon />}
        label={`USD ${usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        size={size === 'small' ? 'small' : 'medium'}
        color="primary"
        variant="outlined"
        sx={{
          fontWeight: 600,
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '0.9rem' : '1.1rem'
          }
        }}
      />
      
      <Tooltip title={`Tipo de cambio: $${exchangeData.rate?.toLocaleString()} ARS/USD - ${getLastUpdateText()}`}>
        <Chip
          icon={<ClockIcon />}
          label={`TC $${exchangeData.rate?.toLocaleString()}`}
          size="small"
          variant="outlined"
          color={exchangeData.isExpired ? "warning" : "default"}
          sx={{
            fontSize: '0.75rem',
            height: 24
          }}
        />
      </Tooltip>

      {showRefresh && (
        <Tooltip title="Actualizar tipo de cambio">
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default ExchangeRateDisplay