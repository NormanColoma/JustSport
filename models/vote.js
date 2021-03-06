'use strict';
module.exports = function(sequelize, DataTypes) {
  var vote = sequelize.define('vote', {
    user: DataTypes.UUID,
    establishmentId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        vote.belongsTo(models.user, {foreignKey: 'uuid', as:'User'})
        vote.belongsTo(models.establishment, {foreignKey: 'establishmentId', as:'Establishment'})
      }
    }
  });
  vote.removeAttribute('id'); //Prevent sequelize to look up for 'id' attr
  return vote;
};