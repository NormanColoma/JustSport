'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('establishmentsports', {
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
    return queryInterface.dropTable('establishmentsports');
  }
};
