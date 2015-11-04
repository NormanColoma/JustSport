/**
 * Created by Norman on 26/10/2015.
 */
var oauth2orize = require('oauth2orize');
var models  = require('../models');
var moment = require('moment');
var jwt = require('jwt-simple');

var server = oauth2orize.createServer();

// Register serialialization function
server.serializeClient(function(client, done) {
    return done(null, client.clientId);
});

// Register deserialization function
server.deserializeClient(function(id, done) {
    models.client.findOne({where:{clientId:id}}).then(function(client){
        return done(null,client);
    });
});


server.grant(oauth2orize.grant.token(function (client, user, ares, done) {
    var expires = moment().add(7, 'days').valueOf();
    var token = jwt.encode({
        iss: client,
        sub: user.uuid,
        exp: expires
    }, global.secret);
    done(null,token);
}))

// Register authorization code grant type
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, done) {
    // Create a new authorization code
    var code = models.code.build({
        code: uid(16),
        clientId: client.clientId,
        redirectUri: redirectUri,
        userId: user.uuid
    });

    // Save the auth code and check for errors
    code.save().then(function(){
        done(null,code.code);
    })
}));

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, done) {
    models.code.findOne({where:{code:code}}).then(function(authCode){
        if(authCode === undefined)
            return done(null,false);
        if(client.clientId !== authCode.clientId)
            return done(null, false);

        if(redirectUri !== authCode.redirectUri)
            return done(null, false);


        authCode.destroy().then(function(){
            var expires = moment().add(7, 'days').valueOf();
            var token = jwt.encode({
                iss: authCode.clientId,
                sub: authCode.userId,
                exp: expires
            }, global.secret);
            done(null,token);
        });


    });
}));


server.exchange(oauth2orize.exchange.password(function(clientId,username, password, done) {
    models.user.findOne({where:{email:username}}).then(function(user){

        if(user === undefined)
            return done(null,false);
        if(!models.user.verifyPassword(password, user.pass))
            return done(null,false);
        var expires = moment().add(7, 'days').valueOf();
        var token = jwt.encode({
            iss: clientId,
            sub: user.uuid,
            exp: expires,
            role: user.role
        }, global.secret);
        done(null,token);
    });
}));


function uid (len) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.authorization = [
    function(req, res, next) {
        if (req.user) {
            next()
        }
        else {
            res.redirect('/api/oauth2/authorization')
        }
    },
    server.authorization(function(clientId, redirectUri, done) {
        models.client.findOne({where:{clientId: clientId}}).then(function(client){
            return done(null,client,redirectUri);
        });
    }),
    function(req, res){
        res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client, redirectUri: req.oauth2.redirectURI});
    }
]

// User decision endpoint
exports.decision = [
    function(req, res, next) {
        if (req.user) {
            next()
        }
        else {
            res.redirect('/api/oauth2/authorization')
        }
    },
    server.decision()
]

// Application client token exchange endpoint
exports.token = [
    server.token(),
    server.errorHandler()
]