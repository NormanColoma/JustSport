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
var fs = require('fs');
var PlaceAutocomplete = require("googleplaces");
//Set this to use raw queries
var Sequelize = require('sequelize');
var env       = process.env.NODE_ENV  || 'development';
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

var dest = process.env.UPLOAD_DEST || './public/images/ests';
//Set options for Multer.js
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage, limits: {fileSize:512000}}).single('est_profile');
router.put('/:id/new/image', authController.isBearerAuthenticated, middleware.numericalIdEstab, user.isEstabOwner, function(req, res) {
    upload(req,res, function(err){
        if(err){
            res.status(500).send({message: "File size is too long"});
        }else{
            models.establishment.find({where: {id: req.params.id}}).then(function(est){
                if(est === null){
                    res.status(404).send({message: "The establishment was not found"});
                }else{
                    if(est.get("main_img") !== "default.jpg")
                        fs.unlinkSync(dest+'/'+est.get("main_img"));
                    est.set("main_img", req.file.filename);
                    est.save();
                    res.status(204).send();
                }
            });
        }
    });
});

router.delete('/:id/image',authController.isBearerAuthenticated, middleware.numericalIdEstab, user.isEstabOwner, function(req, res){
    models.establishment.find({where: {id: req.params.id}}).then(function(est){
            if(est.get("main_img") == "default.jpg")
                res.status(403).send({message: 'You cannot remove the default image'});
            else{
                fs.unlinkSync(dest+'/'+est.get("main_img"));
                est.set("main_img", "default.jpg");
                est.save();
                res.status(204).send();
            }
    });
});

