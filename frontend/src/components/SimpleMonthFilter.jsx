import React, { useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'

const SimpleMonthFilter = ({ onDateChange, title = "Filtrar por período" }) => {
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)

  // Generar opciones de años desde 2022 hasta 2 años en el futuro
  const generateYearOptions = () => {
    const years = []
    const startYear = 2022
    const currentYear = dayjs().year()
    const endYear = currentYear + 2

    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  const yearOptions = generateYearOptions()
  const monthOptions = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ]

  const handleYearChange = (event) => {
    const newYear = event.target.value
    setSelectedYear(newYear)
    
    onDateChange({
      type: 'monthly',
      year: newYear,
      month: selectedMonth,
      selectedMonth: `${newYear}-${selectedMonth.toString().padStart(2, '0')}`
    })
  }

  const handleMonthChange = (event) => {
    const newMonth = event.target.value
    setSelectedMonth(newMonth)
    
    onDateChange({
      type: 'monthly',
      year: selectedYear,
      month: newMonth,
      selectedMonth: `${selectedYear}-${newMonth.toString().padStart(2, '0')}`
    })
  }

  // Llamar onDateChange en el montaje inicial
  React.useEffect(() => {
    onDateChange({
      type: 'monthly',
      year: selectedYear,
      month: selectedMonth,
      selectedMonth: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
    })
  }, [])

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Año</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              label="Año"
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Mes</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Mes"
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando datos de {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </Typography>
      </Box>
    </Paper>
  )
}

export default SimpleMonthFilter