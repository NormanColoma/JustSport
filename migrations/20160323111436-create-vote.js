'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('votes', {
      user: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {model: "users", key: "uuid"},
        onDelete: 'CASCADE'
      },
      establishmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {model: "establishments", key: "id"},
        onDelete: 'CASCADE'
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
    return queryInterface.dropTable('votes');
  }
};