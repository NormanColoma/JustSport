/**
 * Created by Norman on 05/11/2015.
 */
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var jwt = require('jwt-simple');

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