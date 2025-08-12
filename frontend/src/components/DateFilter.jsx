import React, { useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Typography
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

const DateFilter = ({ onDateChange, title = "Filtrar por fecha" }) => {
  const [filterType, setFilterType] = useState('monthly') // 'monthly' o 'range'
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('year'),
    endDate: dayjs()
  })

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

  const handleFilterTypeChange = (event) => {
    const newType = event.target.checked ? 'range' : 'monthly'
    setFilterType(newType)
    
    if (newType === 'monthly') {
      // Enviar datos del mes seleccionado
      onDateChange({
        type: 'monthly',
        year: selectedYear,
        month: selectedMonth,
        selectedMonth: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
      })
    } else {
      // Enviar datos del rango
      onDateChange({
        type: 'range',
        startDate: dateRange.startDate.format('YYYY-MM-DD'),
        endDate: dateRange.endDate.format('YYYY-MM-DD'),
        startDateObj: dateRange.startDate,
        endDateObj: dateRange.endDate
      })
    }
  }

  const handleYearChange = (event) => {
    const newYear = event.target.value
    setSelectedYear(newYear)
    
    if (filterType === 'monthly') {
      onDateChange({
        type: 'monthly',
        year: newYear,
        month: selectedMonth,
        selectedMonth: `${newYear}-${selectedMonth.toString().padStart(2, '0')}`
      })
    }
  }

  const handleMonthChange = (event) => {
    const newMonth = event.target.value
    setSelectedMonth(newMonth)
    
    if (filterType === 'monthly') {
      onDateChange({
        type: 'monthly',
        year: selectedYear,
        month: newMonth,
        selectedMonth: `${selectedYear}-${newMonth.toString().padStart(2, '0')}`
      })
    }
  }

  const handleRangeChange = (field, date) => {
    const newRange = {
      ...dateRange,
      [field]: date
    }
    setDateRange(newRange)
    
    if (filterType === 'range') {
      onDateChange({
        type: 'range',
        startDate: newRange.startDate.format('YYYY-MM-DD'),
        endDate: newRange.endDate.format('YYYY-MM-DD'),
        startDateObj: newRange.startDate,
        endDateObj: newRange.endDate
      })
    }
  }

  // Llamar onDateChange en el montaje inicial
  React.useEffect(() => {
    if (filterType === 'monthly') {
      onDateChange({
        type: 'monthly',
        year: selectedYear,
        month: selectedMonth,
        selectedMonth: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
      })
    }
  }, []) // Solo en el montaje inicial

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={filterType === 'range'}
                onChange={handleFilterTypeChange}
              />
            }
            label={filterType === 'monthly' ? "Vista Mensual" : "Rango de Fechas"}
          />
        </Grid>

        {filterType === 'monthly' ? (
          <>
            <Grid item xs={12} sm={3}>
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
            
            <Grid item xs={12} sm={3}>
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
          </>
        ) : (
          <>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha Inicio"
                value={dateRange.startDate}
                onChange={(date) => handleRangeChange('startDate', date)}
                minDate={dayjs('2022-01-01')}
                maxDate={dayjs().add(2, 'years')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha Fin"
                value={dateRange.endDate}
                onChange={(date) => handleRangeChange('endDate', date)}
                minDate={dateRange.startDate}
                maxDate={dayjs().add(2, 'years')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filterType === 'monthly' 
            ? `Mostrando datos de ${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
            : `Mostrando datos del ${dateRange.startDate.format('DD/MM/YYYY')} al ${dateRange.endDate.format('DD/MM/YYYY')}`
          }
        </Typography>
      </Box>
    </Paper>
  )
}

export default DateFilter