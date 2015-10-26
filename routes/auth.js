// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var models  = require('../models');

passport.use(new BasicStrategy(
    function(email, password, done){
        models.user.find({ where: {email: email} }).then(function(user){
            if(!user){

                return done(null,false);
            }
            if(models.user.verifyPassword(password, user.pass)) {
                return done(null, user);
            }
            return done(null, false);

        }).catch(function(err){
            throw err;
        })
    }
));

passport.use('client-basic', new BasicStrategy(
    function(clientId, clientSecret, done) {
        models.client.find({ where: {clientId: clientId} }).then(function(client){
            if(!client || client.clientSecret !== clientSecret)
                return done(null,false);
            return done(null,client);
        })
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });