/**
 * Created by Norman on 26/10/2015.
 */

var models  = require('../models');
var express = require('express');
var router  = express.Router();


router.get('/:user_id', function(req, res) {
    models.client.find({where:{userId: req.params.user_id}}).then(function (clients) {
        res.status(200).send(clients);
    }).catch(function(err){
        res.status(500).send(err);
    });
});

router.post('/new', function(req, res) {
    if(req.body.name && req.body.userId) {
        models.client.create({
            name: req.body.name,
            userId: req.body.userId
        }).then(function (client) {
            var url = req.protocol + "://" + req.hostname + ":3000" + "/api/client/" + client.id;
            res.setHeader("Location", url);
            res.status(201).send(client);
        }).catch(function(err){
            res.status(500).send(err);
        });
    }
    else
        res.status(400).send({message: "Json is malformed: application name, and userId is required"});
});

module.exports = router;