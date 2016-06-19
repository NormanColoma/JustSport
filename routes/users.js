var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var handler = require('../handlers/errorHandler');
var middleware = require('../middlewares/paramMiddleware');
var cloudinary = require('cloudinary');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var bcrypt = require('bcrypt-nodejs');
var user_middleware = require('../middlewares/checkUser');
var dest = process.env.UPLOAD_USER_DEST || './public/images/users';
var fs = require('fs');
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

cloudinary.config({
    cloud_name: 'hgu1piqd2',
    api_key: '235926947113524',
    api_secret: '1RMIA5DVuAF8ii9er3hX71flbCk'
});


router.put('/me/profile/image',  authController.isBearerAuthenticated, multipartMiddleware, function(req, res) {
    if (req.files.size > 512000) {
        res.status(500).send({message: "File size is too long. It cant not be greater than 512 Kb."});
    }else{
        cloudinary.uploader.upload(
            req.files.user_profile.path,
            function(result) {
                var url = result.secure_url;
                var img = result.secure_url;
                models.user.find({where: {uuid: models.user.getAdminId(req.get('Authorization').slice('7'))}}).then(function (user) {
                    models.user.update({img: img},{where: {uuid: models.user.getAdminId(req.get('Authorization').slice('7'))}}).then(function(result){
                        res.send({img_url: url});
                    });
                });
            },{width: 260, height: 230}
        );
    }
});

router.post('/new', function(req, res) {
  models.user.create(req.body).then(function (user) {
    models.user.findOne({where:{uuid: user.uuid}, attributes: ['uuid','name', 'lname','email','gender', 'role']}).then(function(user){
      var url = req.protocol + "://" + req.hostname +":"+ global.port + "/api/users/" + user.uuid;
      res.setHeader("Location", url);
      res.status(201).send(user);
    });
  }).catch(function (err){
    res.status(500).send({errors: handler.customServerError(err)});
  });
});

router.delete('/:id', authController.isBearerAuthenticated, function(req, res) {
    if(models.user.selfUser(req.get('Authorization').slice('7'), req.params.id)) {
        models.user.destroy({
            where: {
                uuid: req.params.id
            }
        }).then(function (rows) {
            if (rows > 0) {
                res.status(204).send();
            }
            else
                res.status(404).send({message: "User was not found"});
        }).catch(function (err) {
            res.status(500).send(err);
        });
    }
    else {
        res.status(403).send({message: "You are not authorized to perform this action"});
    }
});

router.get('/:id',function(req, res) {
  models.user.findOne({where:{uuid: req.params.id}, attributes: ['uuid','name', 'lname','email','gender', 'role', 'img']}).then(function (user) {
      if (user === null)
        res.status(404).send({message: "User was not found"});
      else {
        res.status(200).send(user);
      }
    }).catch(function(err){
      res.status(500).send(err);
    });
});

router.put('/:id', authController.isBearerAuthenticated, user_middleware.isSelfUser, function(req, res) {
    models.user.findOne({where:{uuid: req.params.id}}).then(function (user) {
        user.update({pass: req.body.pass, gender: req.body.gender, role:req.body.role}).then(function(){
            sequelize.query("UPDATE users SET pass = '"+bcrypt.hashSync(req.body.pass)+"' WHERE uuid = '"+req.params.id+"'",
                { type: sequelize.QueryTypes.UPDATE}).then(function () {
                res.status(204).send();
            }).catch(function (err) {
                res.status(500).send({errors: handler.customServerError(err)});
            });
        }).catch(function (err) {
            res.status(500).send({errors: handler.customServerError(err)});
        });
    });
});

module.exports = router;
