const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// var GFS = mongoose.model("GFS", new Schema({}, {strict: false}), "fs.files" );

const UserSchema = Schema({
    name:{
        type:String,
        
    },
    username:{
        type:String,
        unique:true,
        minlength:5,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    weight:{
        type:String,
        default:50
    },
    gender:{
        type:String,
    },
    videos:[{type:String}],
    currentDayStreak:{
        type:Number,
        default:1
    },
    heightDayStreak:{
        type:Number,
        default:1
    },
    profile:{
        type:String
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    lastday:{
        type:Date,
        default:new Date()
    },
    streak:{
        type:Number,
        default:0
    },
    maxstreak:{
        type:Number,
        default:0
    },
    about:{
        type:String,
        default:'College students'
    }
})

UserSchema.pre('save',async function(next){
    var user = this;
    if(!user.isModified('password')){
        return next();
    }
    user.password = await bcrypt.hash(user.password,10);
    next();
})

UserSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}


const User = mongoose.model("user",UserSchema);
module.exports = User;