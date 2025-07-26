const validator = require('validator')

const validateFunction = (data)=>{
    const mandatory = ['firstName', 'emailID', 'password']; 
    //checking if these fields are present
    const isAllowed = mandatory.every((key)=> Object.keys(data).includes(key));
    if( !isAllowed){
        throw new Error("Mandatory field missing");
    }
    if( !validator.isEmail(data.emailID)){
        throw new Error('Invalid Email');
    }
    if( !validator.isStrongPassword(data.password)){
        throw new Error('Weak Password');
    }
    
}

module.exports = validateFunction;