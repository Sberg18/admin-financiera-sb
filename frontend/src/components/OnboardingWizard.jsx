import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material'
import IncomeSetupStep from './onboarding/IncomeSetupStep'
import CreditCardSetupStep from './onboarding/CreditCardSetupStep'
import AssetsSetupStep from './onboarding/AssetsSetupStep'
import WelcomeStep from './onboarding/WelcomeStep'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const steps = [
  'Bienvenida',
  'Configurar Ingresos',
  'Tarjetas de Crédito',
  'Activos e Inversiones'
]

const OnboardingWizard = ({ open, onClose, initialStep = 0 }) => {
  const [activeStep, setActiveStep] = useState(initialStep)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Reset to initial step when dialog opens
  React.useEffect(() => {
    if (open) {
      setActiveStep(initialStep)
    }
  }, [open, initialStep])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setError('')
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    setError('')
  }

  const handleFinish = async () => {
    try {
      setLoading(true)
      await api.post('/onboarding/complete')
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al completar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSkipStep = () => {
    if (activeStep === steps.length - 1) {
      handleFinish()
    } else {
      handleNext()
    }
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <WelcomeStep user={user} />
      case 1:
        return <IncomeSetupStep onNext={handleNext} />
      case 2:
        return <CreditCardSetupStep onNext={handleNext} />
      case 3:
        return <AssetsSetupStep onNext={handleNext} />
      default:
        return 'Paso desconocido'
    }
  }

  const isLastStep = activeStep === steps.length - 1

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" align="center">
          ¡Bienvenido a tu Administrador Financiero!
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary">
          Te ayudaremos a configurar tu perfil financiero paso a paso
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Atrás
        </Button>

        <Box>
          {activeStep > 0 && (
            <Button
              onClick={handleSkipStep}
              sx={{ mr: 1 }}
            >
              Saltar
            </Button>
          )}

          {activeStep === 0 ? (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Comenzar
            </Button>
          ) : isLastStep ? (
            <Button
              variant="contained"
              onClick={handleFinish}
              disabled={loading}
            >
              Finalizar Configuración
            </Button>
          ) : null}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default OnboardingWizard