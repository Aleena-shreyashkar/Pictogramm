const express = require('express');
const requireLogin = require('../middleware/requireLogin');
const router = express.Router();

const { createPost,
        deletePost,
        getFollowingPosts,
        getAllPosts,
        likePost,
        unlikePost,
        commentPost,
        
     } = require('../controller/post.controller');

router.post('/createPost',requireLogin,createPost);

router.delete('/deletePost',requireLogin,deletePost);

router.get('/user/home',requireLogin,getFollowingPosts);

router.get('/getAllPosts',requireLogin,getAllPosts);

router.put('/likePost',requireLogin,likePost);

router.delete('/unlikePost',requireLogin,unlikePost);

router.put('/addComment',requireLogin,commentPost);



module.exports = router;