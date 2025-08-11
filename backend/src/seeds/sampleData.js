// Este archivo se puede usar para poblar datos de ejemplo
// No se ejecuta automáticamente, solo para referencia

const sampleIncomes = [
  {
    description: 'Sueldo principal',
    amount: 450000,
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    description: 'Freelance',
    amount: 125000,
    isRecurring: false
  },
  {
    description: 'Alquiler departamento',
    amount: 85000,
    isRecurring: true,
    recurringFrequency: 'monthly'
  }
];

const sampleExpenses = [
  // Gastos en efectivo
  {
    description: 'Supermercado',
    amount: 45000,
    paymentMethod: 'cash'
  },
  {
    description: 'Transporte público',
    amount: 12000,
    paymentMethod: 'cash'
  },
  {
    description: 'Farmacia',
    amount: 8500,
    paymentMethod: 'cash'
  },
  
  // Gastos con tarjeta de débito
  {
    description: 'Servicios (luz, gas, agua)',
    amount: 35000,
    paymentMethod: 'debit_card'
  },
  {
    description: 'Internet',
    amount: 15000,
    paymentMethod: 'debit_card'
  },
  
  // Gastos con tarjeta de crédito
  {
    description: 'Notebook nueva',
    amount: 180000,
    paymentMethod: 'credit_card',
    installments: 12
  },
  {
    description: 'Cena restaurante',
    amount: 25000,
    paymentMethod: 'credit_card',
    installments: 1
  },
  {
    description: 'Ropa',
    amount: 65000,
    paymentMethod: 'credit_card',
    installments: 6
  }
];

const sampleAssets = [
  {
    name: 'Ahorros en dólares',
    assetType: 'Dólar Estadounidense',
    category: 'currency',
    quantity: 2500,
    purchasePrice: 950,
    currentPrice: 1050,
    currency: 'USD'
  },
  {
    name: 'YPF',
    assetType: 'Acciones Argentinas',
    category: 'stocks',
    quantity: 100,
    purchasePrice: 15500,
    currentPrice: 16200,
    currency: 'ARS'
  },
  {
    name: 'AL30',
    assetType: 'Bonos Soberanos',
    category: 'bonds',
    quantity: 50,
    purchasePrice: 58.5,
    currentPrice: 61.2,
    currency: 'USD'
  },
  {
    name: 'Plazo fijo',
    assetType: 'Plazo Fijo',
    category: 'savings',
    quantity: 500000,
    purchasePrice: 1,
    currentPrice: 1.02,
    currency: 'ARS'
  }
];

const sampleCreditCards = [
  {
    bankName: 'Banco Santander',
    cardType: 'Visa',
    cardName: 'Tarjeta Oro',
    lastFourDigits: '1234',
    closingDay: 15,
    paymentDay: 10,
    creditLimit: 500000
  },
  {
    bankName: 'Banco Galicia',
    cardType: 'Mastercard',
    cardName: 'Tarjeta Black',
    lastFourDigits: '5678',
    closingDay: 31,
    paymentDay: 15,
    creditLimit: 800000
  }
];

module.exports = {
  sampleIncomes,
  sampleExpenses,
  sampleAssets,
  sampleCreditCards
};