const Joi = require('joi')

const userValidate = data =>{
    const UserSchema = Joi.object({
        // email :  Joi.string().email().lowercase().required(),
        username :  Joi.string().pattern(new RegExp('gmail.com')).email().lowercase().required(),
        password : Joi.string().min(4).max(32).required()
    })

    return UserSchema.validate(data)
}

module.exports = {
    userValidate
}