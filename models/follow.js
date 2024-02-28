'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var FollowSchema = Schema({
  created_at: String,
  user_following: {type: Schema.ObjectId, ref: 'user'}, 
  user_followed: {type: Schema.ObjectId, ref: 'user'}
}); 

module.exports = mongoose.model('follow', FollowSchema); 