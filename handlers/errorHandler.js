/**
 * Created by Norman on 19/11/2015.
 */
exports.customServerError= function(err){
    var errors = [];
    var error="";
    var i=0;
    if (err.name == 'SequelizeValidationError'){
        for(i=0;i<err.errors.length;i++){
            if(err.errors[i].type == 'notNull Violation'){
                error = {type: "Missing field", field: err.errors[i].path ,message: err.errors[i].path+" cannot be null"};
            }else{
                error = {type: "Validation failed", field: err.errors[i].path, message: err.errors[i].message};
            }
            errors.push(error);
        }
    }else if(err.name == 'SequelizeUniqueConstraintError'){
        errors = [];
        for(i=0;i<err.errors.length;i++){
                error = {type: "Duplicated entry", field: err.errors[i].path, message: "The value: '"+err.errors[i].value+
                "' is already taken"};
        }
        errors.push(error);
    }else if(err.name == 'SequelizeForeignKeyConstraintError'){
        errors = [];
        error = {type: "Inexistent reference", field: err.index, message: "The reference you are trying to set, " +
            "does not exist in our database"};
        errors.push(error);
    }else if(err.name == 'SequelizeConnectionRefusedError'){
        errors = [];
        error = {type: "Database down", message: "Database is not running right now. Please try it back in few moments"};
        errors.push(error);
    }
    return errors;
};