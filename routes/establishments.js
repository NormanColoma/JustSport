/**
 * Created by Norman on 05/11/2015.
 */
var models  = require('../models');
var express = require('express');
var multer = require('multer');
var router  = express.Router();
var authController = require('../routes/auth');
var jwt = require('jwt-simple');
var middleware = require('../middlewares/paramMiddleware');
var handler = require('../handlers/errorHandler');
var user = require('../middlewares/checkUser');

//Set this to use raw queries
var Sequelize = require('sequelize');
var env       = process.env.NODE_ENV  || 'test';
var config    = require('../config/config.json')[env];
if(process.env.DATABASE_URL){
    var sequelize = new Sequelize(process.env.DATABASE_URL,{
        dialect: 'mysql',
        port: '3306',
        host: 'us-cdbr-iron-east-03.cleardb.net',
        logging: false
    });
}
else {
    var sequelize = new Sequelize(config.database, config.username, config.password,{logging: false});
}

//Set options for Multer.js
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/images/ests')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

router.get('', function(req, res) {
    var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments",
        before = 0, prev = 'none', after = 0, next = 'none';
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments" + "?after="+req.query.after+"?limit="+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'], limit: parseInt(limit), where:{id: {$gt: after}}};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments" + "?before="+req.query.before+"?limit="+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'], limit: parseInt(limit), where:{id: {$lt: before}}};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments" + "?limit="+limit;
        }
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'], limit: parseInt(limit), where:{id: {$gt: after}}};
    }
    before = 0;
    after = 0;
    models.establishment.findAndCountAll(where).then(function(ests){
        models.establishment.findAndCountAll().then(function(total){
            if(ests.count > 0) {
                //Check if there are after cursors
                if (ests.rows.length < ests.count || ests.rows[ests.rows.length - 1].id < total.rows[total.rows.length - 1].id) {
                    after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                    next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments" +
                        "?after=" + after + '&limit=' + limit;
                }
                models.establishment.min('id').then(function (min) {
                    //Check if there are before cursors
                    if (ests.rows[0].id > min) {
                        before = new Buffer(ests.rows[0].id.toString()).toString('base64');
                        prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments" +
                            "?before=" + before + '&limit=' + limit;
                    }
                    var curs = {before: before, after: after};
                    var pag = {cursors: curs, previous: prev, next: next};
                    ests.count = total.count;
                    res.status(200).send({
                        Establishments: ests, paging: pag, links: {rel: 'self', href: url}
                    });
                })
            }else
                res.status(404).send({message: "The are no establishments added yet"});
        });
    });
    /*if(req.query.after){
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
                res.status(500).send({errors: handler.customServerError(err)});
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
                res.status(500).send({errors: handler.customServerError(err)});
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
            res.status(500).send({errors: handler.customServerError(err)});
        })
    }*/
});
router.get('/:id', function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
    }else {
        models.establishment.findById(req.params.id).then(function (establishment) {
            if (establishment == undefined)
                res.status(404).send({message: "The establishment was not found"});
            else {
                establishment.getOwner({attributes:['uuid', 'name', 'lname', 'email', 'gender']}).then(function(owner){
                    var links = new Array();
                    var link1 = {rel: 'self',href:req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id};
                    var link2 = {rel: 'sports',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/sports"};
                    var link3 = {rel: 'filter',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+
                        "/sports/location/Alicante" }
                    var link4 = {rel: 'associate',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/sports/new"};
                    links.push([link1,link2,link3,link4]);
                    res.status(200).send({id: establishment.id, name: establishment.name, desc: establishment.desc,
                        city: establishment.city, province: establishment.province, addr: establishment.addr,
                        phone: establishment.phone, website: establishment.website, main_img: establishment.main_img,
                        Owner: owner, links:links});
                })
            }
        }).catch(function(err){
            res.status(500).send({errors: handler.customServerError(err)});
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
router.get('/sport/:id/location/:location', middleware.numericalIdSport, middleware.stringLocation, middleware.pagination,
    function(req,res){
        if(req.query.after){
            var after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
            models.establishment.findAndCountAll({where:
            {id: {$gt: after},$or: {province: {$like:'%'+req.params.location+'%'}, city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
                limit: req.query.limit}).then(function(ests){
                if(ests.count > 0) {
                    var before = new Buffer(ests.rows[0].id.toString()).toString('base64');
                    var after = 0;
                    var next = 'none';
                    models.establishment.max('id').then(function (max) {
                        if (ests.rows[ests.rows.length - 1].id < max && ests.count > req.query.limit) {
                            after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                            next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/"
                                + req.params.location + "?after=" + after + '&limit=' + req.query.limit;
                        }
                        var curs = {before: before, after: after};
                        var prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/"
                            + req.params.location + "?before=" + before + '&limit=' + req.query.limit;
                        var pag = {cursors: curs, previous: prev, next: next};
                        res.status(200).send({
                            Establishments: ests, paging: pag, links: {
                                rel: 'self',
                                href: req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/"
                                + req.params.id + "/location/" + req.params.location
                            }
                        });
                    })
                }else{
                    res.status(404).send({message: 'There are no establishments that match the current filter'});
                }
            }).catch(function(err){
                res.status(500).send({errors: handler.customServerError(err)});
            })
        }
        else if(req.query.before){
            var before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
            models.establishment.findAndCountAll({where:
            {id: {$lt: before},$or: {province: {$like:'%'+req.params.location+'%'}, city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
            limit: req.query.limit}).then(function(ests){
                if(ests.count > 0) {
                    var after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                    var next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/"
                        + req.params.location + "?after=" + after + '&limit=' + req.query.limit;
                    var before = 0;
                    var prev = 'none';
                    models.establishment.min('id').then(function (min) {
                        if (ests.rows[0].id > min) {
                            before = new Buffer(ests.rows[0].id.toString()).toString('base64');
                            prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/"
                                + req.params.location + "?before=" + before + '&limit=' + req.query.limit;
                        }
                        var curs = {before: before, after: after};
                        var pag = {cursors: curs, previous: prev, next: next};
                        res.status(200).send({
                            Establishments: ests, paging: pag, links: {
                                rel: 'self',
                                href: req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/"
                                + req.params.id + "/location/" + req.params.location
                            }
                        });
                    })
                }else{
                    res.status(404).send({message: 'There are no establishments that match the current filter'});
                }
            }).catch(function(err){
                res.status(500).send({errors: handler.customServerError(err)});
            })
        }
        else {
            var limit = 5;
            if(req.query.limit)
                limit=req.query.limit;
            //Checking that establishment exists
            models.establishment.findAndCountAll({where:
            {$or: {province: {$like:'%'+req.params.location+'%'}, city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
                limit: limit}).then(function(ests){
                if(ests.count > 0) {
                    var before = 0;
                    var prev = 'none';
                    var after = 0;
                    var next = 'none';
                    models.establishment.max('id').then(function (max) {
                        if (ests.rows[ests.rows.length - 1].id < max && ests.count > req.query.limit) {
                            after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                            next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/"
                                + req.params.location + "?after=" + after + '&limit=' + req.query.limit;
                        }
                        var curs = {before: before, after: after};
                        var pag = {cursors: curs, previous: prev, next: next};
                        res.status(200).send({
                            Establishments: ests, paging: pag, links: {
                                rel: 'self',
                                href: req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/"
                                + req.params.id + "/location/" + req.params.location
                            }
                        });
                    })
                }else{
                    res.status(404).send({message: 'There are no establishments that match the current filter'});
                }
            }).catch(function(err){
                console.log(err);
                res.status(500).send(err);
            })
        }
})
router.get('/me/all', authController.isBearerAuthenticated, middleware.pagination, function(req,res){
    var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all",
    before = 0, prev = 'none', after = 0, next = 'none', owner_id = models.user.getAdminId(req.get('Authorization').slice('7'));
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all"
        + "?after="+req.query.after+"?limit"+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr'], limit: parseInt(limit), where:{id: {$gt: after},owner: owner_id}};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" + "?before="+req.query.before+"?limit"+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr'], limit: parseInt(limit), where:{id: {$lt: after},owner: owner_id}};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" + "?limit="+limit;
        }
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr'], limit: parseInt(limit), where:{id: {$gt: after},owner: owner_id}};
    }
    before = 0;
    after = 0;
    models.establishment.findAndCountAll(where).then(function(ests){
        models.establishment.findAndCountAll({ where: {owner: owner_id}}).then(function(total){
            //Check if there are after cursors
            if(ests.rows.length < ests.count || ests.rows[ests.rows.length -1].id < total.rows[total.count-1].id){
                after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" +
                    "?after=" + after + '&limit=' + limit;
            }
            models.establishment.min('id', { where: {owner: owner_id}}).then(function(min){
                //Check if there are before cursors
                if (ests.rows[0].id > min) {
                    before = new Buffer(ests.rows[0].id.toString()).toString('base64');
                    prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" +
                        "?before=" + before + '&limit=' + limit;
                }
                var curs = {before: before, after: after};
                var pag = {cursors: curs, previous: prev, next: next};
                ests.count = total.count;
                res.status(200).send({
                    Establishments: ests, paging: pag, links: {rel: 'self', href: url}
                });
            })
        })
    });
})
router.post('/new', authController.isBearerAuthenticated, multer({ storage: storage}).single('est_profile'),
    function(req, res) {
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
                res.status(500).send({errors: handler.customServerError(err)});
            })
        }
        else
            res.status(400).send({message: "Json is malformed, it must include the following fields: name," +
            " desc, city, province, addr, owner, phone, website(optional), main_img(optional)"});
    }
    else
        res.status(403).send({message: "You are not authorized to perform this action"});

});


router.put('/:id/sports/new', authController.isBearerAuthenticated, middleware.numericalIdEstab, user.isOwner,
    user.isEstabOwner, function(req, res) {
    if (req.body.id) {
        sequelize.query("INSERT INTO establishmentsports (sportId,establishmentId) VALUES ("+req.body.id+","+req.params.id+")",
            { type: sequelize.QueryTypes.INSERT}).then(function (est) {
                res.status(204).send();
        }).catch(function (err) {
            res.status(500).send({errors: handler.customServerError(err)});
        })
    }
    else
        res.status(400).send({message: "Json is malformed: id of sport must be included for perform this action"});

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
                res.status(500).send({errors: handler.customServerError(err)});
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
                    res.status(500).send({errors: handler.customServerError(err)});
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