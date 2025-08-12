const { ExpenseCategory, IncomeCategory } = require('./src/models');

const createDefaultCategories = async () => {
  try {
    console.log('Creando categorías por defecto...');

    // Verificar si ya existen las categorías "Sin Categoría"
    const existingExpenseCategory = await ExpenseCategory.findOne({
      where: { name: 'Sin Categoría', userId: null }
    });

    const existingIncomeCategory = await IncomeCategory.findOne({
      where: { name: 'Sin Categoría', userId: null }
    });

    // Crear categoría de gastos "Sin Categoría" si no existe
    if (!existingExpenseCategory) {
      await ExpenseCategory.create({
        name: 'Sin Categoría',
        color: '#757575', // Gris
        userId: null // Categoría global
      });
      console.log('✅ Categoría de gastos "Sin Categoría" creada');
    } else {
      console.log('ℹ️  Categoría de gastos "Sin Categoría" ya existe');
    }

    // Crear categoría de ingresos "Sin Categoría" si no existe
    if (!existingIncomeCategory) {
      await IncomeCategory.create({
        name: 'Sin Categoría',
        color: '#757575', // Gris
        userId: null // Categoría global
      });
      console.log('✅ Categoría de ingresos "Sin Categoría" creada');
    } else {
      console.log('ℹ️  Categoría de ingresos "Sin Categoría" ya existe');
    }

    // Crear algunas categorías adicionales útiles
    const defaultExpenseCategories = [
      { name: 'Alimentación', color: '#FF9800' },
      { name: 'Transporte', color: '#2196F3' },
      { name: 'Servicios', color: '#9C27B0' },
      { name: 'Entretenimiento', color: '#E91E63' },
      { name: 'Salud', color: '#4CAF50' },
      { name: 'Educación', color: '#00BCD4' },
      { name: 'Ropa', color: '#795548' }
    ];

    const defaultIncomeCategories = [
      { name: 'Sueldo', color: '#4CAF50' },
      { name: 'Freelance', color: '#8BC34A' },
      { name: 'Inversiones', color: '#CDDC39' },
      { name: 'Alquileres', color: '#FFC107' },
      { name: 'Ventas', color: '#FF5722' }
    ];

    // Crear categorías de gastos adicionales
    for (const category of defaultExpenseCategories) {
      const existing = await ExpenseCategory.findOne({
        where: { name: category.name, userId: null }
      });
      
      if (!existing) {
        await ExpenseCategory.create({
          ...category,
          userId: null
        });
        console.log(`✅ Categoría de gastos "${category.name}" creada`);
      }
    }

    // Crear categorías de ingresos adicionales
    for (const category of defaultIncomeCategories) {
      const existing = await IncomeCategory.findOne({
        where: { name: category.name, userId: null }
      });
      
      if (!existing) {
        await IncomeCategory.create({
          ...category,
          userId: null
        });
        console.log(`✅ Categoría de ingresos "${category.name}" creada`);
      }
    }

    console.log('🎉 Categorías por defecto creadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando categorías por defecto:', error);
    process.exit(1);
  }
};

createDefaultCategories();