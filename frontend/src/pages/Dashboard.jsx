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
  Fab
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import ExpenseList from '../components/ExpenseList'
import IncomeList from '../components/IncomeList'
import AssetsList from '../components/AssetsList'
import CategorySummary from '../components/CategorySummary'
import MonthlyView from './MonthlyView'
import AddExpenseModal from '../components/AddExpenseModal'
import AddIncomeModal from '../components/AddIncomeModal'
import AddAssetModal from '../components/AddAssetModal'
import FinancialSummary from '../components/FinancialSummary'

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
  const [activeTab, setActiveTab] = useState(0)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <FinancialSummary />
        </Grid>
      </Grid>

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
          <CategorySummary />
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

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          if (activeTab === 0) {
            // Vista mensual - mostrar ambas opciones o default a gasto
            setExpenseModalOpen(true)
          } else if (activeTab === 1) {
            // Resumen por categorías - agregar gasto
            setExpenseModalOpen(true)
          } else if (activeTab === 2) {
            setExpenseModalOpen(true)
          } else if (activeTab === 3) {
            setIncomeModalOpen(true)
          } else {
            setAssetModalOpen(true)
          }
        }}
      >
        <AddIcon />
      </Fab>

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
    </Box>
  )
}

export default Dashboard