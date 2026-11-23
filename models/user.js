const {createHmac, randomBytes} = require('crypto');
const {Schema,model} = require('mongoose');
const {createTokenForUser} = require('../services/authentication')

const userSchema = new Schema({
    fullName :{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
         type:String,
    },
    password:{
        type:String,
        required:true
    },
    profileImageUrl:{
         type:String,
         default:"/images/default.png"
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:'USER',
    },
},{timestamps:true});

    // pre save- password hashed
userSchema.pre("save",function(){
    const user = this;
 
    if (!user.isModified("password")) return;

    const salt = "randomBytes" ;          //salt-random string
    const hashedPassword = createHmac('sha256',salt)            //createHmac-used to hashed the value
    .update(user.password)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

});

//mongoose virtual function
userSchema.static("matchPasswordAndGenerateToken", async function(email,password){
    const user = await this.findOne({email});
    if(!user){
            throw new Error("user not found");
    };

    const salt = user.salt;
    const hashedPassword = user.password;
    const newHashPassword = createHmac('sha256',salt)            //createHmac-used to hashed the value
    .update(password)
    .digest("hex");

    if(hashedPassword !== newHashPassword){
        throw new Error("Incorrect Password");
    };

  const token = createTokenForUser(user);
  return token;  
});

const User = model('user',userSchema);


module.exports = User;