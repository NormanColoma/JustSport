'use strict';
var bcrypt = require('bcrypt-nodejs');

var owner = { uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: bcrypt.hashSync("adi2015"), gender: 'male', role: "owner"};
var user = {uuid: '8d75a3xa-767e-46f1-bc86-a46a0f103735', name: 'Pepe', lname: 'Pardo García', email: 'pepe@mail.com', pass: bcrypt.hashSync("adi2015"), gender: 'male'};
var admin = { uuid: '8b75a3ca-767i-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García', email: 'ua.norman@gmail.com', pass: bcrypt.hashSync("admin2015"), gender: 'male', role: "admin"};
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [owner, user, admin]);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
