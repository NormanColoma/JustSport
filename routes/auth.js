// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
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

passport.use(new BearerStrategy(
    function(accessToken, done) {
        models.token.findOne({ where: {token: accessToken} }).then(function(token){
            if(!token)
                return done(null,false);
            models.user.findOne({ where: {uuid: token.userId} }).then(function(user){
                if(!user)
                    return done(null,false);
                done(null,user,{scope: '*'})

            });
        });
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });