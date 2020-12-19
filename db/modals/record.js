const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recordSchema = Schema({
    filename:{type:String},
    likes:{
        type:Number,
        default:0,
    },
    comments:[{
        type:Schema.Types.ObjectId,ref:"comments"
    }]
})

const commentSchema = Schema({
    username:{
        type:String
    },
    comment:{
        type:String
    }
})

const Records = mongoose.model('records',recordSchema);
const Comments = mongoose.model('comments',commentSchema);

module.exports = {Records,Comments};