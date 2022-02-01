const express = require('express');
const {
    sendFollowRequest, 
    acceptFollowRequest, 
    deleteFollowRequest,
    unfollowUser,
    blockUser,
    unblockUser,
    getUser,
    getAllUsers,
    editProfile,
    setProfilePicture,
    getAllFollowers,
    getAllFollowing,
    getProfilePicture,
    suggestProfiles
     }  = require("../controller/user.controller.js");
const router = express.Router();
const requireLogin = require('../middleware/requireLogin.js')

router.get('/users/:id',getUser);

router.put('/users/:id',requireLogin,editProfile);

router.get('/users', getAllUsers);


router.post('/following/follow',requireLogin,sendFollowRequest);

router.put('/followers',requireLogin,acceptFollowRequest);

router.delete('/followers/reject',requireLogin,deleteFollowRequest);

router.delete('/following',requireLogin,unfollowUser);

router.post('/block',requireLogin,blockUser);

router.delete('/block',requireLogin,unblockUser);

router.get('/followers',requireLogin,getAllFollowers);

router.get('/following',requireLogin,getAllFollowing);

router.post('/user/profile',requireLogin,setProfilePicture)

router.get('/user/profile',requireLogin,getProfilePicture)

router.get('/suggestProfiles',requireLogin,suggestProfiles)

module.exports =router

