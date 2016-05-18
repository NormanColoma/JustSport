/**
 * Created by Norman on 09/11/2015.
 */
var models  = require('../models/index');
var jwt = require('jwt-simple');


//For post a course
exports.isEstabOwner = function(req,res,next){
    var owner = jwt.decode(req.get('Authorization').slice('7'), global.secret).sub;
    var id = req.params.id || req.body.establishmentId;
    models.establishment.findOne({where:{id:id}}).then(function(found){
        if(found){
            if(owner == found.owner)
                next();
            else
                res.status(403).send({message: "You are not authorized to perform this action"});
        }
        else
            res.status(404).send({message: "The establishment was not found"});
    });
};

//For delete or update a course
exports.isEstabOwner2 = function(req,res,next){
    var owner = jwt.decode(req.get('Authorization').slice('7'), global.secret).sub;
    var id = req.params.id || req.body.courseId;
    if(req.params.id && req.body.courseId) {
        id = req.body.courseId;
    }
    models.course.findById(id).then(function(course){
        if(course){
            models.establishment.findOne({where:{id:course.establishmentId, owner: owner}}).then(function(found){
                if(found)
                    next();
                else
                    res.status(403).send({message: "You are not authorized to perform this action"});
            });
        }
        else
            res.status(404).send({message: "The course was not found"});
    });
};

exports.isCommentaryOwner = function(req,res,next){
    var user = jwt.decode(req.get('Authorization').slice('7'), global.secret).sub;
    var id = req.params.id;
    models.commentary.findOne({where:{id:id}}).then(function(found){
        if(found){
            if(user == found.user)
                next();
            else
                res.status(403).send({message: "You are not authorized to perform this action"});
        }
        else
            res.status(404).send({message: "The commentary was not found"});
    });
};

exports.isOwner = function(req,res,next){
    var decodedToken = jwt.decode(req.get('Authorization').slice('7'), global.secret);
    if(decodedToken.role === 'owner') {
        next();
    }
    else
        res.status(403).send({message: "You are not authorized to perform this action"});
};

exports.isSelfUser = function(req,res,next){
    models.user.findOne({where:{uuid: req.params.id}}).then(function (user) {
        if(user){
            if (models.user.selfUser(req.get('Authorization').slice('7'), req.params.id)) {
                next();
            } else {
                res.status(403).send({message: "You are not authorized to perform this action"});
            }
        }else{
            res.status(404).send({message: "User was not found"});
        }

    });
}
