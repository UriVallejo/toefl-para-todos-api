'use strict'

// var path = require('path'); 
// var fs = require('fs'); 
var mongoosePaginate = require ('mongoose-pagination'); 


var User = require ('../models/user'); 
var Follow = require('../models/follow'); 

function prueba (req, res){
    res.status(200).send({message:'Funcion de prueba de controlador de follows'}); 
}


function saveFolow(req,res){
    var params = req.body; 
    var follow = new Follow(); 

    follow.user_following = req.user.sub; 
    follow.user_followed = params.followed;
    
    follow.save().then(function(followStored){
        if(!followStored) return res.status(404).send({message:'El seguimiento no se ha guardado'}); 

        return res.status(200).send({follow:followStored}); 
    }).catch(function(err){
        return res.send(500).send({message:'Error al registrar la accion de seguiimiento'}); 
    }); 
}

function deleteFollow(req, res){
    var userId = req.user.sub; 
    var followId = req.params.id; 

    Follow.find({'user_following':userId, 'user_followed': followId}).deleteOne().then(function(){
        return res.status(200).send({message:'El follow se ha eliminado correctamente'}); 
    }).catch(function(err){
        return res.status(500).send({message:'Error al dejar de seguir'});
    }); 
}

function getFollowingUsers(req, res){
    var userId = req.user.sub; 

    if(req.params.id){
        userId = req.params.id; 
    }
    var page = 1; 
    if(req.params.page){
        page = req.params.page; 
    }
    var itemsPerPage = 4; 
    Follow.find({user_following:userId}).populate({path:'user_followed'}).sort('_id').limit(itemsPerPage).then(follows => {
        Follow.find({user_following:userId}).countDocuments().then(total => {
            if(!follows){
                return res.status(404).send({message:'No hay usuarios disponibles'}); 
            }
            return res.status(200).json({
                follows,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
     }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion'});
     });
}

function getFollowers(req, res){
    var userId = req.user.sub; 

    if(req.params.id ){
        userId = req.params.id; 
    }
    var page = 1; 
    if(req.params.page){
        page = req.params.page; 
    }
    var itemsPerPage = 4; 
    Follow.find({user_followed:userId}).populate('user_following').sort('_id').limit(itemsPerPage).then(followers => {
        Follow.find({user_followed:userId}).countDocuments().then(total => {
            console.log(total); 
            if(!followers){
                return res.status(404).send({message:'No te sigue ningun usuario'}); 
            }
            return res.status(200).json({
                followers,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
     }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion'});
     });

}
// no pagination
function getMyFollows(req, res){
     var userId = req.user.sub; 

     Follow.find({user_following:userId}).populate({path:'user_followed'}).then(follows => {
            if(!follows){
                return res.status(404).send({message:'No sigues a ningun usuario'}); 
            }
            return res.status(200).send({follows}); 
        
     }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion',error});
     });

}

function getMyFollowers(req, res){
    var userId = req.user.sub; 
    Follow.find({user_followed:userId}).populate('user_following').then(followers => {
       
            if(!followers){
                return res.status(404).send({message:'No te sigue ningun usuario'}); 
            }
            return res.status(200).send({followers}); 
     }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion',error});
     });
}

module.exports = {
    prueba,
    saveFolow,
    deleteFollow,
    getFollowingUsers,
    getFollowers,
    getMyFollowers,
    getMyFollows
}