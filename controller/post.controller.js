const mongoose = require('mongoose');
const Post = require("../models/post.model");

const createPost = async (req, res, next) => {
    try{
        const { caption, body } =req.body;
        if(!caption || !body)
        {
            return res.status(422).json({message:"Please add all the fields"})
        }
        req.user.password = undefind;
        const post = new Post({ 
            caption, 
            body,
            postedBy : req.user,
            posted_at: Date.now()
        })

        post.save().then(result=>{
            res.status(200).json({post: result});
        }).catch(err=>{
            console.log(err);
            res.status(500).json({err:true, message:"something went wrong"})
        })

    }catch(err){
        return next(err);
    }
}

const deletePost = async (req, res, next) => {
    try{
        const postID = req.body.postid;
        Post.findByIdAndDelete(postID, function(err,result){
            if(err){ 
                return res.status(422).json({error:err})
            }
            return res.status(200).json({success: true, message: result})
        })
    }catch(err){
        next(err);
    }
}

const getFollowingPosts = async (req, res, next) => {
    try{
        Post.find({postedBy:{$in:req.user.following}})
        .populate("postedBy","_id username")
        .then(posts=>{
            res.json(posts);
        }).catch(err=>{
            console.log(err);
        })
    }catch (err){
        next(err);
    }
}

const getAllPosts = async (req, res, next) => {
    try{
        const id = req.body.id;
        if(!id){
            id = req.user._id
        }
        Post.find({postedBy:id})
        .populate("postedBy","_id username")
        .then(posts=>{
            res.json(posts);
        }).catch(err=>{
            console.log(err);
        })
    }catch (err){
        next(err);
    }
}

const likePost = async (req, res, next) => {
    try{
        const id = req.user._id;
        const postID = req.body.id;
        Post.findByIdAndUpdate(postID, {$push:{likes:id}},{new:true}, function(err,result){
            if(err) {
                return res.status(422).json({err:true,message:err});
            }
            return res.status(200).json({ success: true, message: result})
        })
    }catch(err){
        next(err);
    }
}

const unlikePost = async (req, res, next) => {
    try{
        const id = req.user._id;
        const postID = req.body.id;
        Post.findByIdAndUpdate(postID, {$pull:{likes:id}},{new:true}, function(err,result){
            if(err) {
                return res.status(422).json({err:true,message:err});
            }
            return res.status(200).json({ success: true, message: result})
        })
    }catch(err){
        next(err);
    }
}

const commentPost = async (req, res, next) => {
    try{
        const comment ={
            text :req.body.text,
            commentedBy:req.user._id
        }
        const postID = req.body.postid;
        Post.findByIdAndUpdate(postID, {$push:{comments:comment}},{new:true}
            ).populate("comments.commentedBy","_id username")
            .exec((err, result) => {
                if(err) {
                    return res.status(422).json({error:err})
                }
                return res.status(200).json({success:true,message:result})
            
            })
    }catch (err) {
        next(err);
    }
}



module.exports = {
    createPost,
    deletePost,
    getFollowingPosts,
    getAllPosts,
    likePost,
    unlikePost,
    commentPost,
};
