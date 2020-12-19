const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// var GFS = mongoose.model("GFS", new Schema({}, {strict: false}), "fs.files" );

const UserSchema = new Schema({
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
        default:10
    },
    about:{
        type:String,
        default:'College students'
    },
    badges:[{
        type:String,
    }]
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
UserSchema.methods.streakInc = async function(){
    let user  = this
    let arr = [10,25,50,75,100];
    user.streak++;
    if(user.maxstreak==user.streak)
    {
        user.badges.push(String(user.maxstreak));
        let maxExit = false
        for(let i =0;i<arr.length;i++)
        {
            if(arr[i]>user.maxstreak)
            {
                user.maxstreak = arr[i];
                maxExit=true;
                break;
            }
        }
        
        
        if(!maxExit)
        user.maxstreak = 100000000;

    }
    
    
    await user.save();
}

const User = mongoose.model("user",UserSchema);
module.exports = User;