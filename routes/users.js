var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var handler = require('../handlers/errorHandler');

router.post('/new', function(req, res) {
  models.user.create(req.body).then(function (user) {
    models.user.findOne({where:{uuid: user.uuid}, attributes: ['uuid','name', 'lname','email','gender', 'role']}).then(function(user){
      var url = req.protocol + "://" + req.hostname +":"+ global.port + "/api/users/" + user.uuid;
      res.setHeader("Location", url);
      res.status(201).send(user);
    })
  }).catch(function (err){
    res.status(500).send({errors: handler.customServerError(err)});
  })
});

router.get('/:id', function(req, res) {
  models.user.findOne({where:{uuid: req.params.id}, attributes: ['uuid','name', 'lname','email','gender', 'role']}).then(function (user) {
      if (user == undefined)
        res.status(404).send({message: "User was not found"});
      else {
        res.status(200).send(user);
      }
    }).catch(function(err){
      res.status(500).send(err);
    });
});

router.delete('/:id', authController.isBearerAuthenticated, function(req, res) {
    if(models.user.selfUser(req.get('Authorization').slice('7'), req.params.id)) {
      models.user.destroy({
        where: {
          uuid: req.params.id
        }
      }).then(function (rows) {
        if (rows > 0) {
          res.status(204).send();
        }
        else
          res.status(404).send({message: "User was not found"});
      }).catch(function (err) {
        res.status(500).send(err);
      })
    }
   else {
      res.status(403).send({message: "You are not authorized to perform this action"});
    }
});

module.exports = router;
