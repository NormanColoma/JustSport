'use strict';
var course1 = {sportId:'1', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
var course2 = {sportId:'2', establishmentId:'1',instructor: 'Pepe Castaño',price:'20',info:'Un curso no tan completo'};
var course3 = {sportId:'3', establishmentId:'1',instructor: 'María Castro',price:'15',info:'Un curso poco completo'};
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('courses',[course1,course2,course3]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('courses', null, {});
  }
};
