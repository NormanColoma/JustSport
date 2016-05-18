var models  = require('../models');
var express = require('express');
var router  = express.Router();
var authController = require('../routes/auth');
var handler = require('../handlers/errorHandler');
var middleware = require('../middlewares/paramMiddleware');
var bcrypt = require('bcrypt-nodejs');
var user_middleware = require('../middlewares/checkUser');
var dest = process.env.UPLOAD_USER_DEST || '../public/images/users';
var multer = require('multer');
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
//Set options for Multer.js
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage, limits: {fileSize:512000}}).single('user_profile');

router.put('/me/profile/image',  authController.isBearerAuthenticated, function(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.status(500).send({message: "File size is too long"});
        } else {
            if(req.file === undefined){
                res.status(404).send({message: "Image file was not found"});
            }
            else {
                if (req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png") {
                    models.user.find({where: {uuid: models.user.getAdminId(req.get('Authorization').slice('7'))}}).then(function (user) {
                        if (user.get("img") != "default.jpg")
                            fs.unlinkSync(dest + '/' + user.get("img"));
                        models.user.update({img: req.file.filename},{where: {uuid: models.user.getAdminId(req.get('Authorization').slice('7'))}}).then(function(result){
                            res.status(204).send();
                        });
                    });
                }
                else {
                    deleteFile(req.file.filename);
                    res.status(400).send({message: "File must be jpg/png type"});
                }
            }
        }
    });
});

function deleteFile(fileName){
    fs.unlinkSync(dest + '/' + fileName);
}


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

router.get('/:id',function(req, res) {
  models.user.findOne({where:{uuid: req.params.id}, attributes: ['uuid','name', 'lname','email','gender', 'role']}).then(function (user) {
      if (user === null)
        res.status(404).send({message: "User was not found"});
      else {
        res.status(200).send(user);
      }
    }).catch(function(err){
      res.status(500).send(err);
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

router.put('/:id', authController.isBearerAuthenticated, user_middleware.isSelfUser, function(req, res) {
    models.user.findOne({where:{uuid: req.params.id}}).then(function (user) {
        user.update({pass: req.body.pass}).then(function(){
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
