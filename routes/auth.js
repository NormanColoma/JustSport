// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var models  = require('../models');
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = '123456';

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
        try {
            var decodedToken = jwt.decode(accessToken, secret);
        }catch(err){
            return done(null,false);
        }
        if(decodedToken.exp <= moment().valueOf()) {
            return done(null, false);
        }
        models.user.findOne({ where: {uuid: decodedToken.sub} }).then(function(user){
            if(!user)
                return done(null,false);
            done(null,user,{scope: '*'})
        }).catch(function(err){
           return (null,false);
        });
    }
));

exports.isAuthenticated = passport.authenticate(['basic'], { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });