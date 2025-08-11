import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ExpandMore,
  CreditCard,
  MonetizationOn,
  AccountBalance
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const CategorySummary = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'))

  const { data: monthlyExpenses, isLoading } = useQuery(
    ['expenses-summary', selectedMonth],
    async () => {
      const [year, month] = selectedMonth.split('-')
      const response = await api.get(`/expenses?year=${year}&month=${month}`)
      return response.expenses || []
    }
  )

  const { data: expenseCategories } = useQuery(
    ['expense-categories'],
    async () => {
      const response = await api.get('/categories/expenses')
      return response.categories || []
    }
  )

  // Agrupar gastos por categoría y método de pago
  const groupedByCategory = expenseCategories?.reduce((acc, category) => {
    const categoryExpenses = monthlyExpenses?.filter(expense => 
      expense.categoryId === category.id
    ) || []

    if (categoryExpenses.length > 0) {
      const paymentMethods = {
        cash: categoryExpenses.filter(e => e.paymentMethod === 'cash'),
        debit_card: categoryExpenses.filter(e => e.paymentMethod === 'debit_card'),
        credit_card: categoryExpenses.filter(e => e.paymentMethod === 'credit_card')
      }

      const totals = {
        cash: paymentMethods.cash.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        debit_card: paymentMethods.debit_card.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        credit_card: paymentMethods.credit_card.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      }

      const total = totals.cash + totals.debit_card + totals.credit_card

      acc[category.id] = {
        ...category,
        expenses: categoryExpenses,
        paymentMethods,
        totals,
        total
      }
    }
    return acc
  }, {}) || {}

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return '#4CAF50' // Verde
      case 'debit_card':
        return '#2196F3' // Azul
      case 'credit_card':
        return '#FF9800' // Naranja
      default:
        return '#757575'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <MonetizationOn />
      case 'debit_card':
        return <AccountBalance />
      case 'credit_card':
        return <CreditCard />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'debit_card':
        return 'Tarjeta Débito'
      case 'credit_card':
        return 'Tarjeta Crédito'
      default:
        return method
    }
  }

  const totalByPaymentMethod = {
    cash: Object.values(groupedByCategory).reduce((sum, cat) => sum + cat.totals.cash, 0),
    debit_card: Object.values(groupedByCategory).reduce((sum, cat) => sum + cat.totals.debit_card, 0),
    credit_card: Object.values(groupedByCategory).reduce((sum, cat) => sum + cat.totals.credit_card, 0)
  }

  const grandTotal = totalByPaymentMethod.cash + totalByPaymentMethod.debit_card + totalByPaymentMethod.credit_card

  if (isLoading) return <Typography>Cargando resumen...</Typography>

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" gutterBottom>
          Resumen por Categorías
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Mes</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            label="Mes"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = dayjs().month(i)
              const value = date.format('YYYY-MM')
              return (
                <MenuItem key={value} value={value}>
                  {date.format('MMMM YYYY')}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>

      {/* Resumen total por método de pago */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Total por Método de Pago
        </Typography>
        <Grid container spacing={2}>
          {['cash', 'debit_card', 'credit_card'].map((method) => (
            totalByPaymentMethod[method] > 0 && (
              <Grid item key={method}>
                <Card sx={{ 
                  bgcolor: getPaymentMethodColor(method), 
                  color: 'white',
                  minWidth: 150
                }}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPaymentMethodIcon(method)}
                      <Box>
                        <Typography variant="body2">
                          {getPaymentMethodLabel(method)}
                        </Typography>
                        <Typography variant="h6">
                          ${totalByPaymentMethod[method].toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          ))}
          <Grid item>
            <Card sx={{ bgcolor: '#424242', color: 'white', minWidth: 150 }}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Typography variant="body2">Total General</Typography>
                <Typography variant="h6">
                  ${grandTotal.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Leyenda de colores */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Leyenda de Métodos de Pago
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {[
            { method: 'cash', label: 'Efectivo' },
            { method: 'debit_card', label: 'Tarjeta Débito' },
            { method: 'credit_card', label: 'Tarjeta Crédito' }
          ].map(({ method, label }) => (
            <Chip
              key={method}
              icon={getPaymentMethodIcon(method)}
              label={label}
              sx={{
                backgroundColor: getPaymentMethodColor(method),
                color: 'white'
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Detalle por categoría */}
      <Box>
        {Object.values(groupedByCategory).map((categoryData) => (
          <Accordion key={categoryData.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: categoryData.color || '#757575'
                  }}
                />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {categoryData.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  ${categoryData.total.toLocaleString()}
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {['cash', 'debit_card', 'credit_card'].map((method) => (
                  categoryData.totals[method] > 0 && (
                    <Grid item key={method}>
                      <Chip
                        icon={getPaymentMethodIcon(method)}
                        label={`${getPaymentMethodLabel(method)}: $${categoryData.totals[method].toLocaleString()}`}
                        sx={{
                          backgroundColor: getPaymentMethodColor(method),
                          color: 'white'
                        }}
                      />
                    </Grid>
                  )
                ))}
              </Grid>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell align="right">Monto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {dayjs(expense.expenseDate).format('DD/MM')}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={getPaymentMethodIcon(expense.paymentMethod)}
                            label={getPaymentMethodLabel(expense.paymentMethod)}
                            sx={{
                              backgroundColor: getPaymentMethodColor(expense.paymentMethod),
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${parseFloat(expense.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {Object.keys(groupedByCategory).length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No hay gastos registrados para el mes seleccionado
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default CategorySummary