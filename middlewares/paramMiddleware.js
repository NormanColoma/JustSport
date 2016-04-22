/**
 * Created by Norman on 09/11/2015.
 */

exports.numericalIdCourse= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the course is not a numerical id"});
    }
    else
        next();
};

exports.numericalIdSport= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the sport is not a numerical id"});
    }
    else
        next();
};

exports.numericalIdSport2= function(req,res,next){
    if (req.params.sport != parseInt(req.params.sport, 10)){
        res.status(400).send({message: "The supplied id that specifies the sport is not a numerical id"});
    }
    else
        next();
};


exports.numericalIdSchedule= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the schedule is not a numerical id"});
    }
    else
        next();
};
exports.numericalIdEstab= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the establishment is not a numerical id"});
    }
    else
        next();
};

exports.numericalIdCommentary= function(req,res,next){
    if (req.params.id != parseInt(req.params.id, 10)){
        res.status(400).send({message: "The supplied id that specifies the commentary is not a numerical id"});
    }
    else
        next();
};

exports.stringLocation = function(req,res,next){
    if (req.params.location == parseInt(req.params.location, 10)){
        res.status(400).send({message: "The supplied id that specifies the location is not a literal id"});
    }
    else
        next();
};

exports.pagination = function(req,res,next){
    if (req.query.after || req.query.before){
        /* jshint ignore:start */
        if(req.query.after == 0 || req.query.before == 0){
            res.status(404).send({message: 'There no more rows to retrieve'});
        }else{
            if(req.query.limit){
                if(req.query.limit != parseInt(req.query.limit, 10)){
                    res.status(400).send({message: 'Limit parameter must be numerical'});
                }else {
                    if (req.query.limit > 0)
                        next();
                    else
                        res.status(400).send({message: 'The limit for pagination, must be greater than 0'});
                }
            }
            else
                res.status(400).send({message: "Wrong parameters, limit parameter must be set for paging"});
        }
        /* jshint ignore:end */
    }
    else {
        if(req.query.limit){
            if(req.query.limit != parseInt(req.query.limit, 10)) {
                res.status(400).send({message: 'Limit parameter must be numerical'});
            }else{
                if(req.query.limit <= 0)
                    res.status(400).send({message: 'The limit for pagination, must be greater than 0'});
                else
                    next();
            }
        }else{
            next();
        }
    }
};