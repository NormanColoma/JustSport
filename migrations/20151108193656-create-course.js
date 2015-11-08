'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('courses', {
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
        references: {model: "establishmentsports", key: "sportId"},
        onDelete: 'CASCADE'

      },
      establishmentId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {model: "establishmentsports", key: "establishmentId"},
        onDelete: 'CASCADE'
      },
      instructor: {
        type: Sequelize.STRING,
        defaultValue: 'unknown'
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      info: {
        type: Sequelize.STRING,
        defaultValue: 'Without info about the course'

      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('courses');
  }
};