require('./db/connect.js')
var express = require('express')
const path = require('path')
const app = express();
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.use(express.static("public"));
app.use(express.json())
app.use(express.urlencoded({extended:false})); 



const userRouter = require("./routes/route")
const gridRouter = require("./routes/grid");
const port = process.env.PORT || 3000;
app.set('view engine','ejs');


  
app.use(userRouter)
app.use(gridRouter)

app.listen(port,()=>console.log("server is started at port "+port));