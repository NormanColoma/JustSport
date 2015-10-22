/**
 * Created by Norman on 16/10/2015.
 */

"use strict";

module.exports = function(sequelize, Sequelize) {
    var sport = sequelize.define('sport',{
        name: Sequelize.STRING,

    },{
        classMethods: {
            associate: function (models) {
                sport.belongsToMany(models.establishment, {through: 'establishmentsports'});
            }
        }
    });
    return sport;
};