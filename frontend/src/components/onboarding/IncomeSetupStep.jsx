import React, { useState } from 'react'
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  Paper
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import api from '../../services/api'

const IncomeSetupStep = ({ onNext }) => {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Sueldo principal',
    incomeDate: dayjs(),
    isRecurring: true,
    recurringFrequency: 'monthly'
  })

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    })
  }

  const addIncome = async () => {
    if (!formData.amount) return

    try {
      setLoading(true)
      setError('')

      const submitData = {
        ...formData,
        incomeDate: formData.incomeDate.format('YYYY-MM-DD'),
        amount: parseFloat(formData.amount)
      }

      const response = await api.post('/incomes', submitData)
      
      setIncomes([...incomes, response.income])
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        incomeDate: dayjs(),
        isRecurring: false,
        recurringFrequency: 'monthly'
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Error al agregar ingreso')
    } finally {
      setLoading(false)
    }
  }

  const removeIncome = async (id) => {
    try {
      await api.delete(`/incomes/${id}`)
      setIncomes(incomes.filter(income => income.id !== id))
    } catch (error) {
      setError('Error al eliminar ingreso')
    }
  }

  const commonIncomeTypes = [
    'Sueldo principal',
    'Sueldo secundario',
    'Freelance',
    'Alquiler',
    'Inversiones',
    'Venta',
    'Bono',
    'Aguinaldo',
    'Otro'
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configuremos tus Ingresos
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Registra todos tus ingresos mensuales para tener una visión completa de tu situación financiera.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Agregar Nuevo Ingreso
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto mensual"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha"
              value={formData.incomeDate}
              onChange={(date) => setFormData({ ...formData, incomeDate: date })}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Ingreso</InputLabel>
              <Select
                value={formData.description}
                onChange={handleChange('description')}
                label="Tipo de Ingreso"
              >
                {commonIncomeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={handleSwitchChange('isRecurring')}
                />
              }
              label="Ingreso recurrente (se repite mensualmente)"
            />
          </Grid>
          
          {formData.isRecurring && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={formData.recurringFrequency}
                  onChange={handleChange('recurringFrequency')}
                  label="Frecuencia"
                >
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="biweekly">Quincenal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="quarterly">Trimestral</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addIncome}
              disabled={loading || !formData.amount}
              fullWidth
            >
              Agregar Ingreso
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {incomes.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ingresos Configurados ({incomes.length})
          </Typography>
          <List>
            {incomes.map((income) => (
              <ListItem key={income.id}>
                <ListItemText
                  primary={income.description}
                  secondary={`$${parseFloat(income.amount).toLocaleString()} ${income.isRecurring ? `(${income.recurringFrequency})` : '(Una vez)'}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeIncome(income.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={onNext}
              fullWidth
              size="large"
            >
              Continuar con Tarjetas de Crédito
            </Button>
          </Box>
        </Paper>
      )}

      {incomes.length === 0 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="textSecondary" paragraph>
            Puedes agregar tus ingresos más tarde si prefieres continuar
          </Typography>
          <Button
            variant="outlined"
            onClick={onNext}
          >
            Saltar este paso
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default IncomeSetupStep