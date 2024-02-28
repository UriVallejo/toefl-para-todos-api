"use strict";

var jwt = require("jwt-simple");
var moment = require("moment");
var secret = 'Toefl_Para_Todos_Modular'; 
exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        name: user.name,
        lastname: user.lastname,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix,
    };
    return jwt.encode(payload,secret); 
};
