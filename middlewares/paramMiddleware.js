/**
 * Created by Norman on 09/11/2015.
 */

exports.numericalIdCourse= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the course is not a numercial id"});
    }
    else
        next();
}

exports.numericalIdSport= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the sport is not a numercial id"});
    }
    else
        next();
}

exports.numericalIdSchedule= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the schedule is not a numercial id"});
    }
    else
        next();
}

exports.stringLocation = function(req,res,next){
    if (req.params.location == parseInt(req.params.location, 10)){
        res.status(400).send({message: "The supplied id that specifies the location is not a literal id"});
    }
    else
        next();
}

exports.pagination = function(req,res,next){
    if (req.query.after || req.query.before){
        if(req.query.limit){
            if(req.query.limit > 0)
                next()
            else
                res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
        }
        else
            res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
    }
    else {
        if(req.query.limit){
            if(req.query.limit <= 0)
                res.status(400).send({message: 'The limit for pagination, must be greater than 0'})
            else
                next();
        }else{
            next();
        }
    }
}