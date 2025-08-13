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
  TextField,
  useTheme,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material'
import {
  ExpandMore,
  CreditCard,
  MonetizationOn,
  AccountBalance,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import DateFilter from './DateFilter'
import EditExpenseModal from './EditExpenseModal'

const CategorySummary = ({ selectedCategoryId }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  
  const queryClient = useQueryClient()
  const [dateFilter, setDateFilter] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(selectedCategoryId)
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Actualizar categoría expandida cuando se reciba un nuevo selectedCategoryId
  React.useEffect(() => {
    if (selectedCategoryId) {
      setExpandedCategory(selectedCategoryId)
    }
  }, [selectedCategoryId])

  const { data: monthlyExpenses, isLoading } = useQuery(
    ['expenses-summary', dateFilter],
    async () => {
      let url = '/expenses'
      if (dateFilter) {
        if (dateFilter.type === 'monthly') {
          url = `/expenses?year=${dateFilter.year}&month=${dateFilter.month}`
        } else if (dateFilter.type === 'range') {
          url = `/expenses?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
        }
      }
      
      const response = await api.get(url)
      return response.expenses || []
    },
    {
      refetchOnMount: true
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

  const getExpensePaymentLabel = (expense) => {
    if (expense.paymentMethod === 'cash') {
      return 'Efectivo'
    }
    
    if (expense.paymentMethod === 'credit_card' || expense.paymentMethod === 'debit_card') {
      if (expense.creditCard) {
        const cardType = expense.creditCard.cardType?.name || ''
        // Usar cardMode si existe, sino deducir del paymentMethod
        const cardMode = expense.creditCard.cardMode === 'debit' ? 'Débito' : 'Crédito'
        const bankName = expense.creditCard.bank?.name || ''
        const lastFour = expense.creditCard.lastFourDigits ? `****${expense.creditCard.lastFourDigits}` : ''
        
        return `${cardType} ${cardMode} ${bankName} ${lastFour}`.trim()
      }
      return expense.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'
    }
    
    return expense.paymentMethod
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

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setDeleteCategoryModalOpen(true)
  }

  const confirmDeleteCategory = async () => {
    try {
      await api.delete(`/categories/expenses/${categoryToDelete.id}`)
      queryClient.invalidateQueries(['expense-categories'])
      queryClient.invalidateQueries(['expenses-summary'])
      setDeleteCategoryModalOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
      const message = error.response?.data?.message || 'Error al eliminar la categoría'
      alert(message)
    }
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setEditExpenseModalOpen(true)
  }

  if (isLoading) return <Typography>Cargando resumen...</Typography>

  return (
    <Box sx={{ px: isMobile ? 1 : 0 }}>
      <Typography 
        variant={isMobile ? "h5" : "h5"} 
        gutterBottom
        sx={{ 
          fontSize: isMobile ? '1.3rem' : '1.5rem',
          fontWeight: 600,
          mb: isMobile ? 2 : 3
        }}
      >
        Resumen por Categorías
      </Typography>
      
      <DateFilter
        onDateChange={setDateFilter}
        title="Filtrar por Período"
      />

      {/* Resumen total por método de pago */}
      <Paper sx={{ p: isMobile ? 2 : 2, mb: 3 }}>
        <Typography 
          variant={isMobile ? "h6" : "h6"} 
          gutterBottom
          sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}
        >
          Total por Método de Pago
        </Typography>
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {['cash', 'debit_card', 'credit_card'].map((method) => (
            totalByPaymentMethod[method] > 0 && (
              <Grid item xs={12} sm={6} md={3} key={method}>
                <Card sx={{ 
                  bgcolor: getPaymentMethodColor(method), 
                  color: 'white',
                  minWidth: isMobile ? 'auto' : 150,
                  height: isMobile ? 80 : 'auto'
                }}>
                  <CardContent sx={{ 
                    pb: '16px !important',
                    p: isMobile ? 1.5 : 2
                  }}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={isMobile ? 1 : 1}
                      sx={{ 
                        flexDirection: isMobile ? 'row' : 'row',
                        justifyContent: isMobile ? 'space-between' : 'flex-start'
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flex: isMobile ? '1' : 'none'
                        }}
                      >
                        {getPaymentMethodIcon(method)}
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                          >
                            {getPaymentMethodLabel(method)}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "h6" : "h6"}
                            sx={{ 
                              fontSize: isMobile ? '1rem' : '1.25rem',
                              fontWeight: 600
                            }}
                          >
                            ${totalByPaymentMethod[method].toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          ))}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: '#424242', 
              color: 'white', 
              minWidth: isMobile ? 'auto' : 150,
              height: isMobile ? 80 : 'auto'
            }}>
              <CardContent sx={{ 
                pb: '16px !important',
                p: isMobile ? 1.5 : 2
              }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  sx={{ 
                    flexDirection: isMobile ? 'row' : 'row',
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                    height: '100%'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                    >
                      Total General
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h6" : "h6"}
                      sx={{ 
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        fontWeight: 600
                      }}
                    >
                      ${grandTotal.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Leyenda de colores */}
      <Paper sx={{ p: isMobile ? 2 : 2, mb: 3 }}>
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}
        >
          Leyenda de Métodos de Pago
        </Typography>
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={isMobile ? 1 : 2} 
          sx={{ flexWrap: 'wrap', gap: isMobile ? 1 : 2 }}
        >
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
                color: 'white',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                height: isMobile ? 36 : 32,
                '& .MuiChip-icon': {
                  fontSize: isMobile ? '1.1rem' : '1rem'
                }
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Detalle por categoría */}
      <Box>
        {Object.values(groupedByCategory).map((categoryData) => (
          <Accordion 
            key={categoryData.id} 
            sx={{ 
              mb: 1,
              '& .MuiAccordionSummary-root': {
                minHeight: isMobile ? 64 : 48,
                '&.Mui-expanded': {
                  minHeight: isMobile ? 64 : 48,
                }
              }
            }}
            expanded={expandedCategory === categoryData.id}
            onChange={(event, isExpanded) => {
              setExpandedCategory(isExpanded ? categoryData.id : false)
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  margin: isMobile ? '16px 0' : '12px 0',
                  '&.Mui-expanded': {
                    margin: isMobile ? '16px 0' : '12px 0',
                  }
                }
              }}
            >
              <Box 
                display="flex" 
                alignItems="center" 
                gap={isMobile ? 1.5 : 2} 
                width="100%"
                sx={{
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  alignItems: isSmallScreen ? 'flex-start' : 'center'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: isMobile ? 20 : 16,
                      height: isMobile ? 20 : 16,
                      borderRadius: '50%',
                      backgroundColor: categoryData.color || '#757575',
                      flexShrink: 0
                    }}
                  />
                  <Typography 
                    variant={isMobile ? "h6" : "h6"} 
                    sx={{ 
                      flexGrow: 1,
                      fontSize: isMobile ? '1.1rem' : '1.25rem',
                      fontWeight: 500
                    }}
                  >
                    {categoryData.name}
                  </Typography>
                </Box>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  sx={{
                    flexDirection: isSmallScreen ? 'row' : 'row',
                    alignSelf: isSmallScreen ? 'stretch' : 'center',
                    justifyContent: isSmallScreen ? 'space-between' : 'flex-end'
                  }}
                >
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    color="text.secondary"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '1rem' : '1.25rem'
                    }}
                  >
                    ${categoryData.total.toLocaleString()}
                  </Typography>
                  {categoryData.userId !== null && (
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditCategory(categoryData)
                        }}
                        sx={{ 
                          minWidth: isMobile ? 44 : 32,
                          minHeight: isMobile ? 44 : 32
                        }}
                        title="Editar categoría"
                      >
                        <EditIcon fontSize={isMobile ? "medium" : "small"} />
                      </IconButton>
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategory(categoryData)
                        }}
                        sx={{ 
                          minWidth: isMobile ? 44 : 32,
                          minHeight: isMobile ? 44 : 32,
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                        title="Eliminar categoría"
                      >
                        <DeleteIcon fontSize={isMobile ? "medium" : "small"} />
                      </IconButton>
                    </Box>
                  )}
                  {categoryData.userId === null && (
                    <Chip 
                      label="Sistema" 
                      size={isMobile ? "medium" : "small"}
                      variant="outlined" 
                      sx={{ 
                        ml: 1, 
                        fontSize: isMobile ? '0.8rem' : '0.7rem',
                        height: isMobile ? 32 : 24
                      }}
                    />
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ px: isMobile ? 1 : 3 }}>
              <Stack spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 1, fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                  >
                    Totales por método de pago:
                  </Typography>
                  <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {['cash', 'debit_card', 'credit_card'].map((method) => (
                      categoryData.totals[method] > 0 && (
                        <Chip
                          key={method}
                          icon={getPaymentMethodIcon(method)}
                          label={`${getPaymentMethodLabel(method)}: $${categoryData.totals[method].toLocaleString()}`}
                          sx={{
                            backgroundColor: getPaymentMethodColor(method),
                            color: 'white',
                            fontSize: isMobile ? '0.8rem' : '0.75rem',
                            height: isMobile ? 36 : 32,
                            '& .MuiChip-icon': {
                              fontSize: isMobile ? '1.1rem' : '1rem'
                            }
                          }}
                        />
                      )
                    ))}
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                  >
                    Gastos detallados:
                  </Typography>
                  
                  {isMobile ? (
                    // Mobile card layout
                    <Stack spacing={1.5}>
                      {categoryData.expenses.map((expense) => (
                        <Card
                          key={expense.id}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'action.hover' },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleEditExpense(expense)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                {dayjs(expense.expenseDate).format('DD/MM/YYYY')}
                              </Typography>
                              <Typography 
                                variant="h6" 
                                color="primary.main"
                                sx={{ fontSize: '1.1rem', fontWeight: 600 }}
                              >
                                ${parseFloat(expense.amount).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ mb: 1.5, fontSize: '0.95rem', fontWeight: 500 }}
                            >
                              {expense.description}
                            </Typography>
                            <Chip
                              size="small"
                              icon={getPaymentMethodIcon(expense.paymentMethod)}
                              label={getExpensePaymentLabel(expense)}
                              sx={{
                                backgroundColor: getPaymentMethodColor(expense.paymentMethod),
                                color: 'white',
                                fontSize: '0.8rem',
                                height: 28
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    // Desktop table layout
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
                                  label={getExpensePaymentLabel(expense)}
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
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {Object.keys(groupedByCategory).length === 0 && (
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: 'center',
          mx: isMobile ? 1 : 0
        }}>
          <Typography 
            color="text.secondary"
            sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
          >
            No hay gastos registrados para el período seleccionado
          </Typography>
        </Paper>
      )}

      {/* Modal para editar categorías */}
      <Dialog 
        open={editCategoryModalOpen} 
        onClose={() => setEditCategoryModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: isMobile ? 0 : 2,
            width: isMobile ? '100%' : 'auto'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontSize: isMobile ? '1.2rem' : '1.25rem',
            py: isMobile ? 2 : 1.5
          }}
        >
          Editar Categoría
        </DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Box sx={{ pt: isMobile ? 1 : 2 }}>
            <Grid container spacing={isMobile ? 2.5 : 2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la Categoría"
                  value={selectedCategory?.name || ''}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      minHeight: isMobile ? 56 : 48
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: isMobile ? '1rem' : '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={selectedCategory?.color || '#757575'}
                  onChange={(e) => setSelectedCategory({...selectedCategory, color: e.target.value})}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      minHeight: isMobile ? 56 : 48
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: isMobile ? '1rem' : '0.875rem'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          width: isMobile ? 24 : 20,
                          height: isMobile ? 24 : 20,
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
        <DialogActions 
          sx={{ 
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 1,
            gap: isMobile ? 1 : 0.5
          }}
        >
          <Button 
            onClick={() => setEditCategoryModalOpen(false)}
            sx={{ 
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              minHeight: isMobile ? 44 : 36,
              px: isMobile ? 2 : 1
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateCategory}
            disabled={!selectedCategory?.name}
            sx={{ 
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              minHeight: isMobile ? 44 : 36,
              px: isMobile ? 2 : 1
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar categoría */}
      <Dialog
        open={deleteCategoryModalOpen}
        onClose={() => setDeleteCategoryModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.2rem' : '1.25rem' }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
            ¿Está seguro que desea eliminar la categoría "{categoryToDelete?.name}"?
          </Typography>
          <Typography 
            sx={{ 
              mt: 2, 
              fontSize: isMobile ? '0.9rem' : '0.8rem',
              color: 'warning.main',
              fontStyle: 'italic' 
            }}
          >
            Nota: Esta acción no eliminará los gastos asociados, pero los dejará sin categoría.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 1 }}>
          <Button 
            onClick={() => setDeleteCategoryModalOpen(false)}
            sx={{ fontSize: isMobile ? '0.9rem' : '0.875rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteCategory}
            sx={{ fontSize: isMobile ? '0.9rem' : '0.875rem' }}
          >
            Eliminar
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