const express = require('express');
const path = require('path')
const router = express.Router();
const User = require('../db/modals/user')
const passport = require('passport')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const mongoose = require('mongoose')
const {checkAuthenticated,checkLogin} = require('./middlewares/auth');
const diffDays = require('../methods/days');
const streakInc = require('../methods/streak');


const connection = mongoose.createConnection(process.env.MONGODB_AUTH,{useNewUrlParser:true,useUnifiedTopology:true},(err)=>{
    if(err) throw err;
});

router.use(cookieParser('secret'))
router.use(session({
    secret:process.env.SECRET,
    resave:true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge:60*60*24*2*1000,
      },
    saveUninitialized:true,
    store: new MongoStore({
        mongooseConnection:connection
    })
}))


router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

//Global variable
router.use((req,res,next)=>{
    res.locals.success_message = req.flash("success_message");
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash("error");
    next();
})

//passport.js
require('../passport')(passport);

router.post("/register",async (req,res)=>{
    // console.log(req.body)
    var {username,password,email} = req.body;

    if(!username || !email || !password)
        {
            req.flash("error_message","all fields are necessary")
       return res.redirect("/register");
        }

        try{
            var user = await User.findOne({email});
            if(user){
                req.flash('error_message','user already registered with this email');
                return res.send('/register');
            }
            var user1 = await User.findOne({username});
            if(user1){
                req.flash('error_message','user already registered with this username')
                return res.redirect('/register')
            }
            user = new User(req.body);
            const result = await user.save();
            req.flash("success_message","successfully registerd");
            res.redirect('/home')
        }
        catch(err){
            req.flash("error_message",err);
            res.redirect("/error")
            throw new Error(err);
        }
        
    
})
router.get('/login',checkLogin,(req,res)=>{
    res.render('login',{error:res.locals.error_message,success:res.locals.success_message});
})
router.get('/register',(req,res)=>{
    res.render('register',{error:res.locals.error_message,success:res.locals.success_message});
})

router.post("/login",(req,res,next)=>{
    passport.authenticate('user',{
        failureRedirect:'/login',
        successRedirect:'/home',
        failureFlash:true
    })(req,res,next);
})

router.get('/logout',(req,res)=>{
    req.session.destroy()
    req.logOut();
    res.redirect('/login');
})

router.get('/home',checkAuthenticated,async (req,res)=>{
    
    let days = diffDays(req.user.lastday,new Date());
    
    
    try{
        if(days==1){
            // req.user.streak = req.user.streak+1;
            // if(req.user.maxstreak<req.user.streak)
            // req.user.maxstreak = req.user.streak;
             req.user.streakInc();
            }
            else if(days>1)req.user.streak =1;
            req.user.lastday = new Date();

        // await req.user.save();

        // res.render('home',{name:req.user.name,email:req.user.email,img:req.user.profile,videos:req.user.videos,username:req.user.username,weight:req.user.weight,about:req.user.about});
        // console.log(req.user)
        
    }
    catch(e){
        // res.render('home',{name:req.user.name,email:req.user.email,img:req.user.profile,videos:req.user.videos,username:req.user.username,weight:req.user.weight,about:req.user.about});
        throw new Error(e);
    }
    // if(req.user.maxstreak>=100)
    // req.user.badge='100';
    // else if(req.user.maxstreak>=60)
    // req.user.badge = '60';
    // else if(req.user.maxstreak>=15)
    // req.user.badge = '15';
    // else req.user.badge = '0';
    res.render('home',req.user);
})

router.get('/error',(req,res)=>{
    res.render('error',{error:res.locals.error_message,success:res.locals.success_message})
})
module.exports  = router;