import React from 'react'
import {
  Box,
  Container
} from '@mui/material'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout