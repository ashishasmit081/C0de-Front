const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailID:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:5,
        max:80
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    problemSolved: [{
    type: Schema.Types.ObjectId,
    ref: 'problem'
    }],
    password:{
        type:String,
        required:true,
    }

}, {timestamps:true})

userSchema.post('findOneAndDelete', async function (userInfo){
    if(userInfo){
        await mongoose.model('submission').deleteMany({userId: document._id});
    }
})

const User = mongoose.model("user", userSchema);
module.exports = User;