"use strict";
//dependencias
var path = require("path");
var fs = require("fs");
var moment = require("moment");
var mongoosePaginate = require("mongoose-pagination");
//Modelos
var Post = require("../models/post");
var User = require("../models/user");
var Follow = require("../models/follow");

function probando(req, res) {
    res.status(200).send({ message: "Hola desde controlador de publicaiones" });
}

function savePost(req, res) {
    var params = req.body;

    if (!params.description)
        return res.status(200).send({
            message: "Debes de dar una descripcion de la nueva publicacion",
        });
    var post = new Post();

    post.description_post = params.description;
    post.text = params.text;
    post.media = null;
    post.user = req.user.sub;
    post.created_at = moment().unix();

    post
        .save()
        .then(function (postStored) {
            if (!postStored)
                return res.status(4040).send({ message: " Error interno" });

            return res.status(200).send({ postStored });
        })
        .catch(function (err) {
            res.status(500).send({
                message: "Error al subir tu publicacion, intentalo mas tarde",
            });
        });
}

function getPosts(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user_following: req.user.sub }).populate('user_followed').then(follows => {
        //  console.log(follows); 
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.user_followed);
        });
        follows_clean.push(req.user.sub);
        // console.log(follows_clean); 
        Post.find({ user: { "$in": follows_clean } }).sort('created_at').limit(itemsPerPage).populate('user').then(posts => {

            if (!posts) return res.status(404).send({ message: 'No hay publicaciones' });
            Post.find({ user: { "$in": follows_clean } }).sort('created_at').limit(itemsPerPage).populate('user').countDocuments().then(total => {
                if (!total) return res.status(404).send({ message: 'No hay cantidad de  publicaciones' });
            

                return res.status(200).send({
                    page: page,
                    total: total,
                    items_per_page: itemsPerPage,
                    posts
                });

            }).catch(function (err) {
                res.status(404).send({ message: 'error en conteo de posts' });
            });


        }).catch(function (err) {
            res.status(404).send({ message: 'error en obtencion de posts' });
        });

    }).catch(function (err) {
        res.status(404).send({ message: 'error al obtener usuarios que sigues' });
    });
}

function getPost(req, res){

    var postId = req.params.id; 
    Post.findById(postId).then(function(post){

        if(!post) return res.status(404).send({message:'No existe la publicacion con el id proporcionado'}); 

        return res.status(200).send({post}); 


    }).catch(function(err){
        res.status(500).send({message:'Error en conseguir la publicacion especificada',err})
    }); 

}

function deletePost(req, res){
    var postId = req.params.id; 
    Post.find({user:req.user.sub,"_id":postId}).deleteOne().then(deletedPost=>{
        console.log(deletedPost);
         if(!deletedPost) return res.status.send('Esta publicacion no es tuya, no puedes eliminarla'); 
        return res.status(200).send({post: deletedPost}); 

    }).catch(function(err){
        return res.status(500).send({message:'Error al eliminar publicacion'});
    }); 
}

//Manejo de imagenes 

function uploadImage(req, res){
    var postId = req.params.id; 

   

    if(req.files){
        var file_path = req.files.image.path; 
        var file_split = file_path.split('\\'); 
        var file_name = file_split[2]; 
        var ext_split = file_name.split('\.'); 
        var file_ext = ext_split[1]; 

        if(file_ext == 'png' || file_ext == 'jpg'|| file_ext == 'jpeg' || file_ext == 'gif' ){
            // actualizar imagen de usuario

            Post.findOne({'user': req.user.sub, '_id': postId}).exec().then(post =>{

                if (post){
                    console.log(post,req.user.sub); 
                    Post.findByIdAndUpdate(postId,{media:file_name},{new: true}).then(function(postUpdated){
                        if(!postUpdated) return res.status(404).send({message:'Error en la actualizacion de la publicacion'}); 
                
                        return res.status(200).send({post:postUpdated});
                    }).catch(error =>{
                        return res.status(500).send({message:'Error de permisos',error});
                     });
                    
                }else{
                    return  removeUploadedFiles(res,file_path,'no tienes permisos para subir media en esta publicacion'); 
                }
                    
            }).catch(error =>{
                return res.status(500).send({message:'Error en la peticion'});
             });

        }else{
          return  removeUploadedFiles(res,file_path,'La extension no es valida'); 
        }
        
        
        
    }else{
        res.status(200).send({message:'No se ha subido una imagen'}); 
    }

}

function removeUploadedFiles(res,file_path,message){
    fs.unlink(file_path, (err) =>{
        return res.status(200).send({message:message});
   });
}

function getImageFile(req, res){
    var image_file = req.params.mediaFile; 
    var path_file = './uploads/post/'+image_file;
    
      var existe =  async function fileExists(path_file){
            try{
                await fs.promises.access(path_file, exists); 
                if(exists){
                    console.log('entro'); 
                    return true; 
                } 
            }catch (err){
                if(err.code === 'ENOENT'){
                    return false;
                } else {
                    res.status(200).send({message:'No existe la imagen...'}); 
                    throw err; 
                }
            }
           
        }
        if(existe){
            console.log(path_file); 
            res.sendFile(path.resolve(path_file)); 
        }

}
// Manejo de imagenes

module.exports = {
    probando,
    savePost,
    getPosts,
    getPost,
    deletePost,
    uploadImage,
    getImageFile
};
