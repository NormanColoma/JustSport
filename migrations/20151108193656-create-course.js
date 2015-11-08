'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sportId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {model: "sports", key: "id"},
        onDelete: 'CASCADE'

      },
      establishmentId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {model: "establishments", key: "id"},
        onDelete: 'CASCADE'
      },
      instructor: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      info: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Courses');
  }
};