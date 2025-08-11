import React, { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Add as AddIcon
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../services/api'
import AddIncomeModal from './AddIncomeModal'
import AddExpenseModal from './AddExpenseModal'
import AddAssetModal from './AddAssetModal'
import BalanceDetailModal from './BalanceDetailModal'

const FinancialSummary = () => {
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const { data: expenses } = useQuery(
    ['expenses'],
    async () => {
      const response = await api.get('/expenses')
      return response.expenses || []
    }
  )

  const { data: incomes } = useQuery(
    ['incomes'],
    async () => {
      const response = await api.get('/incomes')
      return response.incomes || []
    }
  )

  const { data: assets } = useQuery(
    ['assets'],
    async () => {
      const response = await api.get('/onboarding/assets')
      return response.assets || []
    }
  )

  const totalExpenses = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0
  const totalIncomes = incomes?.reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0
  const totalAssets = assets?.reduce((sum, asset) => {
    const price = asset.currentPrice || asset.purchasePrice || 0
    return sum + (parseFloat(asset.quantity) * parseFloat(price))
  }, 0) || 0
  const balance = totalIncomes - totalExpenses

  const SummaryCard = ({ title, amount, color, icon: Icon, onClick, showAddButton = false, onAdd }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? { 
          transform: 'translateY(-2px)', 
          boxShadow: 3 
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {title}
              </Typography>
              {showAddButton && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd()
                  }}
                  sx={{ color: color }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Typography variant="h5" component="div" color={color}>
              ${amount.toLocaleString()}
            </Typography>
          </Box>
          <Icon sx={{ fontSize: 40, color }} />
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <SummaryCard
            title="Total Ingresos"
            amount={totalIncomes}
            color="success.main"
            icon={TrendingUp}
            showAddButton={true}
            onAdd={() => setIncomeModalOpen(true)}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <SummaryCard
            title="Total Gastos"
            amount={totalExpenses}
            color="error.main"
            icon={TrendingDown}
            showAddButton={true}
            onAdd={() => setExpenseModalOpen(true)}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <SummaryCard
            title="Balance Mensual"
            amount={balance}
            color={balance >= 0 ? "success.main" : "error.main"}
            icon={AccountBalance}
            onClick={() => setBalanceModalOpen(true)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <SummaryCard
            title="Total Activos"
            amount={totalAssets}
            color="info.main"
            icon={Savings}
            showAddButton={true}
            onAdd={() => setAssetModalOpen(true)}
          />
        </Grid>
      </Grid>

      <AddIncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
      />

      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      <AddAssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
      />

      <BalanceDetailModal
        open={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        incomes={incomes}
        expenses={expenses}
        totalIncomes={totalIncomes}
        totalExpenses={totalExpenses}
        balance={balance}
      />
    </>
  )
}

export default FinancialSummary