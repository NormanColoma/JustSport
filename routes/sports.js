var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var handler = require('../handlers/errorHandler');

/**
 * Primero miramos si hay, after o before, para hacer las cláusulas where y los cambios de url,
 * si no hay, es una consulta normal. Después tendremos que comprobar el mínimo y máximo, para saber
 * si hay siguiente o anterior. Es diferente el total de la consulta, con el total de la colección,
 * por ello tenemos que consultar ambas para verificar el anterior y siguiente.
 */
router.get('', function(req, res) {
  var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports",
      before = 0, prev = 'none', after = 0, next = 'none';
  if(req.query.after){
    after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
    limit = req.query.limit;
    url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports" + "?after="+req.query.after+"?limit"+limit;
    where = {attributes: ['id', 'name'], limit: parseInt(limit), where:{id: {$gt: after}}};
  }else if(req.query.before){
    before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
    limit = req.query.limit;
    url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports" + "?before="+req.query.before+"?limit"+limit;
    where = {attributes: ['id', 'name'], limit: parseInt(limit), where:{id: {$lt: before}}};
  }else{
    if(req.query.limit) {
      limit = req.query.limit;
      url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports" + "?limit="+limit;
    }
    where = {attributes: ['id', 'name'], limit: parseInt(limit), where:{id: {$gt: after}}};
  }
  before = 0;
  after = 0;
  models.sport.findAndCountAll(where).then(function(sports){
    models.sport.findAndCountAll().then(function(total){
      if(sports.count > 0) {
        //Check if there are after cursors
        if (sports.rows.length < sports.count || sports.rows[sports.rows.length - 1].id < total.rows[total.rows.length - 1].id) {
          after = new Buffer(sports.rows[sports.rows.length - 1].id.toString()).toString('base64');
          next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports" +
              "?after=" + after + '&limit=' + limit;
        }
        models.sport.min('id').then(function (min) {
          //Check if there are before cursors
          if (sports.rows[0].id > min) {
            before = new Buffer(sports.rows[0].id.toString()).toString('base64');
            prev = req.protocol + "://" + req.hostname + ":3000" + "/api/sports" +
                "?before=" + before + '&limit=' + limit;
          }
          var curs = {before: before, after: after};
          var pag = {cursors: curs, previous: prev, next: next};
          sports.count = total.count;
          res.status(200).send({
            Sports: sports, paging: pag, links: {rel: 'self', href: url}
          });
        })
      }else
        res.status(404).send({message: "The are no sports added yet"});
    });
  });
});



router.get('/:id', function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }else {
    models.sport.findById(req.params.id).then(function (sport) {
      if (sport == undefined)
        res.status(404).send({message: "The sport was not found"});
      else {
        var links = new Array();
        var link1 = {rel: 'self',href:req.protocol + "://" + req.hostname + ":"+global.port + "/api/sports/"+req.params.id};
        var link2 = {rel: 'establishments',
          href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/sports/"+req.params.id+"/establishments"};
        links.push([link1,link2]);
        res.status(200).send({id: sport.id, name: sport.name,links:links});
      }
    }).catch(function(err){
      res.status(500).send({errors: handler.customServerError(err)});
    });
  }
});

