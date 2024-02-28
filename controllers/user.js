"use strict";

//
var User = require("../models/user");
var Follow = require("../models/follow"); 

var saltRounds = 10;
var bcrypt = require("bcrypt");
var jwt = require('../services/jwt'); 
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs'); 
var path = require('path'); 


// test methods
function home(req, res) {
  res.status(200).send({
    message: "Welcome to toefl para todos app",
  });
}
function pruebas(req, res) {
  res.status(200).send({
    message: "Accion de pruebas en el servidor de nodejs",
  });
}
// register-user method
function saveUser(req, res) {
  var params = req.body;
  var user = new User();

  if (
    params.name &&
    params.lastname &&
    params.nickname &&
    params.email &&
    params.password
  ) {
    user.name = params.name;
    user.lastname = params.lastname;
    user.nickname = params.nickname;
    user.email = params.email;
    user.role = 1;
    user.profile_picture = null;

    User.find({
      $or: [
        { email: user.email.toLowerCase() },
        { nickname: user.nickname.toLowerCase() },
      ],
    })
      .then(function (users) {
        if (users.length > 0) {
          console.log("el nombre de usuario o correo ya esta registrado");
          return res.status(200).send({ message: "el usuario ya se encuentra registrado" });
        } else {
         
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(params.password, salt, function (err, hash) {
              user.password = hash;
              user.save().then(() => {
                  console.log(
                    "Message has been saved successfully in the database"
                  );
                  console.log(user);
                  res.sendStatus(200);
                })
                .catch((err) => {
                  console.log("Sending 500 status code", err);
                  res.sendStatus(500);
                });
            });
          });
        }
      })//acaba primer then
      .catch(function (err) {
        console.log(err);
      });
  } else {
    res.status(200).send({
      message: "envia todos los campos necesaios",
    });
  }
}

// login-user method
function loginUser(req, res){
    var params = req.body; 
    var email = params.email; 
    var password = params.password; 

    User.findOne({email:email}).then(function(user){
        if(user){
            bcrypt.compare(password, user.password, (err,check) =>{
                console.log(password); 
                console.log(user.password); 
                if(check){
                  
                    if(params.gettoken){
                        // devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                        // generar token
                    }else{
                      //return user data
                      user.password = undefined; // borrar del registro que se retorna la password del usuario por seguridad
                      return res.status(200).send({user}); 
                    }
                  
                }else{
                    console.log(err); 
                    return res.status(404).send({message:'La contraseña proporcionada es incorrecta'})
                }
            })
        }else{
            console.log('El usuario no se ha podido identificar---'); 
            return res.status(500).send({message:'El usuario o correo proporcionado no esta registrado'}); 
        }
    })//acaba primer then
    .catch(function (err) {
        console.log('error al conectar con la base de datos : ' ,err);
      });
}

// get user-data

function getUser(req, res){
    var userId = req.params.id; 

    User.findById(userId).then(function(user) {
       
        if(!user) return res.status(404).send({message:'El usuario no existe'}); 

        followThisUser(req.user.sub, userId).then((value) =>{
            user.password = undefined; 
            return res.status(200).send({user,
                following: value.this_following,
                follower: value.this_follower
            }); 
        })
 
    }).catch(function(err){
        console.log('error al conectar con la base de datos : ' ,err);
    }); 
}

async function followThisUser(identity_user_id, user_id){

        var following =  await Follow.findOne({"user_following": identity_user_id, "user_followed": user_id }).then(function(follow){
            return follow; 
        }).catch(function(err){
            console.log('error al conectar con la base de datos : ' ,err);
        }); 

        var follower = await Follow.findOne({"user_following": user_id, "user_followed": identity_user_id }).then(function(follow){
            return follow; 
        }).catch(function(err){
            console.log('error al conectar con la base de datos : ' ,err);
        }); 

        return{
           this_following : following,
           this_follower: follower
        }
}

// return a paginated list of users

