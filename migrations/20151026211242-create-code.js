'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      redirectUri: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.UUID,
        references: {model: "users", key: "uuid"},
        onDelete: 'CASCADE'
      },
      clientId: {
        type: Sequelize.UUID,
        references: {model: "clients", key: "clientId"},
        onDelete: 'CASCADE'
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
    return queryInterface.dropTable('codes');
  }
};