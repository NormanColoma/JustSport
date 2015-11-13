/**
 * Created by Norman on 09/11/2015.
 */
var models  = require('../models/index');
var jwt = require('jwt-simple');


//For post a course
exports.isEstabOwner = function(req,res,next){
    var owner = jwt.decode(req.get('Authorization').slice('7'), global.secret).sub;
    models.establishment.findOne({where:{id:req.body.establishmentId, owner: owner}}).then(function(found){
        if(found)
            next();
        else
            res.status(403).send({message: "You are not authorized to perform this action"});
    })
};

//For delete or update a course
exports.isEstabOwner2 = function(req,res,next){
    var owner = jwt.decode(req.get('Authorization').slice('7'), global.secret).sub;
    var id = req.params.id || req.body.courseId;
    models.course.findById(id).then(function(course){
        if(course){
            models.establishment.findOne({where:{id:course.establishmentId, owner: owner}}).then(function(found){
                if(found)
                    next();
                else
                    res.status(403).send({message: "You are not authorized to perform this action"});
            })
        }
        else
            res.status(404).send({message: "The course was not found"});
    })
};

exports.isOwner = function(req,res,next){
    var decodedToken = jwt.decode(req.get('Authorization').slice('7'), global.secret);
    if(decodedToken.role === 'owner') {
        next()
    }
    else
        res.status(403).send({message: "You are not authorized to perform this action"});
}
