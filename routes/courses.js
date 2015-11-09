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

router.get('/:id',function(req, res) {
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: 'The supplied id that specifies the course is not a numercial id'});
    }
    else {
        models.course.findById(req.params.id).then(function(course){
            if(course == undefined)
                res.status(404).send({message: 'The course was not found'});
            else {
                course.getEstablishment({attributes: ['id', 'name', 'desc', 'city', 'province',
                    'addr', 'phone', 'website', 'main_img','owner']}).then(function(est){
                    course.getSport({attributes: ['id', 'name']}).then(function(sport){
                        var links = new Array();
                        var link1 = {rel: 'self',href:req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/"+req.params.id};
                        var link2 = {rel: 'sports',
                            href: req.protocol + "://" + req.hostname + ":"+global.port + "/api/courses/"+req.params.id+"/schedule"};
                        links.push([link1,link2]);
                        var cour = {id: course.id, Sport: sport, Establishment: est, instructor: course.instructor,
                        price: course.price, info: course.info, links: links};
                        res.status(200).send(cour);
                    })
                })
            }
        })
    }
});
module.exports = router;