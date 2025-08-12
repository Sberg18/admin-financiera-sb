require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const onboardingRoutes = require('./routes/onboarding');
const categoryRoutes = require('./routes/categories');
const exchangeRateRoutes = require('./routes/exchangeRate');
const initializeData = require('./seeds/initializeData');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Agregar logger detallado solo en producción o cuando se necesite debug
if (process.env.ENABLE_DETAILED_LOGGING === 'true') {
  app.use(logger);
}

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Catch all handler: enviar back react app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  });
}

app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  if (error.name === 'SequelizeConnectionError') {
    return res.status(500).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos');
    
    // Inicializar datos básicos en producción
    if (process.env.NODE_ENV === 'production') {
      await initializeData();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();