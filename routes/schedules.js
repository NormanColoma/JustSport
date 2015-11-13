/**
 * Created by Norman on 13/11/2015.
 */
/**
 * Created by Norman on 08/11/2015.
 */
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var user = require('../middlewares/checkUser');
var middleware = require('../middlewares/paramMiddleware');

router.post('/new', authController.isBearerAuthenticated, user.isEstabOwner2, function(req, res) {
    if (req.body.day && req.body.startTime && req.body.endTime && req.body.courseId) {
        models.schedule.create(req.body).then(function (schedule) {
            var url = req.protocol + "://" + req.hostname + ":" + global.port + "/api/schedules/" + schedule.id;
            res.setHeader("Location", url);
            var links = new Array();
            var link1 = {
                rel: 'self',
                href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/schedules/new"
            };
            var link2 = {
                rel: 'update',
                href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/schedules/" + schedule.id
            };
            var link3 = {
                rel: 'delete',
                href: req.protocol + "://" + req.hostname + ":" + global.port + "/api/schedules/" + schedule.id
            };
            links.push([link1, link2, link3]);
            res.status(201).send({
                id: schedule.id, day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime,
                courseId: schedule.courseId, links: links
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        })

    }
    else
        res.status(400).send({message: "Json is malformed, it must include the following fields: day,startTime, endTime, courseId"});

});

router.put('/:id', authController.isBearerAuthenticated, middleware.numericalIdSchedule, user.isEstabOwner2, function(req, res) {
    if(req.body.courseId) {
        var values = req.body;
        var where = {where: {id: req.params.id, courseId: req.body.courseId}};
        models.schedule.update(values, where).then(function (updated) {
            if (updated > 0)
                res.status(204).send();
            else
                res.status(404).send({message: "The schedule was not found"});
        }).catch(function (err) {
            res.status(500).send(err);
        })
    }
    else
        res.status(400).send({message: "Json is malformed: courseId field is required for updatings"});
});

module.exports = router;