function getUsers(req, res){

    var identity_user_id = req.user.sub;  
    var page = 1; 
    if(req.params.page){
        page = req.params.page; 
    }

    var itemsPerPage = 5; 

     User.find().sort('_id').limit(itemsPerPage).then(users => {
        User.countDocuments().then(total => {
            if(!users){
                return res.status(404).send({message:'No hay usuarios disponibles'}); 
            }
            followUserIds(identity_user_id).then((value)=>{
                return res.status(200).json({
                    users,
                    users_following: value.this_following, 
                    users_followers: value.this_follower,
                    total,
                    pages: Math.ceil(total/itemsPerPage)
                });

            }); 


        });
     }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion'});
     });
    }


// 
async function followUserIds(user_id){
    var following = await Follow.find({'user_following': user_id}).select({'_id':0, '_v':0, 'user_following':0}).then(function(follows){
       console.log(follows);
       var follows_clean= [];
       follows.forEach((follow)=>{
           follows_clean.push(follow.user_followed); 
       }); 
       return follows_clean; 
    }); 

    var follower = await Follow.find({'user_followed': user_id}).select({'_id':0, '_v':0, 'user_followed':0}).then(function(follows){
        console.log(follows);
         var follows_clean= [];
         follows.forEach((follow)=>{
         follows_clean.push(follow.user_following); 
         }); 
         return follows_clean; 
    }); 

    return {
        this_following : following,
        this_follower: follower
    }
}

// UpdateUser


function updateUser(req, res){
    var userId = req.params.id; 

    var update = req.body; 
    console.log(update);
    // borrar la propiedad password

    delete update.password; 
    console.log(update);

    if (userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para actualizar los datos de este usuario'}); 
    }
    console.log(update);
    User.findByIdAndUpdate(userId, update, {new:true}).then(function(userUpdated){
        if(!userUpdated) return res.status(404).send({message:'Error en la actualizacion del usuario'}); 

        return res.status(200).send({user:userUpdated});
    }).catch(error =>{
        return res.status(500).send({message:'Error en la peticion'});
     });
}

// subir archivos de imagen de usuario
function uploadImage(req, res){
    var userId = req.params.id; 

   

    if(req.files){
        var file_path = req.files.image.path; 
        var file_split = file_path.split('\\'); 
        var file_name = file_split[2]; 
        var ext_split = file_name.split('\.'); 
        var file_ext = ext_split[1]; 

        if (userId != req.user.sub){
           return  removeUploadedFiles(res,file_path,'No tienes permisos para subir una foto de perfil para este usuario');
        }

        if(file_ext == 'png' || file_ext == 'jpg'|| file_ext == 'jpeg' || file_ext == 'gif' ){
            // actualizar imagen de usuario
            User.findByIdAndUpdate(userId,{profile_picture:file_name},{new: true}).then(function(userUpdated){
                if(!userUpdated) return res.status(404).send({message:'Error en la actualizacion del usuario'}); 
        
                return res.status(200).send({user:userUpdated});
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
    var image_file = req.params.imageFile; 
    var path_file = './uploads/users/'+image_file;
    
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

function getCounters(req, res){

    var userId = req.user.sub; 

        if(req.params.id){
            userId = req.params.id; 
        }
      
            getCountFollow(userId).then((value)=> {
                return res.status(200).send(value); 
            }); 
        
}


async function getCountFollow(user_id){
    var following = await Follow.countDocuments({user_following: user_id}).then(total_following => {
        if(!total_following){console.log('error al conectar con la base de datos : '); }
        console.log(total_following); 
        return total_following; 
        
    }).catch(function(err){
        console.log('error al conectar con la base de datos : ' ,err);
    }); 


    var followers = await Follow.countDocuments({user_followed: user_id}).then(total_followers => {
        if(!total_followers) {return console.log('error al conectar con la base de datos : '); }

        return total_followers; 
        
    }).catch(function(err){
        console.log('error al conectar con la base de datos : ' ,err);
    }); 

    return {
        this_following: following,
        this_followers: followers
    }

}


module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  getImageFile,
  getCounters
};
