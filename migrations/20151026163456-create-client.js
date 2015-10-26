'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('clients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        required:true
      },
      clientId: {
        type: Sequelize.UUID,
        unique: true,
        required:true
      },
      clientSecret: {
        type: Sequelize.UUID,
        required:true
      },
      userId: {
        type: Sequelize.UUID,
        required:true,
        references: {model: "users", key: "uuid"},
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
    return queryInterface.dropTable('clients');
  }
};