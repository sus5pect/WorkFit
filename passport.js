const passport = require('passport')
const User = require('./db/modals/user')
const bcrypt = require('bcrypt');

module.exports = (passport)=>{
    var localStragey = require('passport-local').Strategy;
    passport.use("user", new localStragey({usernameField:"email"},(username,password,done)=>{
        User.findOne({email:username},(err,data)=>{
            if(err) throw err;
            if(!data)
                return done(null,false,{message:"no such user exist"});
            bcrypt.compare(password,data.password,(err,match)=>{
                if(err)
                    return done(null,false,{message:"error in matching password"})
                else if(!match)
                    return done(null,false,{message:"password doesn't matched"})
                else if(match)
                    return done(null,data);
            })
        })
    }))

    passport.serializeUser((user,cb)=>{
        cb(null,user.id);
    })

    passport.deserializeUser((id,cb)=>[
        User.findById(id,(err,user)=>{
            cb(err,user);
        })
    ])
}