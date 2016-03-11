'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'users',
        'img',
        {
          type: Sequelize.STRING,
          defaultValue: 'default.jpg'
        }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('users', 'img');
  }
};
