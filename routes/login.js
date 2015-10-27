var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');
router.get('', function(req,res){
    res.render('login');
})

router.post('', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.status(401).send({ error: 'User or password are incorrect' });
        }
        //user has authenticated correctly thus we create a JWT token
        //var token = jwt.encode({ username: 'somedata'}, tokenSecret);
        res.status(200).send({ message: "User was authenticated" });

    })(req, res, next);
});

module.exports = router;