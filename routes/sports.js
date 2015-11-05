var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');


router.get('', function(req, res) {
    if(req.query.after){
      if(req.query.limit){
        var after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        models.sport.findAll({where:{id:{$gt:after}},limit:req.query.limit}).then(function (sports) {
          var before = new Buffer(sports[0].id.toString()).toString('base64');
          models.sport.max('id').then(function(max){
            var after = 0;
            var next = 'none';
            if(sports[sports.length-1].id < max) {
              after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
              next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports?after="+after+'&limit='+req.query.limit;
            }
            var curs = {before: before, after: after};
            var prev = req.protocol + "://" + req.hostname + ":3000" + "/api/sports?before="+before+'&limit='+req.query.limit;
            var pag = {cursors: curs,previous:prev,next:next};
            res.status(200).send({sports:sports,paging:pag});
          })
        }).catch(function(err){
          res.status(500).send(err);
        })
      }
      else
        res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else if(req.query.before){
      if(req.query.limit){
        var before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        models.sport.findAll({where:{id:{$lt:before}},limit:req.query.limit}).then(function (sports) {
          models.sport.min('id').then(function(min){
            var after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
            var next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports?after="+after+'&limit='+req.query.limit;
            var before= 0;
            var prev = 'none';
            if(sports[0].id > min) {
              before = new Buffer(sports[0].id.toString()).toString('base64');
              prev = req.protocol + "://" + req.hostname + ":3000" + "/api/sports?before="+before+'&limit='+req.query.limit;
            }
            var curs = {before: before, after: after};
            var pag = {cursors: curs,previous:prev,next:next};
            res.status(200).send({sports:sports,paging:pag});
          })
        }).catch(function(err){
          console.log(err)
          res.status(500).send(err);
        })
      }
      else
        res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else {
      var limit = 5;
      if(req.query.limit)
        limit=req.query.limit;
      models.sport.findAll({limit: limit}).then(function (sports) {
        var before = 0;
        models.sport.max('id').then(function (max) {
          var after = 0;
          var next = 'none';
          if(sports[sports.length-1].id < max) {
            after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
            next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports?after="+after+'&limit='+limit;
          }
          var curs = {before: before, after: after};
          var prev = 'none';
          var pag = {cursors: curs, previous: prev, next: next};
          res.status(200).send({sports: sports, paging: pag});
        })
      }).catch(function (err) {
        res.status(500).send(err);
      })
    }
});



router.get('/:id', function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }else {
    models.sport.findById(req.params.id).then(function (sport) {
      if (sport == undefined)
        res.status(404).send({message: "The sport was not found"});
      else
        res.status(200).send(sport);
    }).catch(function(err){
      console.log(err)
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



router.post('/new', authController.isBearerAuthenticated, function(req, res) {
  if(models.user.isOwner(req.get('Authorization').slice('7'))){
    if (req.body.name) {
      models.sport.create({
        name: req.body.name
      }).then(function (sport) {
        var url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + sport.id;
        res.setHeader("Location", url);
        res.status(201).send(sport);
      }).catch(function (err) {
        res.status(500).send(err);
      })
    }
    else
      res.status(400).send({message: "Json is malformed"});
  }
  else
    res.status(403).send({message: "You are not authorized to perform this action"});

});

router.put('/:id', authController.isBearerAuthenticated, function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }
  else {
    if(models.user.isOwner(req.get('Authorization').slice('7'))) {
      if (req.body.name) {
        models.sport.update({
          name: req.body.name,
          updatedAt: new Date()
        }, {
          where: {
            id: req.params.id
          }
        }).then(function (updated) {
          if (updated > 0)
            res.status(204).send();
          else
            res.status(404).send({message: "The sport was not found"});
        }).catch(function (err) {
          res.status(500).send(err);
        })
      }
      else
        res.status(400).send({message: "Json is malformed, it must include the name field"});
    }
    else
      res.status(403).send({message: "You are not authorized to perform this action"});
  }
});

router.delete('/:id', authController.isBearerAuthenticated, function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }
  else {
    if(models.user.isAdmin(req.get('Authorization').slice('7'))) {
      models.sport.destroy({
        where: {
          id: req.params.id
        }
      }).then(function (rows) {
        if (rows > 0)
          res.status(204).send();
        else
          res.status(404).send({message: "The sport was not found"});
      }).catch(function (err) {
        res.status(500).send(err);
      })
    }
    else
      res.status(403).send({message: "You are not authorized to perform this action"});
  }
});

module.exports = router;
