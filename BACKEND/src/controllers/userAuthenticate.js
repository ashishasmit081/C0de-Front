const redisClient = require('../config/redis');
const User = require('../models/user');
const Submission = require('../models/submission');

const validateFunction = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res)=>{
    try{
        //Apply API level validation
        validateFunction(req.body);
        const {firstName, emailID, password} = req.body;
        // hasing password
        req.body.password = await bcrypt.hash(password, 12);
        req.body.role = "user"; //no-one can register as admin on their own

        const user = await User.create(req.body);

        //creating JWT token with randomly generated key (crypto library)
        const token = jwt.sign({_id:user._id, emailID: emailID, role:'user'}, process.env.JWT_KEY, {expiresIn: '1hr'});

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailID: user. emailID,
            _id: user._id,
            role: user.role
        }
        res.cookie('token', token, {maxAge: 1000*60*60}); //maxAge is expiry in millisec
        res.status(200).json({
            user: reply,
            message: "Registered successfully"
        });

    }
    catch(err){
        res.status(400).send("Error " +err.message);
    }
}

const login = async (req, res)=>{
    try{
        const {emailID, password} = req.body;
        if(!emailID || !password){
            throw new Error("Invalid credentials");
        }

        const user = await User.findOne({emailID});
        if( !user){ //Matching user
            throw new Error("Invalid Credentials");
        }
        const match = await bcrypt.compare(password, user.password);
        if( !match){ //Matching password
            throw new Error("Invalid Credentials");
        }
        
        //creating JWT token with randomly generated key (crypto library)
        const token = jwt.sign({_id:user._id, emailID: emailID, role: user.role}, process.env.JWT_KEY, {expiresIn: '1hr'});

        const reply = {
            firstName: user.firstName,
            emailID: user. emailID,
            _id: user._id,
            role: user.role
        }
        res.cookie('token', token, {maxAge: 1000*60*60}); //maxAge is expiry in millisec
        res.status(200).json({
            user: reply,
            message: "Login successfully"
        });
    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

const logout = async (req, res)=>{
    try{
        const {token} = req.cookies;
        //add token to redis blocklist till expiry
        const payload = jwt.decode(token);
        redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
        //clear cookies
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("Logout successful");
    }
    catch(err){
        res.status(503).send("Error: "+err.message);
    }
}

const adminRegister = async (req, res)=>{
    try{
        //Apply API level validation
        validateFunction(req.body);
        const {firstName, emailID, password} = req.body;
        // hasing password
        req.body.password = await bcrypt.hash(password, 12);

        const user = await User.create(req.body);

        //creating JWT token with randomly generated key (crypto library)
        const token = jwt.sign({_id:user._id, emailID: emailID, role: user.role}, process.env.JWT_KEY, {expiresIn: '1hr'});
        res.cookie('token', token, {maxAge: 1000*60*60}); //maxAge is expiry in millisec
        res.status(201).send("Account Registered Successfully");

    }
    catch(err){
        res.status(400).send("Error " +err.message);
    }
}

const deleteProfile = async (req, res)=>{
    try{
        const userId = req.result._id;
        if( !userId){
            return res.status(400).send("User not found");
        }
        //Delete user but also delete it's submissions in Submissions schema
        await User.findByIdAndDelete(userId);
        // await Submission.deleteMany({userId}); //used function in user schema to do this
        res.status(200).send("Profile Deleted Successfully");
    }
    catch(err){
        res.status(500).send("Internal Server Error while deleting");
    }
}

const getProfile = async(req, res)=>{
    try{
        const userId = req.result._id;
        if(!userId){
            return res.status(400).send("User not found");
        }

        const user = await User.findById(userId).select('firstName lastName emailID role problemSolved');

        if(!user){
            return res.status(400).send("User Details not found");
        }
        res.status(200).send(user);
    }
    catch(err){
        res.status(500).send("Internal server error");
    }
}


module.exports = {register, login, logout, adminRegister, deleteProfile, getProfile};

