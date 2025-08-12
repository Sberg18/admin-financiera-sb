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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
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
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import DateFilter from '../components/DateFilter'
import EditExpenseModal from '../components/EditExpenseModal'
import EditIncomeModal from '../components/EditIncomeModal'
import AddExpenseModal from '../components/AddExpenseModal'
import AddIncomeModal from '../components/AddIncomeModal'
import ExchangeRateDisplay from '../components/ExchangeRateDisplay'

const MonthlyView = () => {
  const queryClient = useQueryClient()
  const [dateFilter, setDateFilter] = useState(null)
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false)
  const [editIncomeModalOpen, setEditIncomeModalOpen] = useState(false)
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)
  const [addIncomeModalOpen, setAddIncomeModalOpen] = useState(false)
  const [editCardModalOpen, setEditCardModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [selectedIncome, setSelectedIncome] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

  // Queries para obtener datos del periodo seleccionado
  const { data: monthlyExpenses, isLoading: loadingExpenses } = useQuery(
    ['expenses', dateFilter],
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

  const { data: monthlyIncomes, isLoading: loadingIncomes } = useQuery(
    ['incomes', dateFilter],
    async () => {
      if (!dateFilter) return []
      
      let url = '/incomes'
      if (dateFilter.type === 'monthly') {
        url = `/incomes?year=${dateFilter.year}&month=${dateFilter.month}`
      } else if (dateFilter.type === 'range') {
        url = `/incomes?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
      }
      
      const response = await api.get(url)
      return response.incomes || []
    },
    {
      enabled: !!dateFilter
    }
  )


  const { data: creditCards } = useQuery(
    ['creditCards'],
    async () => {
      const response = await api.get('/onboarding/credit-cards')
      return response.creditCards || []
    }
  )

  // Agrupar gastos dinámicamente por todas las tarjetas
  const creditCardExpenses = creditCards?.map(card => ({
    card,
    expenses: monthlyExpenses?.filter(e => e.creditCardId === card.id) || []
  })) || []

  const groupedExpenses = {
    efectivo: monthlyExpenses?.filter(e => e.paymentMethod === 'cash') || []
  }

  // Calcular totales
  const totalIncomes = monthlyIncomes?.reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0
  const totalExpenses = monthlyExpenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0
  const balance = totalIncomes - totalExpenses

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setEditExpenseModalOpen(true)
  }

  const handleDeleteExpense = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await api.delete(`/expenses/${id}`)
        queryClient.invalidateQueries(['expenses'])
        queryClient.invalidateQueries(['expenses-current-month'])
        queryClient.invalidateQueries(['incomes'])
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

  const handleEditIncome = (income) => {
    setSelectedIncome(income)
    setEditIncomeModalOpen(true)
  }

  const handleDeleteIncome = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      try {
        await api.delete(`/incomes/${id}`)
        queryClient.invalidateQueries(['incomes'])
        queryClient.invalidateQueries(['incomes-current-month'])
        queryClient.invalidateQueries(['expenses'])
      } catch (error) {
        console.error('Error deleting income:', error)
      }
    }
  }

  const handleEditCard = (card) => {
    setSelectedCard(card)
    setEditCardModalOpen(true)
  }

  const handleViewCategorySummary = () => {
    // Navegar a la pestaña de "Resumen por Categorías"
    window.dispatchEvent(new CustomEvent('navigateToCategory', { detail: { tab: 1 } }))
  }

  const getPaymentMethodColor = (method, cardType) => {
    if (method === 'credit_card') {
      return cardType?.name === 'Visa' ? 'primary' : cardType?.name === 'American Express' ? 'secondary' : 'default'
    }
    return method === 'cash' ? 'success' : 'info'
  }

  const CategorySection = ({ title, items, color, icon: Icon, type, cardInfo }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon sx={{ color: color }} />
            <Box>
              <Typography variant="h6">{title}</Typography>
              {cardInfo && (
                <Box display="flex" gap={1} mt={0.5}>
                  <Chip 
                    label={`Cierre: ${cardInfo.closingDay || 'N/A'}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => handleEditCard(cardInfo)}
                    sx={{ fontSize: '0.7rem', height: '20px', cursor: 'pointer' }}
                  />
                  <Chip 
                    label={`Vto: ${cardInfo.paymentDay || 'N/A'}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => handleEditCard(cardInfo)}
                    sx={{ fontSize: '0.7rem', height: '20px', cursor: 'pointer' }}
                  />
                </Box>
              )}
            </Box>
            <Chip 
              label={`$${items.reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString()}`}
              color={type === 'income' ? 'success' : 'error'}
              size="small"
            />
          </Box>
          <IconButton 
            color="primary" 
            onClick={() => {
              if (type === 'income') {
                setAddIncomeModalOpen(true)
              } else {
                setAddExpenseModalOpen(true)
              }
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
                    {type === 'income' ? (
                      dayjs(item.incomeDate).format('DD/MM')
                    ) : (
                      <Typography variant="body2" fontSize="0.8rem">
                        Compra: {dayjs(item.expenseDate).format('DD/MM')}
                      </Typography>
                    )}
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
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => type === 'expense' ? handleEditExpense(item) : handleEditIncome(item)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => type === 'expense' ? handleDeleteExpense(item.id) : handleDeleteIncome(item.id)}
                    >
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
      <Typography variant="h4" gutterBottom>
        Vista Detallada por Período
      </Typography>
      
      <DateFilter
        onDateChange={setDateFilter}
        title="Seleccionar Período"
      />

      {/* Resumen del mes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp sx={{ fontSize: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4">
                    ${totalIncomes.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Ingreso Mensual
                  </Typography>
                  <ExchangeRateDisplay arsAmount={totalIncomes} size="small" />
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4">
                    ${totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Gasto Mensual
                  </Typography>
                  <ExchangeRateDisplay arsAmount={totalExpenses} size="small" />
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4">
                    ${Math.abs(balance).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {balance >= 0 ? '✅ Balance Positivo' : '⚠️ Balance Negativo'}
                  </Typography>
                  <ExchangeRateDisplay arsAmount={Math.abs(balance)} size="small" showRefresh />
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
            title="Ingresos Mensuales"
            items={monthlyIncomes || []}
            color="success.main"
            icon={TrendingUp}
            type="income"
          />
        </Grid>

        {/* Columna de Gastos */}
        <Grid item xs={12} md={6}>
          {/* Tarjetas de Crédito - Dinámico */}
          {creditCardExpenses.map((cardData, index) => (
            <CategorySection
              key={cardData.card.id}
              title={`${cardData.card.cardType?.name || 'Tarjeta'} - ${cardData.card.bank?.name} ****${cardData.card.lastFourDigits}`}
              items={cardData.expenses}
              color={index % 3 === 0 ? 'primary.main' : index % 3 === 1 ? 'secondary.main' : 'info.main'}
              icon={CreditCard}
              type="expense"
              cardInfo={cardData.card}
            />
          ))}

          {/* Efectivo */}
          <CategorySection
            title="EFECTIVO"
            items={groupedExpenses.efectivo}
            color="success.main"
            icon={AccountBalance}
            type="expense"
          />
          
          {/* Botón para ver resumen por categorías */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleViewCategorySummary}
                  startIcon={<AccountBalance />}
                  fullWidth
                >
                  Ver Resumen por Categorías
                </Button>
              </Box>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      <EditExpenseModal
        open={editExpenseModalOpen}
        onClose={() => {
          setEditExpenseModalOpen(false)
          setSelectedExpense(null)
        }}
        expense={selectedExpense}
      />

      <EditIncomeModal
        open={editIncomeModalOpen}
        onClose={() => {
          setEditIncomeModalOpen(false)
          setSelectedIncome(null)
        }}
        income={selectedIncome}
      />

      <AddExpenseModal
        open={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
      />

      <AddIncomeModal
        open={addIncomeModalOpen}
        onClose={() => setAddIncomeModalOpen(false)}
      />

      {/* Modal para editar fechas de tarjeta */}
      <Dialog open={editCardModalOpen} onClose={() => setEditCardModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Fechas de Tarjeta</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedCard?.cardName}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Día de Cierre"
                  type="number"
                  value={selectedCard?.closingDay || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, closingDay: parseInt(e.target.value)})}
                  InputProps={{ inputProps: { min: 1, max: 31 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Día de Vencimiento"
                  type="number"
                  value={selectedCard?.paymentDay || ''}
                  onChange={(e) => setSelectedCard({...selectedCard, paymentDay: parseInt(e.target.value)})}
                  InputProps={{ inputProps: { min: 1, max: 31 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCardModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await api.put(`/onboarding/credit-cards/${selectedCard.id}`, {
                  closingDay: selectedCard.closingDay,
                  paymentDay: selectedCard.paymentDay
                })
                queryClient.invalidateQueries(['creditCards'])
                setEditCardModalOpen(false)
              } catch (error) {
                console.error('Error updating card:', error)
              }
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default MonthlyView