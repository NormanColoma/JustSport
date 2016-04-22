'use strict';
var course1 = {sportId:'1', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
var course2 = {sportId:'1', establishmentId:'1',instructor: 'Pepe Castaño',price:'20',info:'Un curso no tan completo'};
var course3 = {sportId:'3', establishmentId:'1',instructor: 'María Castro',price:'15',info:'Un curso poco completo'};
var course4 = {sportId:'1', establishmentId:'2',instructor: 'Carlos Díaz',price:'17.50',info:'Megacompleto'};
var course5 = {sportId:'1', establishmentId:'4',instructor: 'Ruben Pérez',price:'30',info:'Para profesionales'};
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('courses',[course1,course2,course3,course4,course5]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('courses', null, {});
  }
};
