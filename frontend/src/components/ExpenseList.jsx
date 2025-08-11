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
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useQuery, useQueryClient } from 'react-query'
import dayjs from 'dayjs'
import api from '../services/api'

const ExpenseList = () => {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery(
    ['expenses'],
    async () => {
      const response = await api.get('/expenses')
      return response.expenses
    }
  )

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      queryClient.invalidateQueries(['expenses'])
    } catch (error) {
      console.error('Error deleting expense:', error)
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
      <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
        No hay gastos registrados
      </Typography>
    )
  }

  return (
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
                  <Typography variant="body2">
                    {expense.currentInstallment}/{expense.installments}
                  </Typography>
                ) : (
                  'Pago único'
                )}
              </TableCell>
              <TableCell align="center">
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
  )
}

export default ExpenseList