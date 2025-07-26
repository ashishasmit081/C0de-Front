const express = require('express');
const authRouter = express.Router();
const {register, login, logout, adminRegister, deleteProfile, getProfile} = require('../controllers/userAuthenticate');
const userMiddleware = require('../middleware/userMiddleware');
const isAdminMiddleware = require('../middleware/isAdminMiddleware');
//REGISTER
authRouter.post('/register', register); 
// LOGIN
authRouter.post('/login', login);
// LOGOUT
authRouter.post('/logout', userMiddleware, logout);

//ADMIN - REGISTER (middleware to verify if someone accessing the route is admin already)
//admin hi admin ko register kra skta hai 
authRouter.post('/admin/register', isAdminMiddleware, adminRegister); 

//DELETE PROFILE (requires user middleware)
authRouter.delete('/deleteprofile', userMiddleware, deleteProfile); 

// 
authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
// GET PROFILE
authRouter.get('/profile',userMiddleware, getProfile);

module.exports = authRouter;
