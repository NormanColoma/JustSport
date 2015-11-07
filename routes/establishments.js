/**
 * Created by Norman on 05/11/2015.
 */
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var jwt = require('jwt-simple');


router.get('', function(req, res) {
    if(req.query.after){
        if(req.query.limit){
            var after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
            models.establishment.findAll({where:{id:{$gt:after}},limit:req.query.limit}).then(function (establishments) {
                var before = new Buffer(establishments[0].id.toString()).toString('base64');
                models.establishment.max('id').then(function(max){
                    var after = 0;
                    var next = 'none';
                    if(establishments[establishments.length-1].id < max) {
                        after = new Buffer(establishments[establishments.length - 1].id.toString()).toString('base64');
                        next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments?after="+after+'&limit='+req.query.limit;
                    }
                    var curs = {before: before, after: after};
                    var prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments?before="+before+'&limit='+req.query.limit;
                    var pag = {cursors: curs,previous:prev,next:next};
                    res.status(200).send({establishments:establishments,paging:pag, links: {rel:'self',href:req.protocol + "://" + req.hostname + ":3000" + "/api/establishments"}});
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
            models.establishment.findAll({where:{id:{$lt:before}},limit:req.query.limit}).then(function (establishments) {
                models.establishment.min('id').then(function(min){
                    var after = new Buffer(establishments[establishments.length - 1].id.toString()).toString('base64');
                    var next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments?after="+after+'&limit='+req.query.limit;
                    var before= 0;
                    var prev = 'none';
                    if(establishments[0].id > min) {
                        before = new Buffer(establishments[0].id.toString()).toString('base64');
                        prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments?before="+before+'&limit='+req.query.limit;
                    }
                    var curs = {before: before, after: after};
                    var pag = {cursors: curs,previous:prev,next:next};
                    res.status(200).send({establishments:establishments,paging:pag,links: {rel:'self',href:req.protocol + "://" + req.hostname + ":3000" + "/api/establishments"}});
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
        models.establishment.findAll({limit: limit}).then(function (establishments) {
            var before = 0;
            models.establishment.max('id').then(function (max) {
                var after = 0;
                var next = 'none';
                if(establishments[establishments.length-1].id < max) {
                    after = new Buffer(establishments[establishments.length - 1].id.toString()).toString('base64');
                    next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments?after="+after+'&limit='+limit;
                }
                var curs = {before: before, after: after};
                var prev = 'none';
                var pag = {cursors: curs, previous: prev, next: next};
                res.status(200).send({establishments: establishments, paging: pag,links: {rel:'self',href:req.protocol + "://" + req.hostname + ":3000" + "/api/establishments"}});
            })
        }).catch(function (err) {
            res.status(500).send(err);
        })
    }
});
router.get('/:id', function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
    }else {
        models.establishment.findById(req.params.id).then(function (establishment) {
            if (establishment == undefined)
                res.status(404).send({message: "The establishment was not found"});
            else {
                establishment.getUser({attributes:['uuid', 'name', 'lname', 'email', 'gender']}).then(function(owner){
                    var links = new Array();
                    var link1 = {rel: 'self',href:req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id};
                    var link2 = {rel: 'sports',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/sports"};
                    links.push([link1,link2]);
                    res.status(200).send({id: establishment.id, name: establishment.name, desc: establishment.desc,
                        city: establishment.city, province: establishment.province, addr: establishment.addr,
                        phone: establishment.phone, website: establishment.website, main_img: establishment.main_img,
                        Owner: owner, links:links});
                })
            }
        }).catch(function(err){
            console.log(err)
            res.status(500).send(err);
        });
    }
});
router.get('/:id/sports', function(req, res) {
    if(req.query.after){
        if(req.query.limit){
            models.establishment.findOne({where:{id:req.params.id}}).then(function(est){
                if (est == undefined)
                    res.status(404).send({message: "The establishment was not found"});
                else{
                    if(req.query.limit == 0)
                        res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
                    else {
                        var after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
                        est.getSports({
                            attributes: ['id', 'name'], joinTableAttributes: [], limit: req.query.limit,
                            where: {id: {$gt: after}}
                        }).then(function (sports) {
                            var before = new Buffer(sports[0].id.toString()).toString('base64');
                            est.getSports().then(function (count) {
                                var after = 0;
                                var next = 'none';
                                if (sports[sports.length - 1].id < count[count.length - 1].id && count.length > req.query.limit) {
                                    after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
                                    next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports?after=" + after + '&limit=' + req.query.limit;
                                }
                                var curs = {before: before, after: after};
                                var prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports?before=" + before + '&limit=' + req.query.limit;
                                var pag = {cursors: curs, previous: prev, next: next};
                                res.status(200).send({
                                    sports: sports, paging: pag, links: {
                                        rel: 'self', href: req.protocol + "://" + req.hostname + ":3000" +
                                        "/api/establishments" + req.params.id + "/sports"
                                    }
                                });
                            })
                        })
                    }
                }
            })
        }
        else
            res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else if(req.query.before){
        if(req.query.limit){
            models.establishment.findOne({where:{id:req.params.id}}).then(function(est) {
                if (est == undefined)
                    res.status(404).send({message: "The establishment was not found"});
                else {
                    if(req.query.limit == 0)
                        res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
                    else {
                        var before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
                        est.getSports({
                            attributes: ['id', 'name'], joinTableAttributes: [], limit: req.query.limit,
                            where: {id: {$lt: before}}
                        }).then(function (sports) {
                            est.getSports().then(function (count) {
                                var after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
                                var next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports?after=" + after + '&limit=' + req.query.limit;
                                var before = 0;
                                var prev = 'none';
                                //In this case, there is no need to lookup the total value of the sports
                                if (sports[0].id > count[0].id) {
                                    before = new Buffer(sports[0].id.toString()).toString('base64');
                                    prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports?before=" + before + '&limit=' + req.query.limit;
                                }
                                var curs = {before: before, after: after};
                                var pag = {cursors: curs, previous: prev, next: next};
                                res.status(200).send({
                                    sports: sports, paging: pag, links: {
                                        rel: 'self',
                                        href: req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports"
                                    }
                                });
                            })
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
        if(req.query.limit)
            limit=req.query.limit;
        //Checking that establishment exists
        models.establishment.findOne({where:{id:req.params.id}}).then(function(est) {
            if (est == undefined)
                res.status(404).send({message: "The establishment was not found"});
            else {
                //If establishment exists, we retrieve the sports
                if(limit == 0)
                    res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
                else {
                    est.getSports({attributes: ['id', 'name'], joinTableAttributes: [], limit: limit}).then(function (sports) {
                        var before = 0;
                        var after = 0;
                        var next = 'none';
                        if(sports.length == 0)
                            res.status(200).send(sports);
                        else {
                            //We get the total number of the sports
                            est.getSports().then(function (count) {
                                //If last item retrieved is lower than max id and the number of total sports is greater than the limit
                                //Then we'll have after cursors
                                if (sports[sports.length - 1].id < count[count.length - 1].id && count.length > limit) {
                                    after = new Buffer(sports[sports.length - 1].id.toString()).toString('base64');
                                    next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports?after=" + after + '&limit=' + limit;
                                }
                                var curs = {before: before, after: after};
                                var prev = 'none';
                                var pag = {cursors: curs, previous: prev, next: next};
                                res.status(200).send({
                                    sports: sports,
                                    paging: pag,
                                    links: {
                                        rel: 'self',
                                        href: req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id + "/sports"
                                    }
                                });
                            })
                        }
                    })
                }
            }
        })
    }
});
router.post('/new', authController.isBearerAuthenticated, function(req, res) {
    if(models.user.isOwner(req.get('Authorization').slice('7'))){
        if (req.body.name && req.body.desc && req.body.city && req.body.province && req.body.phone && req.body.addr && req.body.owner) {
            models.establishment.create(req.body).then(function (est) {
                var url = req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/" + est.id;
                res.setHeader("Location", url);
                var links = new Array();
                var link1 = {rel: 'self',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/new"};
                var link2 = {rel: 'update',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+est.id};
                var link3 = {rel: 'delete',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+est.id};
                var link4 = {rel: 'clean',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+est.id+"/sports"};
                var link5 = {rel: 'impart',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+est.id+"/sports/{id}"};
                links.push([link1,link2,link3,link4,link5]);
                res.status(201).send({id: est.id, name: est.name, desc: est.desc, city: est.city,
                    province: est.province, addr: est.addr, phone: est.phone, website: est.website,
                    main_img: est.main_img, owner: est.owner,links: links});
            }).catch(function (err) {
                res.status(500).send(err);
            })
        }
        else
            res.status(400).send({message: "Json is malformed, it must include the following fields: name," +
            " desc, city, province, addr, owner, phone, website(optional), main_img(optional)"});
    }
    else
        res.status(403).send({message: "You are not authorized to perform this action"});

});

router.delete('/:id', authController.isBearerAuthenticated, function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
    }
    else {
        if(models.user.isOwner(req.get('Authorization').slice('7'))) {
            models.establishment.destroy({
                where: {
                    id: req.params.id,
                    owner: jwt.decode(req.get('Authorization').slice('7'), global.secret).sub
                }
            }).then(function (rows) {
                if (rows > 0)
                    res.status(204).send();
                else
                    res.status(404).send({message: "The establishment was not found"});
            }).catch(function (err) {
                res.status(500).send(err);
            })
        }
        else
            res.status(403).send({message: "You are not authorized to perform this action"});
    }
});


router.put('/:id', authController.isBearerAuthenticated, function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
    }
    else {
        if(req.body.owner) {
            var values = req.body;
            var where = {where: {id: req.params.id, owner: req.body.owner}};
            if (models.user.isOwner(req.get('Authorization').slice('7'))) {
                models.establishment.update(values, where).then(function (updated) {
                    if (updated > 0)
                        res.status(204).send();
                    else
                        res.status(404).send({message: "The establishment was not found"});
                }).catch(function (err) {
                    res.status(500).send(err);
                })
            }
            else
                res.status(403).send({message: "You are not authorized to perform this action"});
        }
        else
            res.status(400).send({message: "Json is malformed: owner field is required for updatings"});
    }
});
module.exports = router;