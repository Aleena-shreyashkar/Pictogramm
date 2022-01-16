const express = require('express');
const {
    sendFollowRequest, 
    acceptFollowRequest, 
    deleteFollowRequest
     }  = require("../controller/user.controller.js");
const router = express.Router();
const requireLogin = require('../middleware/requireLogin.js')

// router.get('/users/:id', controller.getUser);

// router.put('/users/:id',controller.editProfile);

// router.get('/users', controller.getAllUsers);


router.post('/following/follow',requireLogin,sendFollowRequest);

router.put('/followers',requireLogin,acceptFollowRequest);

router.delete('/followers/reject',requireLogin,deleteFollowRequest);

// router.delete('/following',requireLogin,unfollowUser);

// router.post('/block',requireLogin,blockUser);

// router.delete('/block',requireLogin,unblockUser);

// router.get('/block',requireLogin,getBlockedUsers);

module.exports =router

