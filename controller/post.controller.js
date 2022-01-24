const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const cloudinary = require('cloudinary').v2;

const createPost = async (req, res, next) => {
    try{
        const { caption, body } =req.body;
        if(req.body)
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
        if(!postID){
            return res.status(400).json({message:"Please add all the fields"})
        }
        const { postedBy } = await Post.findbyId(postID);
        const post = await Post.findbyId(postID);
        // delete all comments
        post.comments.map((commentId) => {
              Comment.findByIdAndDelete(commentId);
          });
        //   delete post
        if(postedBy===req.user._id){
           Post.findByIdAndDelete(postID, function(err,result){
              if(err){ 
                return res.status(422).json({error:err})
              }
              return res.status(200).json({success: true, message: result})
           })
        }
        else{
            return res.status(401).json({error:"can not delete other's post"})
        }
    }catch(err){
       return next(err);
    }
}

const updatePost = async (req, res, next) => {
    try{
        const postID = req.body.postID;
        if(!postID){
            return res.status(400).json({message:"Please add all the fields"})
        }
        const { postedBy } = await Post.findbyId(postID);
        if(postedBy===req.user._id){
           const post = Post.findByIdAndUpdate(postID);
              post.caption = req.body.caption;
              post.body = req.body.body;
              post.save(function(err, result){
                  if(err){
                      return res.status(422).json({message: err.message});
                  }
                return res.status(200).json({success: true, message: result})
              })
           
        }
        else{
            return res.status(401).json({error:"can not update other's post"})
        }

    }catch (err){
        return next(err);
    }
}

const getPost = async (req, res, next) => {
    try{
        const postId = req.body.postID;
        if(!postId)
        {
            return res.status(400).json({message:"Provide the post ID"})
        }
        Post.findOne(postId, function(err,result)
        {
            if(err)
            {
                return res.status(404).json({message:err.message});
            }
            return res.status(200).json({ success: true, message: result})
        })
    }catch(err){
        return next(err);
    }
}

const getAllPostsOfUser = async (req, res, next) => {
    try{
        const id = req.body.userid;
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 20
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        if(!id)
        {
            id = req.user._id;
        }
        Post.find({postedBy:{$in:id}}, {}, query, function (err, data){
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                response = { "success": true, "message": data };
            }
            res.json(response);
        }).populate("postedBy","_id username");
        
    }catch (err){
       return next(err);
    }
}

const getFeed = async (req, res, next) => {
    try{
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 20
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        Post.find({postedBy:{$in:req.user.following}}, {}, query, function (err, data){
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                response = { "success": true, "message": data };
            }
            res.json(response);
        }).populate("postedBy","_id username");
        
    }catch (err){
       return next(err);
    }
}

const getAllPosts = async (req, res, next) => {
    try{
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 20
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        
        Post.find({}, {}, query , function (err, data) {
        if (err) {
            response = { "error": true, "message": "Error fetching data" };
        } else {
            response = { "success": true, "message": data };
        }
        res.json(response);
    }).populate("postedBy","_id username");
    }catch (err){
       return next(err);
    }
}

const likePost = async (req, res, next) => {
    try{
        const id = req.user._id;
        const postID = req.body.id;
        if(!postID)
        {
            return res.status(400).json({message:"please provide post ID"});
        }
        if(!id){
            return res.status(401).json({message:"Require login"})
        }
        Post.findByIdAndUpdate(postID, {$push:{likes:id}},{new:true}, function(err,result){
            if(err) {
                return res.status(422).json({err:true,message:err});
            }
            return res.status(200).json({ success: true, message: result})
        })
    }catch(err){
       return next(err);
    }
}

const unlikePost = async (req, res, next) => {
    try{
        const id = req.user._id;
        const postID = req.body.id;
        if(!postID)
        {
            return res.status(400).json({message:"please provide post ID"});
        }
        if(!id){
            return res.status(401).json({message:"Require login"})
        }
        Post.findByIdAndUpdate(postID, {$pull:{likes:id}},{new:true}, function(err,result){
            if(err) {
                return res.status(422).json({err:true,message:err});
            }
            return res.status(200).json({ success: true, message: result})
        })
    }catch(err){
       return next(err);
    }
}

