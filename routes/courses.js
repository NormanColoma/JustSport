/**
 * Created by Norman on 08/11/2015.
 */
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');

router.post('/new', authController.isBearerAuthenticated, function(req, res) {
    if(models.user.isOwner(req.get('Authorization').slice('7'))){
        if (req.body.sportId && req.body.establishmentId && req.body.price) {
            models.course.create(req.body).then(function (course) {
                var url = req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/" + course.id;
                res.setHeader("Location", url);
                var links = new Array();
                var link1 = {rel: 'self',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/new"};
                var link2 = {rel: 'update',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/"+course.id};
                var link3 = {rel: 'delete',
                    href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/"+course.id};
                links.push([link1,link2,link3]);
                res.status(201).send({id: course.id, sportId: course.sportId, establishmentId: course.establishmentId
                    ,instructor: course.instructor,price: course.price, info: course.info,links: links});
            }).catch(function (err) {
                res.status(500).send(err);
            })
        }
        else
            res.status(400).send({message: "Json is malformed, it must include the following fields: establishmentId," +
            "sportId, instructor(optional), price, info(optional)"});
    }
    else
        res.status(403).send({message: "You are not authorized to perform this action"});

});

module.exports = router;