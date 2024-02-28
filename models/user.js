'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema; 

var UserSchema = Schema({
    name: String, 
    lastname: String, 
    nickname: String, 
    email: String, 
    password: String, 
    role: Number, 
    profile_picture: String
}); 

module.exports = mongoose.model('user', UserSchema); 