router.get('/:id/establishments', function(req, res) {
  if (req.params.id != parseInt(req.params.id, 10)){
    res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
  }else {
    if (req.query.after) {
      if (req.query.limit) {
        models.sport.findOne({where: {id: req.params.id}}).then(function (sport) {
          if (sport == undefined)
            res.status(404).send({message: "The sport was not found"});
          else {
            if (req.query.limit == 0)
              res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
            else {
              var after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
              sport.getEstablishments({
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                joinTableAttributes: [], limit: limit, include: [{
                  model: models.user, as: 'Owner',
                  attributes: ['uuid', 'name', 'lname', 'email', 'gender']
                }], where: {id: {$gt: after}}
              }).then(function (ests) {
                if (ests.length == 0)
                  res.status(200).send(ests);
                else {
                  var before = new Buffer(ests[0].id.toString()).toString('base64');
                  sport.getEstablishments().then(function (count) {
                    var after = 0;
                    var next = 'none';
                    if (ests[ests.length - 1].id < count[count.length - 1].id && count.length > req.query.limit) {
                      after = new Buffer(ests[ests.length - 1].id.toString()).toString('base64');
                      next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id +
                          "/establishments?after=" + after + '&limit=' + req.query.limit;
                    }
                    var curs = {before: before, after: after};
                    var prev = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id +
                        "/establishments?before=" + before + '&limit=' + req.query.limit;
                    var pag = {cursors: curs, previous: prev, next: next};
                    res.status(200).send({
                      Establishments: ests, paging: pag, links: {
                        rel: 'self', href: req.protocol + "://" + req.hostname + ":3000" +
                        "/api/sports" + req.params.id + "/establishments"
                      }
                    });
                  })
                }
              })
            }
          }
        })
      }
      else
        res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else if (req.query.before) {
      if (req.query.limit) {
        models.sport.findOne({where: {id: req.params.id}}).then(function (sport) {
          if (sport == undefined)
            res.status(404).send({message: "The sport was not found"});
          else {
            if (req.query.limit == 0)
              res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
            else {
              var before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
              sport.getEstablishments({
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                joinTableAttributes: [], limit: limit, include: [{
                  model: models.user, as: 'Owner',
                  attributes: ['uuid', 'name', 'lname', 'email', 'gender']
                }], where: {id: {$lt: before}}
              }).then(function (ests) {
                if (ests.length == 0)
                  res.status(200).send(ests);
                else {
                  sport.getEstablishments().then(function (count) {
                    var after = new Buffer(ests[ests.length - 1].id.toString()).toString('base64');
                    var next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" +
                        req.params.id + "/establishments?after=" + after + '&limit=' + req.query.limit;
                    var before = 0;
                    var prev = 'none';
                    //In this case, there is no need to lookup the total value of the sports
                    if (ests[0].id > count[0].id) {
                      before = new Buffer(ests[0].id.toString()).toString('base64');
                      prev = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id +
                          "/establishments?before=" + before + '&limit=' + req.query.limit;
                    }
                    var curs = {before: before, after: after};
                    var pag = {cursors: curs, previous: prev, next: next};
                    res.status(200).send({
                      Establishments: ests, paging: pag, links: {
                        rel: 'self',
                        href: req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id + "/establishments"
                      }
                    });
                  })
                }
              })
            }
          }
        })
      }
      else
        res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else {
      var limit = 5;
      if (req.query.limit)
        limit = req.query.limit;
      //Checking that establishment exists
      models.sport.findOne({where: {id: req.params.id}}).then(function (sport) {
        if (sport == undefined)
          res.status(404).send({message: "The sport was not found"});
        else {
          //If establishment exists, we retrieve the sports
          if (limit == 0)
            res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
          else {
            sport.getEstablishments({
              attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
              joinTableAttributes: [], limit: limit, include: [{
                model: models.user, as: 'Owner',
                attributes: ['uuid', 'name', 'lname', 'email', 'gender']
              }]
            }).then(function (ests) {
              var before = 0;
              var after = 0;
              var next = 'none';
              if (ests.length == 0)
                res.status(200).send(ests);
              else {
                //We get the total number of the sports
                sport.getEstablishments().then(function (count) {
                  //If last item retrieved is lower than max id and the number of total sports is greater than the limit
                  //Then we'll have after cursors
                  if (ests[ests.length - 1].id < count[count.length - 1].id && count.length > limit) {
                    after = new Buffer(ests[ests.length - 1].id.toString()).toString('base64');
                    next = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id +
                        "/establishments?after=" + after + '&limit=' + limit;
                  }
                  var curs = {before: before, after: after};
                  var prev = 'none';
                  var pag = {cursors: curs, previous: prev, next: next};
                  res.status(200).send({
                    Establishments: ests,
                    paging: pag,
                    links: {
                      rel: 'self',
                      href: req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + req.params.id + "/establishments"
                    }
                  });
                })
              }
            })
          }
        }
      })
    }
  }
});

router.post('/new', authController.isBearerAuthenticated, function(req, res) {
  if(models.user.isOwner(req.get('Authorization').slice('7'))){
    if (req.body.name) {
      models.sport.create(req.body).then(function (sport) {
        var url = req.protocol + "://" + req.hostname + ":3000" + "/api/sports/" + sport.id;
        res.setHeader("Location", url);
        var links = new Array();
        var link1 = {rel: 'self',
          href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/sports/new"};
        var link2 = {rel: 'update',
          href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/sports/"+sport.id};
        var link3 = {rel: 'delete',
          href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/sports/"+sport.id};
        links.push([link1,link2,link3]);
        res.status(201).send({id: sport.id, name: sport.name, links: links});
      }).catch(function (err) {
        res.status(500).send({errors: handler.customServerError(err)});
      })
    }
    else
      res.status(400).send({message: "Json is malformed, it must include the following fields: name"});
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
          res.status(500).send({errors: handler.customServerError(err)});
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
        res.status(500).send({errors: handler.customServerError(err)});
      })
    }
    else
      res.status(403).send({message: "You are not authorized to perform this action"});
  }
});

module.exports = router;
