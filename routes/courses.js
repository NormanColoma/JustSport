/**
 * Created by Norman on 08/11/2015.
 */
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var user = require('../middlewares/checkUser');
var middleware = require('../middlewares/paramMiddleware');
var handler = require('../handlers/errorHandler');

router.post('/new', authController.isBearerAuthenticated, user.isEstabOwner, function(req, res) {
    if(models.user.isOwner(req.get('Authorization').slice('7'))){
        if (req.body.sportId && req.body.establishmentId && req.body.price) {
            models.course.create(req.body).then(function (course) {
                var url = req.protocol + "://" + req.hostname + ":" + global.port + "/api/courses/" + course.id;
                res.setHeader("Location", url);
                var links = new Array();
                var link1 = {
                    rel: 'self',
                    href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/courses/new"
                };
                var link2 = {
                    rel: 'update',
                    href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/courses/" + course.id
                };
                var link3 = {
                    rel: 'delete',
                    href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/courses/" + course.id
                };
                links.push([link1, link2, link3]);
                res.status(201).send({
                    id: course.id, sportId: course.sportId, establishmentId: course.establishmentId
                    , instructor: course.instructor, price: course.price, info: course.info, links: links
                });
            }).catch(function (err) {
                res.status(500).send({errors: handler.customServerError(err)});
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
                        var link2 = {rel: 'schedule',
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

router.get('/:id/schedule', middleware.numericalIdCourse, middleware.pagination, function(req,res){
    var where = "";
    var limit = 5;
    var url = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/"
        + req.params.id + "/schedule";
    var before = 0;
    var prev = 'none';
    var after = 0;
    var next = 'none';
    if(req.query.after){
        after = parseInt(new Buffer(req.query.after, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/"
            + req.params.id + "/schedule?after="+req.query.after+"?limit"+limit;
        where = {attributes: ['id', 'day', 'startTime', 'endTime'], limit: limit, where:{id: {$gt: after},courseId: req.params.id}};
    }else if(req.query.before){
        before = parseInt(new Buffer(req.query.before, 'base64').toString('ascii'));
        limit = req.query.limit;
        url = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/"
            + req.params.id + "/schedule?before="+req.query.before+"?limit"+limit;
        where = {attributes: ['id', 'day', 'startTime', 'endTime'], limit: limit, where:{id: {$lt: before},courseId: req.params.id}};
    }else{
        if(req.query.limit) {
            limit = req.query.limit;
            url = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/"
                + req.params.id + "/schedule?limit="+limit;
        }
        where = {attributes: ['id', 'day', 'startTime', 'endTime'], limit: limit, where:{courseId: req.params.id}};
    }
    before = 0;
    after = 0;
    models.course.findById(req.params.id).then(function(course){
        if(course){
            models.schedule.findAndCountAll(where).then(function(schedule){
                if(schedule.count > 0) {
                    course.getSchedule().then(function (total) {
                        //Check if there are after cursors
                        if (schedule.rows.length < schedule.count || schedule.rows[schedule.rows.length - 1].id < total[total.length - 1].id) {
                            after = new Buffer(schedule.rows[schedule.rows.length - 1].id.toString()).toString('base64');
                            next = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/" + req.params.id + "/schedule" +
                                "?after=" + after + '&limit=' + limit;
                        }
                        models.schedule.min('id').then(function (min) {
                            //Check if there are before cursors
                            if (schedule.rows[0].id > min) {
                                before = new Buffer(schedule.rows[0].id.toString()).toString('base64');
                                prev = req.protocol + "://" + req.hostname + ":3000" + "/api/courses/" + req.params.id +
                                    "/schedule?before=" + before + '&limit=' + limit;
                            }
                            var curs = {before: before, after: after};
                            var pag = {cursors: curs, previous: prev, next: next};
                            res.status(200).send({
                                Schedule: schedule, paging: pag, links: {rel: 'self', href: url}
                            });
                        })
                    })
                }else{
                    res.status(404).send({message: "There are no schedules for this course"});
                }
            });
        }
        else
            res.status(404).send({message: "The course was not found"});
    })
})

router.put('/:id', authController.isBearerAuthenticated, middleware.numericalIdCourse, user.isOwner,
    user.isEstabOwner2, function(req, res) {

    var values = req.body;
    var where = {where: {id: req.params.id}};
    models.course.update(values, where).then(function (updated) {
        if (updated > 0)
            res.status(204).send();
        else
            res.status(404).send({message: "The course was not found"});
    }).catch(function (err) {
        res.status(500).send({errors: handler.customServerError(err)});
    })
});

router.delete('/:id', authController.isBearerAuthenticated, middleware.numericalIdCourse, user.isOwner,
    user.isEstabOwner2, function(req, res) {
        models.course.destroy({where:{id: req.params.id}}).then(function (rows) {
            if (rows > 0)
                res.status(204).send();
            else
                res.status(404).send({message: "The course was not found"});
        }).catch(function (err) {
            res.status(500).send({errors: handler.customServerError(err)});
        })
});
module.exports = router;