router.get('', function(req, res) {
    var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments",
        before = 0, prev = 'none', after = 0,next = 'none';
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
                });
            }else
                res.status(404).send({message: "The are no establishments added yet"});
        });
    });
});
router.get('/:id', function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numercial id"});
    }else {
        models.establishment.findById(req.params.id).then(function (establishment) {
            if (establishment === null)
                res.status(404).send({message: "The establishment was not found"});
            else {
                establishment.getOwner({attributes:['uuid', 'name', 'lname', 'email', 'gender']}).then(function(owner){
                    establishment.getVotes({attributes: ['user']}).then(function(votes){
                        establishment.getCommentaries({attributes: ['id', 'text', 'createdAt'], include:[{model: models.user, as: 'User', attributes: ['name', 'lname', 'img']}]}).then(function(commentaries){
                            establishment.getCourses({attributes: ['id', 'instructor', 'price', 'info'],
                                include: [{model: models.sport, as:'Sport',attributes:['name']}]}).then(function(courses){
                                var links = [];
                                var link1 = {rel: 'self',href:req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id};
                                var link2 = {rel: 'sports',
                                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/sports"};
                                var link3 = {rel: 'filter',
                                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+
                                    "/sports/location/Alicante" };
                                var link4 = {rel: 'associate',
                                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/sports/new"};
                                links.push([link1,link2,link3,link4]);
                                res.status(200).send({id: establishment.id, name: establishment.name, desc: establishment.desc,
                                    city: establishment.city, province: establishment.province, addr: establishment.addr,
                                    phone: establishment.phone, website: establishment.website, main_img: establishment.main_img,
                                    Owner: owner, links:links, Commentaries: commentaries, Votes: votes, Courses: courses});
                            });
                        });
                    });
                });
            }
        }).catch(function(err){
            res.status(500).send({errors: handler.customServerError(err)});
        });
    }
});
router.get('/:id/sports',middleware.numericalIdEstab, middleware.pagination,function(req, res) {
    var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/"+ req.params.id+"/sports",
        before = 0, prev = 'none', after = 0,next = 'none';
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments"+
            req.params.id+"/sports" + "?after="+req.query.after+"?limit"+limit;
        where = {attributes: ['id', 'name'],limit: parseInt(limit), where:{id: {$gt: after}}, order: 'id ASC'};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/"+ req.params.id+"/sports" +
            "?before="+req.query.before+"?limit"+limit;
        where = {attributes: ['id', 'name'], limit: parseInt(limit), where:{id: {$lt: before}}, order: 'id ASC'};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/"+ req.params.id+"/sports" + "?limit="+limit;
        }
        where = {attributes: ['id', 'name'],limit: parseInt(limit), where:{id: {$gt: after}}, order: 'id ASC'};
    }
    before = 0;
    after = 0;
    models.establishment.findOne({where: {id: req.params.id}}).then(function (est) {
        if (est === null)
            res.status(404).send({message: "The establishment was not found"});
        else {
            est.getSports(where).then(function(sprts) {
                est.getSports().then(function (total) {
                    if (sprts.length > 0) {
                        //Check if there are after cursors
                        var sports = {rows: sprts, count: total.length};
                        if (sports.rows[sports.rows.length - 1].id < total[total.length - 1].id) {
                            after = new Buffer(sports.rows[sports.rows.length - 1].id.toString()).toString('base64');
                            next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id+"/sports" +
                                "?after=" + after + '&limit=' + limit;
                        }

                        var min = Math.min.apply(Math,total.map(function(o){return o.id;}));
                        //Check if there are before cursors
                        if (sports.rows[0].id > min) {
                            before = new Buffer(sports.rows[0].id.toString()).toString('base64');
                            prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" + req.params.id+"/sports" +
                                "?before=" + before + '&limit=' + limit;
                        }
                        var curs = {before: before, after: after};
                        var pag = {cursors: curs, previous: prev, next: next};
                        res.status(200).send({
                            Sports: sports, paging: pag, links: {rel: 'self', href: url}
                        });
                    } else
                        res.status(404).send({message: "The are no sports added yet"});
                });
            });
        }
    });
});
router.get('/sport/:id/location/:location', middleware.numericalIdSport, middleware.stringLocation, middleware.pagination,function(req,res){
        var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000"+
        "/api/establishments/sport/" + req.params.id + "/location/" + req.params.location,
            before = 0, prev = 'none', after = 0,next = 'none';
        if(req.query.after){
            after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/" +
                req.params.location + "?after="+req.query.after+"?limit="+limit;
            where = {where: {id: {$gt: after},$or: {province: {$like:'%'+req.params.location+'%'},
                city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
                limit: parseInt(limit)};
        }else if(req.query.before){
            before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/" +
            req.params.location + "?before="+req.query.before+"?limit="+limit;
            where = {where: {id: {$lt: before},$or: {province: {$like:'%'+req.params.location+'%'},
                city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
                limit: parseInt(limit)};
        }else{
            if(req.query.limit) {
                limit = req.query.limit;
                url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/" +
                req.params.location + "?limit="+limit;
            }
            where = {where: {id: {$gt: after},$or: {province: {$like:'%'+req.params.location+'%'},
                city:{$like: '%'+req.params.location+'%'}}},
                attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone', 'website', 'main_img'],
                include: [{model: models.course, as:'Courses', attributes: ['id'], where: {sportId: req.params.id}}],
                limit: parseInt(limit)};
        }
        before = 0;
        after = 0;
        models.establishment.findAndCountAll(where).then(function(ests){
            models.establishment.findAndCountAll({where: {id: {$gt: after},$or: {province: {$like:'%'+req.params.location+'%'},
                city:{$like: '%'+req.params.location+'%'}}}}).then(function(total){
                if(ests.count > 0) {
                    //Check if there are after cursors
                    if (ests.rows.length < ests.count || ests.rows[ests.rows.length - 1].id < total.rows[total.rows.length - 1].id) {
                        after = new Buffer(ests.rows[ests.rows.length - 1].id.toString()).toString('base64');
                        next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/" +
                            req.params.location+"?after=" + after + '&limit=' + limit;
                    }
                    models.establishment.min('id').then(function (min) {
                        //Check if there are before cursors
                        if (ests.rows[0].id > min) {
                            before = new Buffer(ests.rows[0].id.toString()).toString('base64');
                            prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/sport/" + req.params.id + "/location/" +
                                req.params.location+"?before=" + before + '&limit=' + limit;
                        }
                        var curs = {before: before, after: after};
                        var pag = {cursors: curs, previous: prev, next: next};
                        ests.count = total.count;
                        res.status(200).send({
                            Establishments: ests, paging: pag, links: {rel: 'self', href: url}
                        });
                    });
                }else
                    res.status(404).send({message: "There are no establishments that match the current filter"});
            });
        }).catch(function(err){
            res.status(500).send({errors: handler.customServerError(err)});
        });
});
router.get('/me/all', authController.isBearerAuthenticated, middleware.pagination,function(req,res){
    var where = "", limit = 5, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all",
    before = 0, prev = 'none', after = 0, owner_id = models.user.getAdminId(req.get('Authorization').slice('7')), next = 'none';
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" +
            "?after="+req.query.after+"?limit"+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone','website','main_img'],
            include: {model: models.course, as: 'Courses', attributes: ['id', 'info', 'price', 'instructor'],
                include:[{model: models.schedule, as: 'Schedule', attributes: ['id', 'day', 'startTime', 'endTime']},
                    {model: models.sport, as:'Sport',attributes:['name']}]},
            limit: parseInt(limit), where:{id: {$gt: after},owner: owner_id}};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" + "?before="+req.query.before+"?limit"+limit;
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone','website','main_img'],
            include: {model: models.course, as: 'Courses', attributes: ['id', 'info', 'price', 'instructor'],
                include:[{model: models.schedule, as: 'Schedule', attributes: ['id', 'day', 'startTime', 'endTime']},
                    {model: models.sport, as:'Sport',attributes:['name']}]},
            limit: parseInt(limit), where:{id: {$lt: after},owner: owner_id}};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/me/all" + "?limit="+limit;
        }
        where = {attributes: ['id', 'name', 'desc', 'city', 'province', 'addr', 'phone','website','main_img'],
            include: {model: models.course, as: 'Courses', attributes: ['id', 'info', 'price', 'instructor'],
                include:[{model: models.schedule, as: 'Schedule', attributes: ['id', 'day', 'startTime', 'endTime']},
                    {model: models.sport, as:'Sport',attributes:['name']}]},
            limit: parseInt(limit), where:{id: {$gt: after},owner: owner_id}};
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
            });
        });
    });
});
router.post('/new', authController.isBearerAuthenticated, function(req, res) {
    if(models.user.isOwner(req.get('Authorization').slice('7'))){
        if (req.body.name && req.body.desc && req.body.city && req.body.province && req.body.phone && req.body.addr && req.body.owner) {
            models.establishment.create(req.body).then(function (est) {
                var url = req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/" + est.id;
                res.setHeader("Location", url);
                var links = [];
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
            });
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
        });
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
            });
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
                });
            }
            else
                res.status(403).send({message: "You are not authorized to perform this action"});
        }
        else
            res.status(400).send({message: "Json is malformed: owner field is required for updatings"});
    }
});

