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
  CircularProgress
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'
import DateFilter from './DateFilter'
import EditExpenseModal from './EditExpenseModal'

const ExpenseList = () => {
  const queryClient = useQueryClient()
  const [dateFilter, setDateFilter] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  
  const { data, isLoading, error } = useQuery(
    ['expenses', dateFilter],
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
      return response.expenses
    },
    {
      refetchOnMount: true
    }
  )

  const handleEdit = (expense) => {
    setSelectedExpense(expense)
    setEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await api.delete(`/expenses/${id}`)
        queryClient.invalidateQueries(['expenses'])
        queryClient.invalidateQueries(['expenses-current-month'])
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

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
        Error al cargar los gastos
      </Typography>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box>
        <DateFilter
          onDateChange={setDateFilter}
          title="Filtrar Gastos"
        />
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          {dateFilter ? 'No hay gastos registrados para el período seleccionado' : 'No hay gastos registrados'}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <DateFilter
        onDateChange={setDateFilter}
        title="Filtrar Gastos"
      />
      
      <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell>Método de Pago</TableCell>
            <TableCell>Cuotas</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {dayjs(expense.expenseDate).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="medium">
                  ${parseFloat(expense.amount).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getPaymentMethodLabel(expense.paymentMethod)}
                  color={getPaymentMethodColor(expense.paymentMethod)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {expense.installments > 1 ? (
                  <Chip
                    label={`Cuota ${expense.currentInstallment}/${expense.installments}`}
                    color="warning"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Pago único"
                    color="default"
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(expense)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(expense.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <EditExpenseModal
      open={editModalOpen}
      onClose={() => {
        setEditModalOpen(false)
        setSelectedExpense(null)
      }}
      expense={selectedExpense}
    />
    </Box>
  )
}

export default ExpenseList