'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800; 
// conexion a la base de datos
mongoose.Promise = global.Promise; 
mongoose.connect('mongodb+srv://admin:b5HwExfxsn8RsC2K@toefldb.sckc8ko.mongodb.net/toefl_project').then(()=>{
    console.log('conexion exitosa a la base de datos toefl_project'); 

    //crear servidor
    app.listen(port, ()=>{
        console.log('servidor corriendo en : http://localhost:3800'); 
    });
})
.catch(err => console.log(err));