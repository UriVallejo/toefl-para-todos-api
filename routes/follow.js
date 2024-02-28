'use strict'

var express = require('express'); 
var FollowController = require('../controllers/follow'); 
var api = express.Router(); 

var md_auth = require('../middlewares/authentication'); 

api.get('/pruebas-follow', md_auth.ensureAuth, FollowController.prueba); 
api.post('/follow',md_auth.ensureAuth,FollowController.saveFolow); 
api.delete('/follow/:id',md_auth.ensureAuth,FollowController.deleteFollow); 
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers); 
api.get('/followers/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowers); 
api.get('/my-follows/:id?',md_auth.ensureAuth,FollowController.getMyFollows); // separado en dos metodos, no recibe parametro 
api.get('/my-followers/:id?',md_auth.ensureAuth,FollowController.getFollowers); // de si es follows o followers 


module.exports = api; 