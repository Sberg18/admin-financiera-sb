import React, { useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  Receipt
} from '@mui/icons-material'
import dayjs from 'dayjs'

const BalanceDetailModal = ({ 
  open, 
  onClose, 
  incomes, 
  expenses, 
  totalIncomes, 
  totalExpenses, 
  balance 
}) => {
  const currentMonth = dayjs().format('MMMM YYYY')

  // Agrupar gastos por método de pago
  const expensesByPaymentMethod = useMemo(() => {
    if (!expenses) return {}
    
    return expenses.reduce((groups, expense) => {
      const method = expense.paymentMethod
      if (!groups[method]) {
        groups[method] = { total: 0, items: [] }
      }
      groups[method].total += parseFloat(expense.amount)
      groups[method].items.push(expense)
      return groups
    }, {})
  }, [expenses])

  // Agrupar ingresos por tipo
  const incomesByType = useMemo(() => {
    if (!incomes) return {}
    
    return incomes.reduce((groups, income) => {
      const type = income.description || 'Otros'
      if (!groups[type]) {
        groups[type] = { total: 0, items: [] }
      }
      groups[type].total += parseFloat(income.amount)
      groups[type].items.push(income)
      return groups
    }, {})
  }, [incomes])

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito'
    }
    return labels[method] || method
  }

  const getPaymentMethodColor = (method) => {
    const colors = {
      cash: 'success',
      credit_card: 'warning',
      debit_card: 'info'
    }
    return colors[method] || 'default'
  }

  // Calcular proyección del balance
  const projectedSavings = Math.max(0, balance)
  const savingsRate = totalIncomes > 0 ? (projectedSavings / totalIncomes) * 100 : 0

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalance color="primary" />
          <Typography variant="h5">
            Balance Detallado - {currentMonth}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Resumen Principal */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUp sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4">
                      ${totalIncomes.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Ingresos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingDown sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4">
                      ${totalExpenses.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Gastos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: balance >= 0 ? 'info.light' : 'warning.light', 
              color: balance >= 0 ? 'info.contrastText' : 'warning.contrastText' 
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AttachMoney sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4">
                      ${Math.abs(balance).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      {balance >= 0 ? 'Te Sobran' : 'Te Faltan'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Indicador de Tasa de Ahorro */}
        {balance > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasa de Ahorro: {savingsRate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(savingsRate, 100)} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {savingsRate >= 20 ? '¡Excelente!' : savingsRate >= 10 ? 'Bien' : 'Puedes mejorar'} 
                {' '}(Recomendado: 20% o más)
              </Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Detalle de Ingresos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrendingUp color="success" />
                  <Typography variant="h6">
                    Ingresos por Tipo
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {Object.entries(incomesByType).map(([type, data]) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {type}
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ${data.total.toLocaleString()}
                      </Typography>
                    </Box>
                    <List dense sx={{ pl: 2 }}>
                      {data.items.map((income, index) => (
                        <ListItem key={income.id || index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={income.description}
                            secondary={`${dayjs(income.incomeDate).format('DD/MM')} - $${parseFloat(income.amount).toLocaleString()}`}
                          />
                          {income.isRecurring && (
                            <Chip 
                              label={income.recurringFrequency || 'Recurrente'} 
                              size="small" 
                              color="success" 
                              variant="outlined" 
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Detalle de Gastos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Receipt color="error" />
                  <Typography variant="h6">
                    Gastos por Método de Pago
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {Object.entries(expensesByPaymentMethod).map(([method, data]) => (
                  <Box key={method} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getPaymentMethodLabel(method)}
                          color={getPaymentMethodColor(method)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" color="error.main">
                        ${data.total.toLocaleString()}
                      </Typography>
                    </Box>
                    <List dense sx={{ pl: 2 }}>
                      {data.items.slice(0, 5).map((expense, index) => (
                        <ListItem key={expense.id || index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={expense.description}
                            secondary={
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  {dayjs(expense.expenseDate).format('DD/MM')} - $${parseFloat(expense.amount).toLocaleString()}
                                </Typography>
                                {expense.installments > 1 && (
                                  <Typography variant="caption" color="warning.main" display="block">
                                    Cuota {expense.currentInstallment}/{expense.installments}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                      {data.items.length > 5 && (
                        <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
                          ... y {data.items.length - 5} más
                        </Typography>
                      )}
                    </List>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Proyección */}
        <Card sx={{ mt: 3, bgcolor: balance >= 0 ? 'success.light' : 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Proyección Financiera
            </Typography>
            {balance > 0 ? (
              <Typography variant="body1">
                Con este ritmo de ahorro, tendrás <strong>${(balance * 12).toLocaleString()}</strong> ahorrados al final del año.
                {savingsRate < 10 && " Considera reducir gastos o aumentar ingresos para mejorar tu situación financiera."}
              </Typography>
            ) : (
              <Typography variant="body1">
                Te faltan <strong>${Math.abs(balance).toLocaleString()}</strong> este mes. 
                Considera ajustar tus gastos o buscar ingresos adicionales para equilibrar tu presupuesto.
              </Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BalanceDetailModal