router.post('/:id/commentaries/new', authController.isBearerAuthenticated,  middleware.numericalIdEstab, function(req, res) {
    var user = models.user.getAdminId(req.get('Authorization').slice('7'));
    models.establishment.find({where: {id: req.params.id}}).then(function(est){
        if(est === null){
            res.status(404).send({message: "The establishment was not found"});
        }else{
            var commentary={user: user, text: req.body.text, establishmentId: req.params.id};
            models.commentary.create(commentary).then(function(commentary){
                commentary.getUser().then(function(user){
                    var url = req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/" + est.id + "/commentaries/"+commentary.id;
                    res.setHeader("Location", url);
                    var links = [];
                    var link1 = {rel: 'self',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/commentaries/new"};
                    var link2 = {rel: 'update',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/commentaries"};
                    var link3 = {rel: 'delete',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/commentaries"};
                    var link4 = {rel: 'all',
                        href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/commentaries"};
                    links.push([link1,link2,link3,link4]);
                    var comm = {id: commentary.id, text: commentary.text, createdAt:commentary.createdAt,
                        User:{
                            name: user.name,
                            img: user.img
                        }};
                    res.status(201).send({Commentary: comm,links: links});
                });
            }).catch(function (err) {
                res.status(500).send({errors: handler.customServerError(err)});
            });
        }
    });
});

router.get('/:id/commentaries',middleware.numericalIdEstab, middleware.pagination,function(req, res) {
    var where = "", limit = 10, url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments"+req.params.id+"/commentaries",
        before = 0, prev = 'none', after = 0,next = 'none';
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" +req.params.id+"/commentaries"+"?after="+req.query.after+"?limit="+limit;
        where = {attributes: ['id', 'text', 'createdAt'], include: [{model: models.user, as: 'User', attributes: ['name', 'lname']
        }], limit: parseInt(limit), where:{id: {$gt: after}, establishmentId: req.params.id}};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" +req.params.id+"/commentaries"+ "?before="+req.query.before+"?limit="+limit;
        where = {attributes: ['id', 'text', 'createdAt'],include: [{model: models.user, as: 'User', attributes: ['name', 'lname']
        }], limit: parseInt(limit), where:{id: {$lt: before}, establishmentId: req.params.id}};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" +req.params.id+"/commentaries"+ "?limit="+limit;
        }
        where = {attributes: ['id', 'text', 'createdAt'],include: [{model: models.user, as: 'User', attributes: ['name', 'lname']
        }], limit: parseInt(limit), where:{id: {$gt: after}, establishmentId: req.params.id}};
    }
    before = 0;
    after = 0;
    models.establishment.find({where: {id: req.params.id}}).then(function(est){
        if(est===null){
            res.status(404).send({message:"The establishment was not found"});
        }
        else {
            models.commentary.findAndCountAll(where).then(function (comm) {
                if (comm.rows.length === 0) {
                    res.status(404).send({message: "There are no commentaries added yet"});
                } else {
                    models.commentary.findAndCountAll().then(function (total) {
                        if (comm.count > 0) {
                            //Check if there are after cursors
                            if (comm.rows.length < comm.count || comm.rows[comm.rows.length - 1].id < total.rows[total.rows.length - 1].id) {
                                after = new Buffer(comm.rows[comm.rows.length - 1].id.toString()).toString('base64');
                                next = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" +req.params.id + "/commentaries" + "?after=" + after + '&limit=' + limit;
                            }
                            models.commentary.min('id').then(function (min) {
                                //Check if there are before cursors
                                if (comm.rows[0].id > min) {
                                    before = new Buffer(comm.rows[0].id.toString()).toString('base64');
                                    prev = req.protocol + "://" + req.hostname + ":3000" + "/api/establishments/" +req.params.id + "/commentaries" + "?before=" + before + '&limit=' + limit;
                                }
                                var curs = {before: before, after: after};
                                var pag = {cursors: curs, previous: prev, next: next};
                                comm.count = total.count;
                                res.status(200).send({
                                    Commentaries: comm, paging: pag, links: {rel: 'self', href: url}
                                });
                            });
                        } else
                            res.status(404).send({message: "The are no commentaries added yet"});
                    });
                }
            });
        }
    });
});

router.post('/:id/votes/new', authController.isBearerAuthenticated,  middleware.numericalIdEstab, function(req, res) {
    var user = models.user.getAdminId(req.get('Authorization').slice('7'));
    models.establishment.find({where: {id: req.params.id}}).then(function(est){
        if(est === null){
            res.status(404).send({message: "The establishment was not found"});
        }else{
            sequelize.query("INSERT INTO votes (user,establishmentId) VALUES ('"+user+"',"+req.params.id+")",
            { type: sequelize.QueryTypes.INSERT}).then(function(result){
                var links = [];
                var link1 = {rel: 'self',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/votes/new"};
                var link4 = {rel: 'all',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/establishments/"+req.params.id+"/votes"};
                links.push([link1,link4]);
                var vote = {user: user, establishmentId: req.params.id};
                res.status(201).send({Vote: vote,links: links});
            }).catch(function (err) {
                res.status(500).send({errors: handler.customServerError(err)});
            });
        }
    });
});

router.get('/:location/suggestions', function(req, res){
    var suggestions = [];
    var loc = "";
    var placeAutocomplete = new PlaceAutocomplete("AIzaSyCUaBwVoJuCosYblfg7yM6v-twXweYOYqY", "json");
    var parameters = {
        input: req.params.location,
        types: '(cities)',
        language: 'es',
    };

    placeAutocomplete.placeAutocomplete(parameters, function (error, response) {
        if (error) throw error;

        for(var i=0;i<response.predictions.length;i++){
            var loc = response.predictions[i].description.split(", ");
            if(loc[1] === "España")
                suggestions.push(loc[0]);
        }
        res.status(200).send({locations:suggestions});
    });
});

router.get('/:id/sport/:sport/schedule', middleware.numericalIdEstab, middleware.numericalIdSport2, function(req,res){
    var where = {where: {establishmentId: req.params.id, sportId:req.params.sport}};
    models.course.findAndCountAll(where).then(function(courses){
        if(courses.rows.length === 0){
            res.status(404).send({message: 'There are no courses established yet'});
        }else{
            var ids = [];
            for(var i=0;i<courses.count;i++){
                ids.push(courses.rows[i].id);
            }
            models.schedule.findAndCountAll({where: {courseId: [(ids)]}, attributes: ['id','day','startTime',
                'endTime','courseId']}).then(function(schedule){
                if(schedule.rows.length === 0){
                    res.status(404).send({message: 'There is no schedule established yet'});
                }else{
                    res.status(200).send({Schedule: schedule});
                }
            });
        }
    });
});

module.exports = router;