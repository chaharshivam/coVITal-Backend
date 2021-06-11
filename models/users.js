const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type:String
    },
    email: {
        type: String,
        unique: true
    },
    password:{
        type: String,
        required: true,
        min: 5,
        max: 255

    },
    profilePicturePath: {
        type:String
    },
    userName:{
        type:String
    },
    country:{
        type:String
    },
    address:{
        type:String
    },
    state:{
        type:String
    },
    zip:{
        type: mongoose.Schema.Types.Number
    },
    accountCreatedOn: Date
})

userSchema.methods.generateAuthToken = function(){
    return jwt.sign({_id: this._id}, config.get("jwtPrivateKey"));
}

const User = mongoose.model('Users', userSchema);

function validateUser(user){
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName:Joi.string(),
        userName:Joi.string(),
        email: Joi.string().required().email(),
        password: Joi.string().min(5).max(255).required(),
        accountCreatedOn: Joi.date(),
        country:Joi.string(),
        address:Joi.string(),
        state:Joi.string(),
        zip:Joi.number()
    });
    return schema.validate(user,{allowUnknown:true});
}

exports.User = User;
exports.validateUser = validateUser;
