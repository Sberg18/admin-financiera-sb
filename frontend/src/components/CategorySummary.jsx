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
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material'
import {
  ExpandMore,
  CreditCard,
  MonetizationOn,
  AccountBalance,
  Edit as EditIcon
} from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import DateFilter from './DateFilter'
import EditExpenseModal from './EditExpenseModal'

const CategorySummary = ({ selectedCategoryId }) => {
  const queryClient = useQueryClient()
  const [dateFilter, setDateFilter] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(selectedCategoryId)
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)

  // Actualizar categoría expandida cuando se reciba un nuevo selectedCategoryId
  React.useEffect(() => {
    if (selectedCategoryId) {
      setExpandedCategory(selectedCategoryId)
    }
  }, [selectedCategoryId])

  const { data: monthlyExpenses, isLoading } = useQuery(
    ['expenses-summary', dateFilter],
    async () => {
      if (!dateFilter) return []
      
      let url = '/expenses'
      if (dateFilter.type === 'monthly') {
        url = `/expenses?year=${dateFilter.year}&month=${dateFilter.month}`
      } else if (dateFilter.type === 'range') {
        url = `/expenses?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
      }
      
      const response = await api.get(url)
      return response.expenses || []
    },
    {
      enabled: !!dateFilter
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

  const handleEditCategory = (category) => {
    setSelectedCategory({
      ...category,
      type: 'expense' // Asumimos que son categorías de gastos por ahora
    })
    setEditCategoryModalOpen(true)
  }

  const handleUpdateCategory = async () => {
    try {
      await api.put(`/categories/expenses/${selectedCategory.id}`, {
        name: selectedCategory.name,
        color: selectedCategory.color
      })
      queryClient.invalidateQueries(['expense-categories'])
      queryClient.invalidateQueries(['expenses-summary'])
      setEditCategoryModalOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error updating category:', error)
      const message = error.response?.data?.message || 'Error al actualizar la categoría'
      alert(message)
    }
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setEditExpenseModalOpen(true)
  }

  if (isLoading) return <Typography>Cargando resumen...</Typography>

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Resumen por Categorías
      </Typography>
      
      <DateFilter
        onDateChange={setDateFilter}
        title="Filtrar por Período"
      />

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
          <Accordion 
            key={categoryData.id} 
            sx={{ mb: 1 }}
            expanded={expandedCategory === categoryData.id}
            onChange={(event, isExpanded) => {
              setExpandedCategory(isExpanded ? categoryData.id : false)
            }}
          >
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
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="text.secondary">
                    ${categoryData.total.toLocaleString()}
                  </Typography>
                  {categoryData.userId !== null && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCategory(categoryData)
                      }}
                      sx={{ ml: 1 }}
                      title="Editar categoría"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {categoryData.userId === null && (
                    <Chip 
                      label="Sistema" 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
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
                      <TableRow 
                        key={expense.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => handleEditExpense(expense)}
                      >
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

      {/* Modal para editar categorías */}
      <Dialog open={editCategoryModalOpen} onClose={() => setEditCategoryModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Categoría</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la Categoría"
                  value={selectedCategory?.name || ''}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={selectedCategory?.color || '#757575'}
                  onChange={(e) => setSelectedCategory({...selectedCategory, color: e.target.value})}
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: selectedCategory?.color || '#757575',
                          mr: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                    )
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdateCategory}
            disabled={!selectedCategory?.name}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar gastos */}
      <EditExpenseModal
        open={editExpenseModalOpen}
        onClose={() => {
          setEditExpenseModalOpen(false)
          setSelectedExpense(null)
        }}
        expense={selectedExpense}
      />
    </Box>
  )
}

export default CategorySummary