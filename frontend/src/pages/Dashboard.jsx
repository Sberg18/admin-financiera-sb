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
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Fab
} from '@mui/material'
import { Add as AddIcon, TrendingUp, TrendingDown, CreditCard, MoreVert } from '@mui/icons-material'
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

function TabPanel({ children, value, index, sx, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={sx}>
          {children}
        </Box>
      )}
    </div>
  )
}

const Dashboard = () => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [activeTab, setActiveTab] = useState(0)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [manageCreditCardsModalOpen, setManageCreditCardsModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

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


  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  return (
    <Box sx={{ pb: isMobile ? 10 : 0 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ 
          mb: { xs: 2, md: 3 },
          px: { xs: 1, md: 0 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Typography 
          variant={isSmallMobile ? "h5" : "h4"}
          sx={{ 
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Dashboard Financiero
        </Typography>
        
        {/* Desktop buttons */}
        {!isMobile && (
          <Box display="flex" gap={2} flexWrap="wrap">
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
              variant="contained"
              color="primary"
              startIcon={<CreditCard />}
              onClick={() => setManageCreditCardsModalOpen(true)}
            >
              Gestionar Tarjetas
            </Button>
          </Box>
        )}

        {/* Mobile action buttons */}
        {isMobile && (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="error"
              size={isSmallMobile ? "small" : "medium"}
              startIcon={!isSmallMobile && <TrendingDown />}
              onClick={() => setExpenseModalOpen(true)}
              sx={{ 
                fontSize: isSmallMobile ? '0.7rem' : '0.8rem',
                px: isSmallMobile ? 1 : 1.5,
                minWidth: isSmallMobile ? 'auto' : 'inherit'
              }}
            >
              {isSmallMobile ? <TrendingDown /> : 'Gasto'}
            </Button>
            <Button
              variant="contained"
              color="success"
              size={isSmallMobile ? "small" : "medium"}
              startIcon={!isSmallMobile && <TrendingUp />}
              onClick={() => setIncomeModalOpen(true)}
              sx={{ 
                fontSize: isSmallMobile ? '0.7rem' : '0.8rem',
                px: isSmallMobile ? 1 : 1.5,
                minWidth: isSmallMobile ? 'auto' : 'inherit'
              }}
            >
              {isSmallMobile ? <TrendingUp /> : 'Ingreso'}
            </Button>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                border: '1px solid',
                borderColor: 'primary.main'
              }}
              title="Más opciones"
            >
              <MoreVert />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Mobile menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => {
            setManageCreditCardsModalOpen(true)
            handleMenuClose()
          }}
          sx={{ color: 'primary.main' }}
        >
          <CreditCard sx={{ mr: 2 }} />
          Gestionar Tarjetas
        </MenuItem>
      </Menu>

      <Paper sx={{ width: '100%', mx: { xs: 1, md: 0 } }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="financial tabs"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 160 },
              padding: { xs: '12px 8px', sm: '12px 16px' }
            }
          }}
        >
          <Tab label={isSmallMobile ? "Mensual" : "Vista Mensual"} />
          <Tab label={isSmallMobile ? "Categorías" : "Resumen por Categorías"} />
          <Tab label="Gastos" />
          <Tab label="Ingresos" />
          <Tab label={isSmallMobile ? "Activos" : "Activos e Inversiones"} />
        </Tabs>

        <TabPanel value={activeTab} index={0} sx={{ p: { xs: 1, md: 3 } }}>
          <MonthlyView />
        </TabPanel>

        <TabPanel value={activeTab} index={1} sx={{ p: { xs: 1, md: 3 } }}>
          <CategorySummary selectedCategoryId={selectedCategoryId} />
        </TabPanel>

        <TabPanel value={activeTab} index={2} sx={{ p: { xs: 1, md: 3 } }}>
          <ExpenseList />
        </TabPanel>

        <TabPanel value={activeTab} index={3} sx={{ p: { xs: 1, md: 3 } }}>
          <IncomeList />
        </TabPanel>

        <TabPanel value={activeTab} index={4} sx={{ p: { xs: 1, md: 3 } }}>
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