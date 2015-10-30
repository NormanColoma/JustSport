'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('clients',{
      name: 'JustSport Official Client',
      userId: '8a74a3aa-757d-46f1-ba86-a56a0f107735'
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('clients', null, {});
  }
};