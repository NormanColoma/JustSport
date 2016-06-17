var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sports = require('./routes/sports');
var establishments = require('./routes/establishments');
var courses = require('./routes/courses');
var schedules = require('./routes/schedules');
var routes = require('./routes/index');
var users = require('./routes/users');
var commentaries = require('./routes/commentaries');
var clients = require('./routes/clients');
var passport = require('passport');
var authController = require('./routes/auth');
var session = require('express-session');
var oauth2Controller = require('./routes/oauth2');
var router = express.Router();
var app = express();
var cors = require('cors');
var listeners = process.env.MAX_LISTENERS || 10;

app.use(cors());

global.secret = '23asdfwer5676asdfaqzxsrt56woppxcjq12341pasdfasfd547kjxhoaefr44556añksdfjlka13a2adf4134sjdfla';
global.port = '3000';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(__dirname + '/public'));


app.use(session({
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

router.route('/oauth2/authorize')
    .get(oauth2Controller.authorization)
    .post(oauth2Controller.decision);
// Create endpoint handlers for oauth2 token
router.route('/oauth2/token')
    .post(oauth2Controller.token);


app.get('/api/oauth/authorization', function(req, res) { res.render('login', {clientId : req.query.client_id, redirectUri: req.query.redirect_uri, responseType: req.query.response_type}) })
app.post('/api/oauth/authorization', passport.authenticate('local', { failureRedirect: '/api/oauth/authorization' }),
    function(req, res) {
      res.redirect('/api/oauth2/authorize?response_type=' + req.body.responseType + '&client_id=' + req.body.clientId +
          '&redirect_uri=' + req.body.redirectUri);
    });

app.use('/api', router);
app.use('/', routes);
app.use('/api/sports', sports);
app.use('/api/clients',authController.isBearerAuthenticated, clients);
app.use('/api/users', users);
app.use('/api/establishments', establishments);
app.use('/api/courses', courses);
app.use('/api/schedules', schedules);
app.use('/api/commentaries', commentaries);

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

process.setMaxListeners(parseInt(listeners));

module.exports = app;