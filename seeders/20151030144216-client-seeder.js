'use strict';
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('clients',[{
      name: 'JustSport Official Client',
      userId: '8a74a3aa-757d-46f1-ba86-a56a0f107735',
      clientId: '2xa001za-78b3-4f38-9376-e2dd88b7c682',
      clientSecret:'7236e557-8b56-4526-bv29-820bac0c8bd2'
    }]);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('clients', null, {});
  }
};