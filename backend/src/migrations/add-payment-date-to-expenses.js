'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('expenses', 'payment_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'expense_date'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('expenses', 'payment_date');
  }
};