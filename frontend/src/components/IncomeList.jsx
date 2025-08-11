import React from 'react'
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

const IncomeList = () => {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery(
    ['incomes'],
    async () => {
      const response = await api.get('/incomes')
      return response.incomes
    }
  )

  const handleDelete = async (id) => {
    try {
      await api.delete(`/incomes/${id}`)
      queryClient.invalidateQueries(['incomes'])
    } catch (error) {
      console.error('Error deleting income:', error)
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
      <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
        No hay ingresos registrados
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
  )
}

export default IncomeList