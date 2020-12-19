const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const User = require('../db/modals/user');
const {Records,Comments} = require('../db/modals/record');
const {checkAuthenticated,checkLogin} = require('./middlewares/auth');


const app = require('express');
const router = require('./route');
const Router = express.Router();

const conn = mongoose.createConnection(process.env.MONGODB_URL,{useUnifiedTopology: true,useNewUrlParser:true});

let gfs;
conn.once('open',()=>{
    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('uploads');
})


const storage = new GridFsStorage({
    url: process.env.MONGODB_URL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            console.log(err,buf)
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });
  
  router.post('/update',checkAuthenticated,upload.single('file'),async (req,res)=>{
      var {name,age,weight,about} = req.body
      // console.log(req.body,req.file);
      if(!name || !age || !weight || !about){
          req.flash("error_message","all fields are necessary");
          
          return res.redirect('/update');
      }
      else{
          req.body.profile = req.file.filename;
          try{
              if(name)
              req.user.name = name
              req.user.age = age
              req.user.weight = weight
              req.user.about  = about
              gfs.files.remove({filename:req.user.profile});
              req.user.profile = req.file.filename
              var result = await req.user.save();
              // console.log(result);
              req.flash("success_message","profile succesfully updated");
              res.redirect('/home');
          }catch(e){
              req.flash("error_message",e.message);
              res.redirect('/update');
              throw new Error(e);
          }
      }
  })
  router.post('/uploadvideo',checkAuthenticated,upload.single('file'),async (req,res)=>{
    if(!req.file)
    return res.send("not uploaded");
    else{
      try{
        req.user.videos.push(req.file.filename);
        await req.user.save();
        var record = new Records({filename:req.file.filename});
        
        await record.save();
        req.flash('success_message','uploaded successfully')
        res.redirect('/home')
      }catch(e){
        req.flash('error_message','not uploaded');
        res.redirect('/home');
        throw new Error(e);
      }
    }
  })

  router.get('/image/:id',(req,res)=>{
      gfs.files.findOne({filename:req.params.id},(err,file)=>{
          if(err) throw err;
          else
          {
              if(!file)
              {
                  return res.status(404).json({err:'not found'});
              }
              if(file.contentType =='image/jpeg' || file.contentType =='image/png')
              {
               
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
              }
              else{
                return res.status(404).json({err:"not found"});
              }
          }
          

      })
  })
  router.get('/video/:id',(req,res)=>{
      gfs.files.findOne({filename:req.params.id},(err,file)=>{
          if(err) throw err;
          else
          {
            // console.log(file)
              if(!file)
              {
                  return res.status(404).json({err:'not found'});
              }
              if(file.contentType !='video/mpeg' || file.contentType !='video/mp4')
              {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
              }
              else{
               
                return res.status(404).json({err:"not found"});
              }
          }
          

      })
  })

router.get('/update',checkAuthenticated,(req,res)=>{
    res.render('changeProfile',{error:res.locals.error_message,success:res.locals.success_message})
})

// Explore section

router.get('/explore',checkAuthenticated,async (req,res)=>{
  // console.log(req.query);
  let limit=0;
  limit = req.query.limit?parseInt(req.query.limit):0
  try{
      var records = await Records.find().skip(limit).limit(5);
     

      if(!records || records.length==0)
      {
        return res.render('explorer',{limit:limit})
      }
      else
      {
        return res.render('explorer',{records:records,limit:limit});
      }

    }catch(e){
      res.render('explorer',{records:records,limit:limit});
      throw new Error(e);
    }
    
})

router.get('/like/:id',async(req,res)=>{
    try{
      let filename = req.params.id;
      let record = await Records.findOne({filename:filename})
      record.likes++;
      await record.save();
      res.status(200).json(record.likes)
    }catch(e){
      res.status(404).end()
      throw new Error(e);
    }
    
})

router.post('/profile',async (req,res)=>{
  let username = req.body.username;
  if(!username) return res.json({err:"plese enter username"});
  try{
    user = await User.findOne({username:username});
    
    if(user) {
      if(req.user.maxstreak>=100)
    user.badge='100';
    else if(req.user.maxstreak>=60)
    user.badge = '60';
    else if(req.user.maxstreak>=15)
    user.badge = '15';
    else user.badge = '0';
      user.password=undefined;
      return res.render('home',user);
      }
    else return res.json({err:"no user exist"});
  }catch(e){
    res.end();
    throw new Error(e);
  }
})


module.exports = router;