const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{useUnifiedTopology:true,useNewUrlParser:true,useCreateIndex:true},(err)=>{
    if(err) throw err;
    else
    console.log("Database connected");
})
