'use strict';
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users',[{
      uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738',
      name: 'Norman',
      lname: 'Coloma García',
      email: 'ua.norman@mail.com',
      pass: bcrypt.hashSync("adi2015"),
      gender: 'male',
      role: 'owner'
    },{
      uuid: '8d75a3aa-767e-46f1-ba86-a46a0f103735',
      name: 'Pepe',
      lname: 'Cano Gómez',
      email: 'pepe@mail.com',
      pass: bcrypt.hashSync("pepito15"),
      gender: 'male',
      role: 'user'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
