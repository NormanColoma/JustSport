'use strict';
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users',[{
      uuid: '8a74a3aa-757d-46f1-ba86-a56a0f107735',
      name: 'Norman',
      lname: 'Coloma García',
      email: 'ua.norman@gmail.com',
      pass: bcrypt.hashSync("admin2015"),
      gender: 'male',
      role: 'admin'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
