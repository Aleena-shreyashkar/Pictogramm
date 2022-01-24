const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
    text : String, 
    commentedBy : {type:ObjectId, ref:"User"},
    reply:[{type:ObjectId, ref:"Comment"}],
    time:{ type : Date, default: Date.now }
})

const Comment = mongoose.model("Comment",commentSchema)
module.exports = Comment;