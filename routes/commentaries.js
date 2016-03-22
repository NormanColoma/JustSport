/**
 * Created by Norman on 22/03/2016.
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
//Set this to use raw queries
var Sequelize = require('sequelize');
var env       = process.env.NODE_ENV  || 'test';
var config    = require('../config/config.json')[env];

router.put('/:id', authController.isBearerAuthenticated, middleware.numericalIdCommentary, user.isCommentaryOwner, function(req, res) {
    var values = req.body;
    var user = models.user.getAdminId(req.get('Authorization').slice('7'));
    var where = {where: {id: req.params.id, user: user}};

    models.commentary.update(values, where).then(function (updated) {
        if (updated > 0)
            res.status(204).send();
        else
            res.status(404).send({message: "The commentary was not found"});
    }).catch(function (err) {
        res.status(500).send({errors: handler.customServerError(err)});
    });
});

router.delete('/:id', authController.isBearerAuthenticated, middleware.numericalIdCommentary, user.isCommentaryOwner, function(req, res) {
    models.commentary.destroy({
        where: {
            id: req.params.id,
            user: jwt.decode(req.get('Authorization').slice('7'), global.secret).sub
        }
    }).then(function (rows) {
        if (rows > 0)
            res.status(204).send();
        else
            res.status(404).send({message: "The establishment was not found"});
    }).catch(function (err) {
        res.status(500).send({errors: handler.customServerError(err)});
    });
});

module.exports = router;