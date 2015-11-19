/**
 * Created by Norman on 19/11/2015.
 */
exports.customServerError= function(err){
    if (err.name == 'SequelizeValidationError'){
        var errors = new Array();
        for(var i=0;i<err.errors.length;i++){
            if(err.errors[i].type == 'notNull Violation'){
                var error = {type: "Missing field", field: err.errors[i].path ,message: err.errors[i].path+" cannot be null"};
            }else{
                var error = {type: "Validation failed", field: err.errors[i].path, message: err.errors[i].message};
            }
            errors.push(error);
        }
        return errors;
    }else if(err.name == 'SequelizeUniqueConstraintError'){
        var errors = new Array();
        for(var i=0;i<err.errors.length;i++){
                var error = {type: "Duplicated entry", field: err.errors[i].path, message: "The value: '"+err.errors[i].value+
                "' is already taken"};
        }
        errors.push(error);
        return errors;
    }
}