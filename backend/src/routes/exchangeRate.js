const express = require('express');
const authMiddleware = require('../middleware/auth');
const exchangeRateService = require('../services/exchangeRateService');

const router = express.Router();

router.use(authMiddleware);

// Obtener tipo de cambio actual
router.get('/usd', async (req, res) => {
  try {
    const rate = await exchangeRateService.getUSDRate();
    const cacheInfo = exchangeRateService.getCacheInfo();
    
    res.json({
      success: true,
      data: {
        rate: rate,
        lastUpdate: cacheInfo.lastUpdate,
        isExpired: cacheInfo.isExpired,
        source: 'Argentina Exchange Rate APIs'
      }
    });
  } catch (error) {
    console.error('Exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tipo de cambio',
      fallbackRate: 1000 // Valor fallback
    });
  }
});

// Convertir monto específico
router.post('/convert', async (req, res) => {
  try {
    const { amount, from = 'ARS', to = 'USD' } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }
    
    const rate = await exchangeRateService.getUSDRate();
    let convertedAmount;
    
    if (from === 'ARS' && to === 'USD') {
      convertedAmount = parseFloat((amount / rate).toFixed(2));
    } else if (from === 'USD' && to === 'ARS') {
      convertedAmount = parseFloat((amount * rate).toFixed(2));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Conversión no soportada'
      });
    }
    
    res.json({
      success: true,
      data: {
        originalAmount: amount,
        convertedAmount: convertedAmount,
        from: from,
        to: to,
        rate: rate,
        lastUpdate: exchangeRateService.getCacheInfo().lastUpdate
      }
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en conversión'
    });
  }
});

module.exports = router;