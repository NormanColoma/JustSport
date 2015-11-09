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