const sharePost = async (req, res, next) => {
    try{
        const postID = req.body.postId;
        const id = req.user._id;
        if(!postID)
        {
            return res.status(400).json({message:"Post ID not provided"})
        }
        if(!id)
        {
            return res.status(401).json({message:"Require Login"})
        }
        const post = await Post.findById(postID);
        User.findById(id,{$push:{sharePost:post._id}}, {new:true},function(err,result){
            if(err){
                return res.status(422).json({message:err.message})
            }
            return res.status(200).json({ success: true, message: result})
        })
        
    }catch(err){
        return next(err);
    }
}

const commentPost = async (req, res, next) => {
    try{
        const text = req.body.text;
        const commentedBy = req.user._id;
        const postID = req.body.postid;
        if(!text || !postID)
        {
            return res.status(400).json({message: "Fill all the fields"});
        }
        if(!commentedBy)
        {
            return res.status(401).json({message: "Login to comment"})
        }
        const comment = await new Comment({
            text,
            commentedBy,
            time: Date.now
        }).save();
        
        Post.findByIdAndUpdate(postID, {$push:{comments:comment._id}},{new:true}
            ).populate("comments.commentedBy","_id username")
            .exec((err, result) => {
                if(err) {
                    return res.status(422).json({error:err})
                }
                return res.status(200).json({success:true,message:result})
            
            })
    }catch (err) {
        return next(err);
    }
}

const deleteComment = async (req, res, next) => {
    try{
        const commentid= req.body.commentid;
        const id = req.user._id;
        const postID = req.body.postid;
        if(!commentid)
        {
            return res.status(400).json({message:"comment id not provided"})
        }
        if(!id)
        {
            return res.status(401).json({message:"Login to delete comment"})
        }
        const comment = await Comment.findOneAndDelete(commentid);
        Post.findOneAndUpdate(postID, { $pull: {comments: comment} }).exec(err,result=>{
            if(err){
                return res.status(422).json({err})
            }
            return res.status(200).json({ success: true, message: result})
        })

    }catch (err) {
        return next(err);
    }
}

const editComment = async (req, res, next)=>{
    try{
        const commentID = req.body.commentId;
        if(!commentID)
        {
            return res.status(400).json({message:"Comment id not provided"})
        }
        const { commentedBy } = await Comment.findById(commentID);
        if(commentedBy===req.user._id)
        {
            const comment = await Comment.findByIdAndUpdate(commentID)
                comment.text = req.body.text;
                comment.save(function(err,result){
                    if(err) {
                        return res.status(422).json({message:err.message});
                    }
                    return res.status(200).json({ success: true, message: result});
                })
            
        }
        else{
            return res.status(401).json({ message:"Cant edit other's comment"});
        }
    }catch(err) {
        return next(err);
    }
}

const replyComment = async (req, res, next) => {
    try{
        const commentID= req.body.commentID;
        if(!commentID)
        {
            return res.status(400).json({message:"Comment id not provided"});
        }
        const replyComment = await new Comment({
            text: req.body.reply,
            commentedBy:req.user._id,
            time: Date.now
        }).save();

        Comment.findByIdAndUpdate(commentID,{$push:{reply:replyComment._id}}, { new: true },function(err,result){
            if(err){
                return res.status(422).json({mesage:"something went wrong"})
            }
            return res.status(result).json({success:true, message:result})
        })
    }catch (err) {
        return next(err);
    }
}

const getComment = async (req, res, next) => {
    try{
        const commentID = req.body.id
        if(!commentID)
        {
            return res.status(401).json({message:"Provide comment ID"})
        }
        const comment = await Comment.findByID(commentID)
        .populate("reply")
        if(!comment)
        {
            return res.status(422).json({message:"Something went wrong"})
        }
        return res.status(200).json({message:"OK", data:comment});
    }catch(err) {
        return next(err);
    }
}

const getAllComments = async (req, res, next) => {
    try{
        const postID = req.body.postid;
        if(!postID) return res.status(400).json({message:"Missing postID"})
        const page = req.query.page ? parseInt(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 20
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        const { comments } = await Post.findById({postID},{},query)
        .populate("comments")
        return res.status(200).json({ success: true, data: comments })
      
    }catch (err) {
        return next(err);
    }
}



module.exports = {
    createPost,
    deletePost,
    updatePost,
    getPost,
    getAllPostsOfUser,
    getFeed,
    getAllPosts,
    likePost,
    unlikePost,
    sharePost,
    commentPost,
    deleteComment,
    editComment,
    replyComment,
    getComment,
    getAllComments
};
