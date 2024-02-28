'use strict'

var express = require('express'); 
var PostController = require('../controllers/post'); 
var api = express.Router(); 
var md_auth = require('../middlewares/authentication'); 
var multipart = require('connect-multiparty'); 
var md_upload = multipart({uploadDir: './uploads/post'}); 

api.get('/probando-publication', md_auth.ensureAuth, PostController.probando); 
api.post('/create-post', md_auth.ensureAuth, PostController.savePost); // cuando se da de alta algo se utiliza post
api.get('/get-posts/:page?', md_auth.ensureAuth, PostController.getPosts); 
api.get('/get-post/:id',md_auth.ensureAuth, PostController.getPost); 
api.delete('/delete-post/:id',md_auth.ensureAuth, PostController.deletePost); 
api.post('/upload-media-post/:id',[md_auth.ensureAuth,md_upload],PostController.uploadImage); 
api.get('/get-media-post/:mediaFile', PostController.getImageFile); 
module.exports = api;
