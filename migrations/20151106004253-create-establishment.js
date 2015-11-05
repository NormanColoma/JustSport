'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('establishments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      desc: {
        allowNull: false,
        type: Sequelize.STRING
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING
      },
      province: {
        allowNull: false,
        type: Sequelize.STRING
      },
      addr: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      owner: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {model: "users", key: "uuid"},
        onDelete: 'CASCADE'
      },
      website: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: 'none'
      },
      main_img: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: 'default.jpeg'
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
    return queryInterface.dropTable('establishments');
  }
};
