'use strict';
var s1 = {day: 'Martes', startTime: '10:00', endTime:"11:00", courseId: 1};
var s2 = {day: 'Lunes', startTime: '11:00', endTime:"12:00", courseId: 1};
var s3 = {day: 'Miércoles', startTime: '17:00', endTime:"18:00", courseId: 1};
var s5 = {day: 'Jueves', startTime: '20:00', endTime:"21:00", courseId: 1};
var s4 = {day: 'Jueves', startTime: '12:00', endTime:"13:00", courseId: 1};
var s6 = {day: 'Viernes', startTime: '09:00', endTime:"10:00", courseId: 1};
var s7 = {day: 'Jueves', startTime: '12:30', endTime:"13:30", courseId: 2};
var s8 = {day: 'Jueves', startTime: '20:00', endTime:"21:00", courseId: 2};
var s9 = {day: 'Viernes', startTime: '10:00', endTime:"11:00", courseId: 2};
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('schedules',[s1,s2,s3,s4,s5,s6,s7,s8,s9]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('schedules', null, {});
  }
};
