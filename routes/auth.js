// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var models  = require('../models');

passport.use(new BasicStrategy(
    function(email, password, done){
        models.user.findOne({ where: {email: email} }).then(function(user){
            if(!user){

                return done(null,false);
            }
            if(models.user.verifyPassword(password, user.dataValues.pass)) {
                return done(null, user);
            }
            return done(null, false);

        }).catch(function(err){
            throw err;
        })
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });