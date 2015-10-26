var models  = require('../models');
var express = require('express');
var router  = express.Router();



router.post('/new', function(req, res) {
  models.user.create({
    name: req.body.name,
    lname: req.body.lname,
    email: req.body.email,
    pass: req.body.pass,
    gender: req.body.gender
  }).then(function (user) {
    var url = req.protocol + "://" + req.hostname + ":3000" + "/api/users/" + user.uuid;
    res.setHeader("Location", url);
    res.status(201).send(user);
  }).catch(function (err){
    res.status(500).send(err);
  })
});

module.exports = router;
