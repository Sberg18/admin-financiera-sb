import React, { useState } from 'react'
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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import DateFilter from './DateFilter'
import EditIncomeModal from './EditIncomeModal'

const IncomeList = () => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [dateFilter, setDateFilter] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState(null)
  
  const { data, isLoading, error } = useQuery(
    ['incomes', dateFilter],
    async () => {
      let url = '/incomes'
      if (dateFilter) {
        if (dateFilter.type === 'monthly') {
          url = `/incomes?year=${dateFilter.year}&month=${dateFilter.month}`
        } else if (dateFilter.type === 'range') {
          url = `/incomes?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
        }
      }
      const response = await api.get(url)
      return response.incomes
    },
    {
      refetchOnMount: true
    }
  )

  const handleEdit = (income) => {
    setSelectedIncome(income)
    setEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      try {
        await api.delete(`/incomes/${id}`)
        queryClient.invalidateQueries(['incomes'])
        queryClient.invalidateQueries(['incomes-current-month'])
      } catch (error) {
        console.error('Error deleting income:', error)
      }
    }
  }

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
        Error al cargar los ingresos
      </Typography>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box>
        <DateFilter
          onDateChange={setDateFilter}
          title="Filtrar Ingresos"
        />
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          {dateFilter ? 'No hay ingresos registrados para el período seleccionado' : 'No hay ingresos registrados'}
        </Typography>
      </Box>
    )
  }

  if (isMobile) {
    return (
      <Box>
        <DateFilter
          onDateChange={setDateFilter}
          title="Filtrar Ingresos"
        />
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          {data.map((income) => (
            <Card key={income.id} variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" component="div" fontWeight="medium">
                    {income.description || 'Sin descripción'}
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    ${parseFloat(income.amount).toLocaleString()}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {dayjs(income.incomeDate).format('DD/MM/YYYY')}
                </Typography>
                
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {income.isRecurring ? (
                    <Chip
                      label={income.recurringFrequency || 'Recurrente'}
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Una vez"
                      color="default"
                      size="small"
                    />
                  )}
                </Box>
                
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(income)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(income.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <EditIncomeModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedIncome(null)
          }}
          income={selectedIncome}
        />
      </Box>
    )
  }

  return (
    <Box>
      <DateFilter
        onDateChange={setDateFilter}
        title="Filtrar Ingresos"
      />
      
      <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Recurrente</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((income) => (
              <TableRow key={income.id}>
                <TableCell>
                  {dayjs(income.incomeDate).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell>{income.description || 'Sin descripción'}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    ${parseFloat(income.amount).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {income.isRecurring ? (
                    <Chip
                      label={income.recurringFrequency || 'Recurrente'}
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Una vez
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(income)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(income.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditIncomeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedIncome(null)
        }}
        income={selectedIncome}
      />
    </Box>
  )
}

export default IncomeList