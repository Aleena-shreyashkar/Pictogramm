const express = require('express');
const requireLogin = require('../middleware/requireLogin');
const router = express.Router();

const { createPost,
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
        
     } = require('../controller/post.controller');

router.post('/createPost',requireLogin,createPost);

router.delete('/deletePost',requireLogin,deletePost);

router.put('/updatePost',requireLogin,updatePost);

router.get('/getPost',requireLogin,getPost);

router.get('/getAllPostsOfUser',requireLogin,getAllPostsOfUser)

router.get('/feed',requireLogin,getFeed);

router.get('/getAllPosts',requireLogin,getAllPosts);

router.put('/likePost',requireLogin,likePost);

router.delete('/unlikePost',requireLogin,unlikePost);

router.put('/sharePost',requireLogin,sharePost);

router.put('/addComment',requireLogin,commentPost);

router.delete('/deleteComment',requireLogin,deleteComment);

router.put('/editComment',requireLogin,editComment);

router.put('/replyToComment',requireLogin,replyComment);

router.get('/getComment',requireLogin,getComment);

router.get('/getAllComments',requireLogin,getAllComments);



module.exports = router;