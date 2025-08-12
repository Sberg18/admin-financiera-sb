const { ExpenseCategory, IncomeCategory, sequelize } = require('../models');

const cleanupDefaultCategories = async () => {
  try {
    console.log('🧹 Limpiando categorías por defecto...');
    
    // Categorías a eliminar (todas excepto "Sin Categoría")
    const categoriesToRemove = [
      'Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 
      'Salud', 'Educación', 'Ropa y Calzado', 'Hogar', 'Impuestos',
      'Sueldo', 'Freelance', 'Inversiones', 'Alquileres', 'Ventas', 
      'Bonos/Aguinaldo', 'Otros Ingresos'
    ];

    // Eliminar categorías de gastos por defecto
    const deletedExpenseCategories = await ExpenseCategory.destroy({
      where: {
        name: categoriesToRemove,
        userId: null // Solo las por defecto
      }
    });

    // Eliminar categorías de ingresos por defecto
    const deletedIncomeCategories = await IncomeCategory.destroy({
      where: {
        name: categoriesToRemove,
        userId: null // Solo las por defecto
      }
    });

    console.log(`✅ Eliminadas ${deletedExpenseCategories} categorías de gastos`);
    console.log(`✅ Eliminadas ${deletedIncomeCategories} categorías de ingresos`);
    console.log('✅ Limpieza completada. Solo queda "Sin Categoría" como categoría por defecto.');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
};

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('🔗 Conectado a la base de datos');
      return cleanupDefaultCategories();
    })
    .then(() => {
      console.log('🎉 Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = cleanupDefaultCategories;