import React, { useState } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import { Add as AddIcon, TrendingUp, TrendingDown, CreditCard } from '@mui/icons-material'
import ExpenseList from '../components/ExpenseList'
import IncomeList from '../components/IncomeList'
import AssetsList from '../components/AssetsList'
import CategorySummary from '../components/CategorySummary'
import MonthlyView from './MonthlyView'
import AddExpenseModal from '../components/AddExpenseModal'
import AddIncomeModal from '../components/AddIncomeModal'
import AddAssetModal from '../components/AddAssetModal'
import ManageCreditCardsModal from '../components/ManageCreditCardsModal'
import { useQuery, useQueryClient } from 'react-query'
import api from '../services/api'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const Dashboard = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [manageCreditCardsModalOpen, setManageCreditCardsModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Escuchar eventos de navegación desde MonthlyView
  React.useEffect(() => {
    const handleNavigateToCategory = (event) => {
      const { categoryId, tab } = event.detail
      setSelectedCategoryId(categoryId)
      setActiveTab(tab) // Cambiar a la pestaña de Resumen por Categorías
    }

    window.addEventListener('navigateToCategory', handleNavigateToCategory)
    return () => window.removeEventListener('navigateToCategory', handleNavigateToCategory)
  }, [])


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Dashboard Financiero
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="error"
            startIcon={<TrendingDown />}
            onClick={() => setExpenseModalOpen(true)}
          >
            Agregar Gasto
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<TrendingUp />}
            onClick={() => setIncomeModalOpen(true)}
          >
            Agregar Ingreso
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CreditCard />}
            onClick={() => setManageCreditCardsModalOpen(true)}
          >
            Gestionar Tarjetas
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="financial tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Vista Mensual" />
          <Tab label="Resumen por Categorías" />
          <Tab label="Gastos" />
          <Tab label="Ingresos" />
          <Tab label="Activos e Inversiones" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <MonthlyView />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CategorySummary selectedCategoryId={selectedCategoryId} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ExpenseList />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <IncomeList />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <AssetsList />
        </TabPanel>
      </Paper>


      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      <AddIncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
      />

      <AddAssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
      />

      <ManageCreditCardsModal
        open={manageCreditCardsModalOpen}
        onClose={() => setManageCreditCardsModalOpen(false)}
      />
    </Box>
  )
}

export default Dashboard