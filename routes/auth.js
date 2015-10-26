// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
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


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        models.user.findOne({where:{email:email}}).then(function(user){
            if(!user)
                return done(null, false, { message: 'Incorrect username.' });
            if(!models.user.verifyPassword(password, user.pass))
                return done(null, false, { message: 'Incorrect password.' });
            return done(null, user);
        });
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

passport.serializeUser(function(user, done) {
    done(null, user.uuid);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    models.user.findOne({where:{uuid:id}}).then(function(user){
        done(null,user);
    });
});

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.isLocalAuthenticated = passport.authenticate('local', {session:false});