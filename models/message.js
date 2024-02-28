'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema; 

var MessageSchema = Schema({
    text: String, 
    sentAt: String, 
    emiter: {type: Schema.ObjectId, ref: 'user'}, 
    receiver: {type: Schema.ObjectId, ref: 'user'}
    
}); 

module.exports = mongoose.model('message', MessageSchema ); 