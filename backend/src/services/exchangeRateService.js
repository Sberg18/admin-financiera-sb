const https = require('https');

class ExchangeRateService {
  constructor() {
    this.cache = {
      rate: null,
      lastUpdate: null,
      cacheDuration: 30 * 60 * 1000 // 30 minutos
    };
  }

  async getUSDRate() {
    try {
      // Verificar si tenemos cache válido
      if (this.cache.rate && this.cache.lastUpdate && 
          (Date.now() - this.cache.lastUpdate) < this.cache.cacheDuration) {
        console.log('💰 Usando tipo de cambio desde cache:', this.cache.rate);
        return this.cache.rate;
      }

      console.log('🔄 Obteniendo tipo de cambio actualizado...');
      
      // Intentar múltiples APIs como fallback
      const rate = await this.fetchFromMultipleSources();
      
      // Actualizar cache
      this.cache.rate = rate;
      this.cache.lastUpdate = Date.now();
      
      console.log('✅ Tipo de cambio actualizado:', rate);
      return rate;
      
    } catch (error) {
      console.error('❌ Error obteniendo tipo de cambio:', error.message);
      
      // Si hay cache, usarlo aunque esté vencido
      if (this.cache.rate) {
        console.log('⚠️ Usando tipo de cambio en cache (vencido):', this.cache.rate);
        return this.cache.rate;
      }
      
      // Fallback: tipo de cambio promedio estimado
      const fallbackRate = 1000; // Actualizar este valor periódicamente
      console.log('⚠️ Usando tipo de cambio fallback:', fallbackRate);
      return fallbackRate;
    }
  }

  async fetchFromMultipleSources() {
    const sources = [
      () => this.fetchFromDolarAPI(),
      () => this.fetchFromBCRA(),
      () => this.fetchFromFixer()
    ];

    for (const source of sources) {
      try {
        const rate = await source();
        if (rate && rate > 0) {
          return rate;
        }
      } catch (error) {
        console.log('Intentando siguiente fuente...');
        continue;
      }
    }

    throw new Error('No se pudo obtener tipo de cambio de ninguna fuente');
  }

  async fetchFromDolarAPI() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.dolarapi.com',
        path: '/v1/dolares/blue',
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            // Promedio entre compra y venta
            const rate = (parseFloat(json.compra) + parseFloat(json.venta)) / 2;
            resolve(rate);
          } catch (error) {
            reject(new Error('Error parsing DolarAPI response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('DolarAPI timeout'));
      });

      req.end();
    });
  }

  async fetchFromBCRA() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.bcra.gob.ar',
        path: '/estadisticas/v2.0/principalesvariables',
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const usdData = json.results.find(item => item.idVariable === 4); // USD oficial
            if (usdData && usdData.valor) {
              resolve(parseFloat(usdData.valor));
            } else {
              reject(new Error('USD data not found in BCRA response'));
            }
          } catch (error) {
            reject(new Error('Error parsing BCRA response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('BCRA timeout'));
      });

      req.end();
    });
  }

  async fetchFromFixer() {
    // API gratuita de exchangerate-api.com
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.exchangerate-api.com',
        path: '/v4/latest/USD',
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.rates && json.rates.ARS) {
              resolve(parseFloat(json.rates.ARS));
            } else {
              reject(new Error('ARS rate not found in response'));
            }
          } catch (error) {
            reject(new Error('Error parsing exchange API response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Exchange API timeout'));
      });

      req.end();
    });
  }

  convertToUSD(amountARS) {
    if (!this.cache.rate) {
      return null;
    }
    return parseFloat((amountARS / this.cache.rate).toFixed(2));
  }

  getCacheInfo() {
    return {
      rate: this.cache.rate,
      lastUpdate: this.cache.lastUpdate ? new Date(this.cache.lastUpdate).toISOString() : null,
      isExpired: this.cache.lastUpdate ? (Date.now() - this.cache.lastUpdate) > this.cache.cacheDuration : true
    };
  }
}

// Singleton
const exchangeRateService = new ExchangeRateService();

module.exports = exchangeRateService;