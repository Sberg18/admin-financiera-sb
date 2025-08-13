import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  PieChart,
  ShowChart
} from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import AddExpenseModal from '../components/AddExpenseModal'
import AddIncomeModal from '../components/AddIncomeModal'

const CashFlowPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const queryClient = useQueryClient()
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [viewMode, setViewMode] = useState('single') // 'single' o 'multi'
  const [monthsRange, setMonthsRange] = useState(6) // Para vista multi-mes
  
  // Estados para el modal de detalle
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailModalData, setDetailModalData] = useState({ transactions: [], title: '', totalAmount: 0 })
  
  // Estados para agregar/modificar desde Cash Flow
  const [addFromCashFlowModalOpen, setAddFromCashFlowModalOpen] = useState(false)
  const [cashFlowModalData, setCashFlowModalData] = useState({ type: '', category: '', month: '', year: 0 })

  // Obtener datos del mes seleccionado
  const { data: monthlyData, isLoading } = useQuery(
    ['cashflow-data', selectedMonth.format('YYYY-MM')],
    async () => {
      const year = selectedMonth.year()
      const month = selectedMonth.month() + 1

      const [expensesRes, incomesRes] = await Promise.all([
        api.get(`/expenses?year=${year}&month=${month}`),
        api.get(`/incomes?year=${year}&month=${month}`)
      ])

      const expenses = expensesRes.expenses || []
      const incomes = incomesRes.incomes || []

      // Separar por tipo
      const fixedExpenses = expenses.filter(e => e.type === 'fixed')
      const variableExpenses = expenses.filter(e => e.type === 'variable')
      const fixedIncomes = incomes.filter(i => i.type === 'fixed')
      const variableIncomes = incomes.filter(i => i.type === 'variable')

      // Calcular totales
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const totalIncomes = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0)
      const fixedExpensesTotal = fixedExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const variableExpensesTotal = variableExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const fixedIncomesTotal = fixedIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0)
      const variableIncomesTotal = variableIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0)

      return {
        expenses,
        incomes,
        totals: {
          totalExpenses,
          totalIncomes,
          fixedExpensesTotal,
          variableExpensesTotal,
          fixedIncomesTotal,
          variableIncomesTotal,
          netFlow: totalIncomes - totalExpenses
        }
      }
    },
    {
      enabled: !!selectedMonth
    }
  )

  // Obtener datos para múltiples meses (proyección)
  const { data: multiMonthData } = useQuery(
    ['cashflow-multimonth', selectedMonth.format('YYYY-MM'), monthsRange, viewMode],
    async () => {
      if (viewMode !== 'multi') return null

      const promises = []
      for (let i = -Math.floor(monthsRange/2); i <= Math.floor(monthsRange/2); i++) {
        const targetMonth = selectedMonth.add(i, 'month')
        const year = targetMonth.year()
        const month = targetMonth.month() + 1

        promises.push(
          Promise.all([
            api.get(`/expenses?year=${year}&month=${month}`),
            api.get(`/incomes?year=${year}&month=${month}`)
          ]).then(([expensesRes, incomesRes]) => {
            const expenses = expensesRes.expenses || []
            const incomes = incomesRes.incomes || []
            const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
            const totalIncomes = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0)

            return {
              month: targetMonth.format('MMM YYYY'),
              monthKey: targetMonth.format('YYYY-MM'),
              totalExpenses,
              totalIncomes,
              netFlow: totalIncomes - totalExpenses,
              fixedExpenses: expenses.filter(e => e.type === 'fixed').reduce((sum, e) => sum + parseFloat(e.amount), 0),
              variableExpenses: expenses.filter(e => e.type === 'variable').reduce((sum, e) => sum + parseFloat(e.amount), 0),
              fixedIncomes: incomes.filter(i => i.type === 'fixed').reduce((sum, i) => sum + parseFloat(i.amount), 0),
              variableIncomes: incomes.filter(i => i.type === 'variable').reduce((sum, i) => sum + parseFloat(i.amount), 0),
              // Almacenar transacciones completas para mostrar en el modal
              fixedExpensesList: expenses.filter(e => e.type === 'fixed'),
              variableExpensesList: expenses.filter(e => e.type === 'variable'),
              fixedIncomesList: incomes.filter(i => i.type === 'fixed'),
              variableIncomesList: incomes.filter(i => i.type === 'variable')
            }
          })
        )
      }

      return Promise.all(promises)
    },
    {
      enabled: viewMode === 'multi'
    }
  )

  // Función para manejar click en celda
  const handleCellClick = (transactions, type, month, amount, monthData) => {
    const typeLabels = {
      'fixedExpenses': '🔒 Gastos Fijos',
      'variableExpenses': '📈 Gastos Variables', 
      'fixedIncomes': '🔒 Ingresos Fijos',
      'variableIncomes': '📈 Ingresos Variables'
    }

    setDetailModalData({
      transactions,
      title: `${typeLabels[type]} - ${month}`,
      totalAmount: amount,
      type,
      month: monthData.monthKey,
      monthDisplay: month
    })
    setDetailModalOpen(true)
  }

  // Función para abrir modal de agregar desde cash flow
  const handleAddFromCashFlow = (type, monthData) => {
    const isIncome = type.includes('Income')
    const isFixed = type.includes('fixed')
    const transactionType = isFixed ? 'fixed' : 'variable'
    
    setCashFlowModalData({
      type: isIncome ? 'income' : 'expense',
      category: transactionType,
      month: monthData.monthKey,
      year: dayjs(monthData.monthKey).year(),
      monthDisplay: monthData.month
    })
    setAddFromCashFlowModalOpen(true)
  }

  // Cerrar modal de detalle y abrir modal de agregar
  const handleAddNewFromDetail = () => {
    const { type, month } = detailModalData
    setDetailModalOpen(false)
    
    const isIncome = type.includes('Income')
    const isFixed = type.includes('fixed')
    const transactionType = isFixed ? 'fixed' : 'variable'
    
    setCashFlowModalData({
      type: isIncome ? 'income' : 'expense',
      category: transactionType,
      month: month,
      year: dayjs(month).year(),
      monthDisplay: detailModalData.monthDisplay
    })
    setAddFromCashFlowModalOpen(true)
  }

  const navigateMonth = (direction) => {
    setSelectedMonth(prev => prev.add(direction, 'month'))
  }

  // Componente de barra de progreso para visualizar proporciones
  const ProgressBar = ({ label, value, total, color, icon: Icon }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon sx={{ fontSize: 16, color }} />
            <Typography variant="body2">{label}</Typography>
          </Box>
          <Typography variant="body2" fontWeight="bold">
            ${value.toLocaleString()} ({percentage.toFixed(1)}%)
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': { 
              backgroundColor: color,
              borderRadius: 4
            }
          }}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          💰 Cash Flow
        </Typography>
        
        <ButtonGroup variant="outlined" size="small">
          <Button 
            variant={viewMode === 'single' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('single')}
          >
            Mensual
          </Button>
          <Button 
            variant={viewMode === 'multi' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('multi')}
          >
            Proyección
          </Button>
        </ButtonGroup>
      </Box>

      {/* Navegación de Mes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <IconButton onClick={() => navigateMonth(-1)}>
              <ArrowBack />
            </IconButton>
            
            <Box textAlign="center">
              <Typography variant="h6">
                {selectedMonth.format('MMMM YYYY')}
              </Typography>
              {viewMode === 'multi' && (
                <Typography variant="caption" color="textSecondary">
                  Vista de {monthsRange} meses
                </Typography>
              )}
            </Box>
            
            <IconButton onClick={() => navigateMonth(1)}>
              <ArrowForward />
            </IconButton>
          </Box>

          {viewMode === 'multi' && (
            <Box display="flex" justifyContent="center" mt={2} gap={1}>
              {[3, 6, 12].map(months => (
                <Button
                  key={months}
                  size="small"
                  variant={monthsRange === months ? 'contained' : 'outlined'}
                  onClick={() => setMonthsRange(months)}
                >
                  {months}m
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Resumen del Mes Actual */}
      {viewMode === 'single' && monthlyData && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6">
                        ${monthlyData.totals.totalIncomes.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Ingresos</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={`🔒 $${monthlyData.totals.fixedIncomesTotal.toLocaleString()}`} size="small" />
                    <Chip label={`📈 $${monthlyData.totals.variableIncomesTotal.toLocaleString()}`} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingDown sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6">
                        ${monthlyData.totals.totalExpenses.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Gastos</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={`🔒 $${monthlyData.totals.fixedExpensesTotal.toLocaleString()}`} size="small" />
                    <Chip label={`📈 $${monthlyData.totals.variableExpensesTotal.toLocaleString()}`} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ 
                bgcolor: monthlyData.totals.netFlow >= 0 ? 'success.main' : 'error.main',
                color: 'white' 
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccountBalance sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6">
                        ${Math.abs(monthlyData.totals.netFlow).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {monthlyData.totals.netFlow >= 0 ? 'Flujo Positivo' : 'Flujo Negativo'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PieChart sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6">
                        {monthlyData.totals.totalExpenses > 0 ? 
                          ((monthlyData.totals.fixedExpensesTotal / monthlyData.totals.totalExpenses) * 100).toFixed(1) : 0}%
                      </Typography>
                      <Typography variant="body2">Gastos Fijos</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Análisis visual con barras de progreso */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Análisis de Ingresos
                  </Typography>
                  <ProgressBar
                    label="Ingresos Fijos"
                    value={monthlyData.totals.fixedIncomesTotal}
                    total={monthlyData.totals.totalIncomes}
                    color={theme.palette.success.main}
                    icon={TrendingUp}
                  />
                  <ProgressBar
                    label="Ingresos Variables"
                    value={monthlyData.totals.variableIncomesTotal}
                    total={monthlyData.totals.totalIncomes}
                    color={theme.palette.info.main}
                    icon={ShowChart}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TrendingDown sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Análisis de Gastos
                  </Typography>
                  <ProgressBar
                    label="Gastos Fijos"
                    value={monthlyData.totals.fixedExpensesTotal}
                    total={monthlyData.totals.totalExpenses}
                    color={theme.palette.error.main}
                    icon={TrendingDown}
                  />
                  <ProgressBar
                    label="Gastos Variables"
                    value={monthlyData.totals.variableExpensesTotal}
                    total={monthlyData.totals.totalExpenses}
                    color={theme.palette.warning.main}
                    icon={ShowChart}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Vista Multi-Mes con Tabla Reorganizada */}
      {viewMode === 'multi' && multiMonthData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Flujo de Fondos - Proyección {monthsRange} Meses
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell key={monthData.monthKey} align="center" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem', lineHeight: 1.2 }}>
                            {monthData.month.split(' ')[0]}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: isMobile ? '0.65rem' : '0.7rem', color: 'text.secondary', lineHeight: 1 }}>
                            {monthData.month.split(' ')[1]}
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Fila Gastos Fijos */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>🔒 Gastos Fijos</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell 
                        key={`fixedExpenses-${monthData.monthKey}`} 
                        align="center" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'error.50' },
                          color: 'error.main',
                          fontWeight: monthData.monthKey === selectedMonth.format('YYYY-MM') ? 'bold' : 'normal',
                          textDecoration: monthData.fixedExpenses === 0 ? 'underline' : 'none',
                          fontStyle: monthData.fixedExpenses === 0 ? 'italic' : 'normal'
                        }}
                        onClick={() => {
                          if (monthData.fixedExpenses > 0) {
                            handleCellClick(monthData.fixedExpensesList, 'fixedExpenses', monthData.month, monthData.fixedExpenses, monthData)
                          } else {
                            handleAddFromCashFlow('fixedExpenses', monthData)
                          }
                        }}
                      >
                        ${monthData.fixedExpenses.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      ${multiMonthData.reduce((sum, m) => sum + m.fixedExpenses, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Fila Gastos Variables */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'warning.main' }}>📈 Gastos Variables</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell 
                        key={`variableExpenses-${monthData.monthKey}`} 
                        align="center" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'warning.50' },
                          color: 'warning.main',
                          fontWeight: monthData.monthKey === selectedMonth.format('YYYY-MM') ? 'bold' : 'normal',
                          textDecoration: monthData.variableExpenses === 0 ? 'underline' : 'none',
                          fontStyle: monthData.variableExpenses === 0 ? 'italic' : 'normal'
                        }}
                        onClick={() => {
                          if (monthData.variableExpenses > 0) {
                            handleCellClick(monthData.variableExpensesList, 'variableExpenses', monthData.month, monthData.variableExpenses, monthData)
                          } else {
                            handleAddFromCashFlow('variableExpenses', monthData)
                          }
                        }}
                      >
                        ${monthData.variableExpenses.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      ${multiMonthData.reduce((sum, m) => sum + m.variableExpenses, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Fila Ingresos Fijos */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>🔒 Ingresos Fijos</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell 
                        key={`fixedIncomes-${monthData.monthKey}`} 
                        align="center" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'success.50' },
                          color: 'success.main',
                          fontWeight: monthData.monthKey === selectedMonth.format('YYYY-MM') ? 'bold' : 'normal',
                          textDecoration: monthData.fixedIncomes === 0 ? 'underline' : 'none',
                          fontStyle: monthData.fixedIncomes === 0 ? 'italic' : 'normal'
                        }}
                        onClick={() => {
                          if (monthData.fixedIncomes > 0) {
                            handleCellClick(monthData.fixedIncomesList, 'fixedIncomes', monthData.month, monthData.fixedIncomes, monthData)
                          } else {
                            handleAddFromCashFlow('fixedIncomes', monthData)
                          }
                        }}
                      >
                        ${monthData.fixedIncomes.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${multiMonthData.reduce((sum, m) => sum + m.fixedIncomes, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Fila Ingresos Variables */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'info.main' }}>📈 Ingresos Variables</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell 
                        key={`variableIncomes-${monthData.monthKey}`} 
                        align="center" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'info.50' },
                          color: 'info.main',
                          fontWeight: monthData.monthKey === selectedMonth.format('YYYY-MM') ? 'bold' : 'normal',
                          textDecoration: monthData.variableIncomes === 0 ? 'underline' : 'none',
                          fontStyle: monthData.variableIncomes === 0 ? 'italic' : 'normal'
                        }}
                        onClick={() => {
                          if (monthData.variableIncomes > 0) {
                            handleCellClick(monthData.variableIncomesList, 'variableIncomes', monthData.month, monthData.variableIncomes, monthData)
                          } else {
                            handleAddFromCashFlow('variableIncomes', monthData)
                          }
                        }}
                      >
                        ${monthData.variableIncomes.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      ${multiMonthData.reduce((sum, m) => sum + m.variableIncomes, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Fila Flujo Neto */}
                  <TableRow sx={{ bgcolor: 'action.hover', borderTop: '2px solid', borderColor: 'divider' }}>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>💰 Flujo Neto</TableCell>
                    {multiMonthData.map((monthData) => (
                      <TableCell 
                        key={`netFlow-${monthData.monthKey}`} 
                        align="center" 
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: 'primary.50',
                          color: monthData.netFlow >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {monthData.netFlow >= 0 ? '+' : ''}${monthData.netFlow.toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: multiMonthData.reduce((sum, m) => sum + m.netFlow, 0) >= 0 ? 'success.main' : 'error.main',
                        fontSize: '1.1rem'
                      }}
                    >
                      ${multiMonthData.reduce((sum, m) => sum + m.netFlow, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Resumen de la proyección */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>Resumen de Proyección</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                      <Typography variant="h6" color="success.contrastText">
                        ${multiMonthData.reduce((sum, m) => sum + m.totalIncomes, 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="success.contrastText">
                        Total Ingresos ({monthsRange} meses)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent>
                      <Typography variant="h6" color="error.contrastText">
                        ${multiMonthData.reduce((sum, m) => sum + m.totalExpenses, 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="error.contrastText">
                        Total Gastos ({monthsRange} meses)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary.contrastText">
                        ${multiMonthData.reduce((sum, m) => sum + m.netFlow, 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="primary.contrastText">
                        Flujo Neto Proyectado
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modal para agregar desde Cash Flow */}
      {cashFlowModalData.type === 'expense' && (
        <AddExpenseModal
          open={addFromCashFlowModalOpen}
          onClose={() => {
            setAddFromCashFlowModalOpen(false)
            // Refrescar datos después de agregar
            queryClient.invalidateQueries(['cashflow-multimonth'])
          }}
          initialData={{
            date: dayjs().year(cashFlowModalData.year).month(dayjs(cashFlowModalData.month).month()).format('YYYY-MM-DD'),
            type: cashFlowModalData.category,
            title: `Agregar Gasto ${cashFlowModalData.category === 'fixed' ? 'Fijo' : 'Variable'} - ${cashFlowModalData.monthDisplay}`
          }}
        />
      )}
      
      {cashFlowModalData.type === 'income' && (
        <AddIncomeModal
          open={addFromCashFlowModalOpen}
          onClose={() => {
            setAddFromCashFlowModalOpen(false)
            // Refrescar datos después de agregar
            queryClient.invalidateQueries(['cashflow-multimonth'])
          }}
          initialData={{
            date: dayjs().year(cashFlowModalData.year).month(dayjs(cashFlowModalData.month).month()).format('YYYY-MM-DD'),
            type: cashFlowModalData.category,
            title: `Agregar Ingreso ${cashFlowModalData.category === 'fixed' ? 'Fijo' : 'Variable'} - ${cashFlowModalData.monthDisplay}`
          }}
        />
      )}

      {/* Modal de Detalle de Transacciones */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {detailModalData.title}
          <Typography variant="body2" color="textSecondary">
            Total: ${detailModalData.totalAmount.toLocaleString()}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {detailModalData.transactions.length > 0 ? (
            <List>
              {detailModalData.transactions.map((transaction, index) => (
                <React.Fragment key={transaction.id || index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {transaction.description || transaction.name}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ${parseFloat(transaction.amount).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Fecha: {new Date(transaction.date).toLocaleDateString('es-ES')}
                          </Typography>
                          {transaction.category && (
                            <Typography variant="body2" color="textSecondary">
                              Categoría: {transaction.category}
                            </Typography>
                          )}
                          {transaction.type && (
                            <Chip 
                              label={transaction.type === 'fixed' ? '🔒 Fijo' : '📈 Variable'} 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < detailModalData.transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay transacciones para mostrar
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined" 
            onClick={handleAddNewFromDetail}
            sx={{ mr: 'auto' }}
          >
            Agregar Nuevo
          </Button>
          <Button onClick={() => setDetailModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CashFlowPage