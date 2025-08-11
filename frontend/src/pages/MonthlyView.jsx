import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Fab,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AccountBalance
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const MonthlyView = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'))
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('income')

  // Queries para obtener datos del mes seleccionado
  const { data: monthlyExpenses, isLoading: loadingExpenses } = useQuery(
    ['expenses', selectedMonth],
    async () => {
      const [year, month] = selectedMonth.split('-')
      const response = await api.get(`/expenses?year=${year}&month=${month}`)
      return response.expenses || []
    }
  )

  const { data: monthlyIncomes, isLoading: loadingIncomes } = useQuery(
    ['incomes', selectedMonth],
    async () => {
      const [year, month] = selectedMonth.split('-')
      const response = await api.get(`/incomes?year=${year}&month=${month}`)
      return response.incomes || []
    }
  )

  const { data: expenseCategories } = useQuery(
    ['expense-categories'],
    async () => {
      const response = await api.get('/categories/expenses')
      return response.categories || []
    }
  )

  const { data: creditCards } = useQuery(
    ['creditCards'],
    async () => {
      const response = await api.get('/onboarding/credit-cards')
      return response.creditCards || []
    }
  )

  // Agrupar gastos según tu estructura del Excel
  const groupedExpenses = {
    visa: monthlyExpenses?.filter(e => e.creditCard?.cardType === 'Visa') || [],
    amex: monthlyExpenses?.filter(e => e.creditCard?.cardType === 'American Express') || [],
    efectivo: monthlyExpenses?.filter(e => e.paymentMethod === 'cash') || [],
    servicios: monthlyExpenses?.filter(e => e.category?.name === 'Impuestos y Servicios') || []
  }

  // Calcular totales
  const totalIncomes = monthlyIncomes?.reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0
  const totalExpenses = monthlyExpenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0
  const balance = totalIncomes - totalExpenses

  const getPaymentMethodColor = (method, cardType) => {
    if (method === 'credit_card') {
      return cardType === 'Visa' ? 'primary' : cardType === 'American Express' ? 'secondary' : 'default'
    }
    return method === 'cash' ? 'success' : 'info'
  }

  const CategorySection = ({ title, items, color, icon: Icon, type }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon sx={{ color: color }} />
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={`$${items.reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString()}`}
              color={type === 'income' ? 'success' : 'error'}
              size="small"
            />
          </Box>
          <IconButton 
            color="primary" 
            onClick={() => {
              setSelectedCategory(type)
              setShowAddModal(true)
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Monto</TableCell>
                {type === 'expense' && <TableCell>Cuotas</TableCell>}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {dayjs(item[type === 'income' ? 'incomeDate' : 'expenseDate']).format('DD/MM')}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={type === 'income' ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      ${parseFloat(item.amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  {type === 'expense' && (
                    <TableCell>
                      {item.installments > 1 ? (
                        <Chip 
                          label={`${item.currentInstallment}/${item.installments}`} 
                          size="small" 
                          color="warning" 
                        />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Único
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={type === 'income' ? 4 : 5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No hay {type === 'income' ? 'ingresos' : 'gastos'} registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      {/* Header con selector de mes */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" gutterBottom>
          Vista Mensual Detallada
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

      {/* Resumen del mes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    ${totalIncomes.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    Ingreso Mensual
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
                <TrendingDown sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    ${totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    Gasto Mensual
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: balance >= 0 ? 'success.main' : 'error.main', 
            color: 'white' 
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalance sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    ${Math.abs(balance).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    {balance >= 0 ? '✅ Balance Positivo' : '⚠️ Balance Negativo'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Columna de Ingresos */}
        <Grid item xs={12} md={6}>
          <CategorySection
            title="Ingreso Mensual"
            items={monthlyIncomes || []}
            color="success.main"
            icon={TrendingUp}
            type="income"
          />
        </Grid>

        {/* Columna de Gastos */}
        <Grid item xs={12} md={6}>
          {/* Tarjeta VISA */}
          <CategorySection
            title="Tarjeta VISA"
            items={groupedExpenses.visa}
            color="primary.main"
            icon={CreditCard}
            type="expense"
          />

          {/* Tarjeta AMEX */}
          <CategorySection
            title="Tarjeta AMEX"
            items={groupedExpenses.amex}
            color="secondary.main"
            icon={CreditCard}
            type="expense"
          />

          {/* Efectivo */}
          <CategorySection
            title="EFECTIVO"
            items={groupedExpenses.efectivo}
            color="success.main"
            icon={AccountBalance}
            type="expense"
          />

          {/* Impuestos y Servicios */}
          <CategorySection
            title="Impuestos y Servicios"
            items={groupedExpenses.servicios}
            color="warning.main"
            icon={AccountBalance}
            type="expense"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default MonthlyView