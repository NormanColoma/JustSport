'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('sports',[{
      name: 'Spinning',
    }, {
      name: 'GAP',
    },{
      name: 'Body Jump'
    },{
      name: 'Zumba'
    },{
      name: 'Crossfit'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('sports', null, {});
  }
};