'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.createTable(
        'sports',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: new Date()
          },
          updatedAt: {
            type: Sequelize.DATE,
            defaultValue: new Date()
          },
          name:{
            type: Sequelize.STRING,
            unique: true
          }
        }
    )
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.dropTable('sports')
  }
};
