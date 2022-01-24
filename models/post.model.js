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
    comments:[{type:ObjectId, ref:"Comment"}],
        
    postedBy:{type:ObjectId, ref:"User"},
    
    posted_at:{
        type: { type : Date, default: Date.now }
    }
}
)

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
