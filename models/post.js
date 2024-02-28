'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema; 

var PostSchema = Schema({
   description_post: String, 
   text: String, 
   media: String,
   created_at: String, 
   user: {type: Schema.ObjectId, ref: 'user' } 
}); 

module.exports = mongoose.model('post', PostSchema); 