var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sports = require('./routes/sports');
var routes = require('./routes/index');
var users = require('./routes/users');
var clients = require('./routes/clients');
var passport = require('passport');
var authController = require('./routes/auth');
var session = require('express-session');
var oauth2Controller = require('./routes/oauth2');
var router = express.Router();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));


// Create endpoint handlers for oauth2 authorize
router.route('/oauth2/authorize')
    .get(authController.isAuthenticated, oauth2Controller.authorization)
    .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/oauth2/token')
    .post(authController.isClientAuthenticated, oauth2Controller.token);
app.use('/api', router);
app.use('/', routes);
app.use('/api/sports',authController.isBearerAuthenticated, sports);
app.use('/api/clients',authController.isAuthenticated, clients);
app.use('/api/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});


module.exports = app;
