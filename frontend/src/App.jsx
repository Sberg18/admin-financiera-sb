import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import OnboardingWizard from './components/OnboardingWizard'
import api from './services/api'

function App() {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingLoading, setOnboardingLoading] = useState(true)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const response = await api.get('/onboarding/status')
          setShowOnboarding(!response.onboardingCompleted)
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          setShowOnboarding(true) // Show onboarding by default on error
        }
      }
      setOnboardingLoading(false)
    }

    checkOnboardingStatus()
  }, [user])

  if (loading || (user && onboardingLoading)) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
      
      {user && showOnboarding && (
        <OnboardingWizard 
          open={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
    </>
  )
}

export default App