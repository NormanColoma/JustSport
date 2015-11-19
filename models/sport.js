/**
 * Created by Norman on 16/10/2015.
 */

"use strict";

module.exports = function(sequelize, Sequelize) {
    var sport = sequelize.define('sport',{
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is:{
                    args: /^([ \u00c0-\u01ffa-zA-Z'\-])+$/i,
                    msg: "name must only contain letters"
                },
                notEmpty:{
                    msg: "name is required"
                }
            }
        }
    },{
        classMethods: {
            associate: function (models) {
                sport.belongsToMany(models.establishment, {through: 'establishmentsports'});
            }
        }
    });
    return sport;
};