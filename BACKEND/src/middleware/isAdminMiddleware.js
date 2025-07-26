const User = require('../models/user');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')

const isAdminMiddleware = async (req, res, next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token doesn't exist");            
        }

        const payload =  jwt.verify(token, process.env.JWT_KEY);
        const {_id} = payload;
        if(!_id){
            throw new Error("Invalid token");
        }
        if(payload.role != 'admin'){
            throw new Error("Not Admin.")
        }

        const result = await User.findById(_id);
        if(!result){
            throw new Error("User doesn't exist");
        }

        //Checking if token is blocked
        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked){
            throw new Error("Invalid token");
        }
        req.result = result;
        next();

    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}
module.exports = isAdminMiddleware;