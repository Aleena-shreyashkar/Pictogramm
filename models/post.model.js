const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const postSchema = new mongoose.Schema({
    caption:{
        type:String, required:true
    },
    body:{
        type:String, required:true
    },
    media:{
        type:String
    },
    likes: [{type:ObjectId, ref:"User"}],
    comments:[{
        text : String, 
        commentedBy : {type:ObjectId, ref:"User"}
    }],
    reply:[{
        text:String,
        repliedBy:{type:ObjectId, ref:"User"}
    }], 
    postedBy:{type:ObjectId, ref:"User"},
    
    posted_at:{
        type: { type : Date, default: Date.now }
    }
}
)

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
