var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');


router.get('', function(req, res) {
    models.sport.findAll().then(function (sports) {
      res.status(200).send(sports);
    }).catch(function(err){
      res.status(500).send(err);
    })
});



router.get('/:id', function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id is not a numercial id"});
  }else {
    models.sport.findById(req.params.id).then(function (sport) {
      if (sport == undefined)
        res.status(404).send({message: "The sport was not found"});
      else
        res.status(200).send(sport);
    }).catch(function(err){
      res.status(500).send(err);
    });
  }
});



router.get('/:id/establishments', function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
  }
  else {
    models.sport.findById(req.params.id).then(function (sport) {
      if (sport == undefined)
        res.status(404).send({message: "The sport was not found"});
      else
        return sport.getEstablishments({attributes: ['id','name','desc','city','province','addr','createdAt','updatedAt'], joinTableAttributes: []});
    }).then(function (establishments) {
      if (establishments.length == 0) {
        res.status(404).send({message: "There were no establishments found for the supplied sport"});
      }
      else
        res.status(200).send(establishments);
    }).catch(function(err){
      res.status(500).send(err);
    });
  }

});


router.delete('/:id', authController.isBearerAuthenticated, function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }
  else {
    models.sport.destroy({
      where: {
        id: req.params.id
      }
    }).then(function (rows) {
      if (rows > 0)
        res.status(204).send();
      else
        res.status(404).send({message: "The sport was not found"});
    }).catch(function(err){
      res.status(500).send(err);
    })
  }
});

router.post('/new', authController.isBearerAuthenticated, function(req, res) {
  if(req.body.name) {
    models.sport.create({
      name: req.body.name
    }).then(function (sport) {
      var url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + sport.id;
      res.setHeader("Location", url);
      res.status(201).send(sport);
    }).catch(function(err){
      res.status(500).send(err);
    })
  }
  else
    res.status(400).send({message: "Json is malformed"});
});

router.put('/:id', authController.isBearerAuthenticated, function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }
  else {
    if (req.body.name) {
        models.sport.update({
          name: req.body.name,
          updatedAt: new Date()
        }, {
          where: {
            id: req.params.id
          }
        }).then(function (updated) {
          if(updated > 0)
            res.status(204).send();
          else
            res.status(404).send({message: "The sport was not found"});
        }).catch(function(err){
          res.status(500).send(err);
        })
    }
    else
      res.status(400).send({message: "Json is malformed"});
  }
});

module.exports = router;
