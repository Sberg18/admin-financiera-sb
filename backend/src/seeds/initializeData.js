const { Bank, CardType, AssetType, ExpenseCategory, IncomeCategory } = require('../models');

const initializeData = async () => {
  try {
    console.log('🌱 Inicializando datos básicos...');

    // 1. Crear bancos argentinos
    const banks = [
      { name: 'Banco Galicia' },
      { name: 'Banco Santander' },
      { name: 'Banco Macro' },
      { name: 'Banco Nación' },
      { name: 'Banco Ciudad' },
      { name: 'BBVA Argentina' },
      { name: 'Banco Patagonia' },
      { name: 'Banco Supervielle' },
      { name: 'Banco Hipotecario' },
      { name: 'HSBC Argentina' },
      { name: 'Banco Comafi' },
      { name: 'Banco Credicoop' },
      { name: 'Brubank' },
      { name: 'Mercado Pago' },
      { name: 'Ualá' },
      { name: 'Naranja X' }
    ];

    for (const bank of banks) {
      await Bank.findOrCreate({
        where: { name: bank.name },
        defaults: bank
      });
    }
    console.log('✅ Bancos creados');

    // 2. Crear tipos de tarjetas
    const cardTypes = [
      { id: 1, name: 'Visa' },
      { id: 2, name: 'Mastercard' },
      { id: 3, name: 'American Express' }
    ];

    for (const cardType of cardTypes) {
      await CardType.findOrCreate({
        where: { id: cardType.id },
        defaults: cardType
      });
    }
    console.log('✅ Tipos de tarjeta creados');

    // 3. Crear tipos de activos
    const assetTypes = [
      { name: 'Dólar Estadounidense', category: 'currency' },
      { name: 'Euro', category: 'currency' },
      { name: 'Plazo Fijo', category: 'savings' },
      { name: 'Caja de Ahorro USD', category: 'savings' },
      { name: 'Cuenta Corriente', category: 'savings' },
      { name: 'Acciones Argentinas', category: 'stocks' },
      { name: 'Acciones Internacionales', category: 'stocks' },
      { name: 'ETFs', category: 'stocks' },
      { name: 'Bonos Soberanos', category: 'bonds' },
      { name: 'LELIQs', category: 'bonds' },
      { name: 'FCI Renta Fija', category: 'bonds' },
      { name: 'FCI Renta Variable', category: 'stocks' },
      { name: 'Crypto Bitcoin', category: 'crypto' },
      { name: 'Crypto Ethereum', category: 'crypto' },
      { name: 'Crypto Stablecoins', category: 'crypto' }
    ];

    for (const assetType of assetTypes) {
      await AssetType.findOrCreate({
        where: { name: assetType.name },
        defaults: assetType
      });
    }
    console.log('✅ Tipos de activos creados');

    // 4. Crear categorías por defecto de gastos
    const defaultExpenseCategories = [
      { name: 'Sin Categoría', color: '#757575', userId: null }
    ];

    for (const category of defaultExpenseCategories) {
      await ExpenseCategory.findOrCreate({
        where: { name: category.name, userId: category.userId },
        defaults: category
      });
    }
    console.log('✅ Categorías de gastos creadas');

    // 5. Crear categorías por defecto de ingresos
    const defaultIncomeCategories = [
      { name: 'Sin Categoría', color: '#757575', userId: null }
    ];

    for (const category of defaultIncomeCategories) {
      await IncomeCategory.findOrCreate({
        where: { name: category.name, userId: category.userId },
        defaults: category
      });
    }
    console.log('✅ Categorías de ingresos creadas');

    console.log('🎉 Datos iniciales creados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    throw error;
  }
};

module.exports = initializeData;