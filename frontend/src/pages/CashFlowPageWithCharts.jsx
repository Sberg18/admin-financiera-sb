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
  Chip
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
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const CashFlowPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [viewMode, setViewMode] = useState('single') // 'single' o 'multi'
  const [monthsRange, setMonthsRange] = useState(6) // Para vista multi-mes

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
              variableIncomes: incomes.filter(i => i.type === 'variable').reduce((sum, i) => sum + parseFloat(i.amount), 0)
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

  const navigateMonth = (direction) => {
    setSelectedMonth(prev => prev.add(direction, 'month'))
  }

  // Configuración de gráficos
  const pieChartData = monthlyData ? {
    labels: ['🔒 Gastos Fijos', '📈 Gastos Variables', '🔒 Ingresos Fijos', '📈 Ingresos Variables'],
    datasets: [{
      data: [
        monthlyData.totals.fixedExpensesTotal,
        monthlyData.totals.variableExpensesTotal,
        monthlyData.totals.fixedIncomesTotal,
        monthlyData.totals.variableIncomesTotal
      ],
      backgroundColor: [
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.info.main
      ],
      borderWidth: 2,
      borderColor: theme.palette.background.paper
    }]
  } : null

  const lineChartData = multiMonthData ? {
    labels: multiMonthData.map(d => d.month),
    datasets: [
      {
        label: 'Flujo Neto',
        data: multiMonthData.map(d => d.netFlow),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        tension: 0.4
      },
      {
        label: 'Ingresos Totales',
        data: multiMonthData.map(d => d.totalIncomes),
        borderColor: theme.palette.success.main,
        backgroundColor: 'transparent',
        tension: 0.4
      },
      {
        label: 'Gastos Totales',
        data: multiMonthData.map(d => d.totalExpenses),
        borderColor: theme.palette.error.main,
        backgroundColor: 'transparent',
        tension: 0.4
      }
    ]
  } : null

  const barChartData = multiMonthData ? {
    labels: multiMonthData.map(d => d.month),
    datasets: [
      {
        label: '🔒 Gastos Fijos',
        data: multiMonthData.map(d => d.fixedExpenses),
        backgroundColor: theme.palette.error.main,
        borderRadius: 4
      },
      {
        label: '📈 Gastos Variables',
        data: multiMonthData.map(d => d.variableExpenses),
        backgroundColor: theme.palette.warning.main,
        borderRadius: 4
      },
      {
        label: '🔒 Ingresos Fijos',
        data: multiMonthData.map(d => d.fixedIncomes),
        backgroundColor: theme.palette.success.main,
        borderRadius: 4
      },
      {
        label: '📈 Ingresos Variables',
        data: multiMonthData.map(d => d.variableIncomes),
        backgroundColor: theme.palette.info.main,
        borderRadius: 4
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.toLocaleString()}`
          }
        }
      }
    },
    scales: viewMode === 'multi' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString()
          }
        }
      }
    } : undefined
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
      )}

      {/* Gráficos */}
      <Grid container spacing={3}>
        {viewMode === 'single' && pieChartData && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Composición Financiera - {selectedMonth.format('MMM YYYY')}
                </Typography>
                <Box height={300}>
                  <Pie data={pieChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {viewMode === 'multi' && lineChartData && (
          <>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Flujo de Fondos - Proyección {monthsRange} Meses
                  </Typography>
                  <Box height={300}>
                    <Line data={lineChartData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparativo Fijo vs Variable
                  </Typography>
                  <Box height={400}>
                    <Bar data={barChartData} options={{
                      ...chartOptions,
                      scales: {
                        x: {
                          stacked: false
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '$' + value.toLocaleString()
                            }
                          }
                        }
                      }
                    }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}

export default CashFlowPage