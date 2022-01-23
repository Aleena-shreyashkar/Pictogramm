const FollowRequest = require('../models/followRequest.model.js');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const userSchema = require('../models/user')
mongoose.model("User", userSchema)
const User = mongoose.model("User");


const sendFollowRequest = async (req, res, next) => {
    try {
        const req_id = req.body.followID;
        const userid = req.user._id;
        const UserB = await User.findById(req_id);
        const frequest = await FollowRequest.findOne({
            Requester: userid,
            Reciever: req_id,
        }).exec();
        if (frequest || UserB == NULL || userid === req_id) {
            if (frequest) {
                return res.status(400).json({
                    sucess: false,
                    message: "Follow request already sent"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Invalid request"
            })

        }
        const frequestA = await new FollowRequest({
            Requester: userid,
            Reciever: req_id,
            status: "Requested",
        }).save();
        const frequestB = await new FollowRequest({
            Requester: req_id,
            Reciever: userid,
            status: "Pending-Request"
        }).save();

        User.findByIdAndUpdate(userid, { $push: { followRequests: frequestA._id } })
        User.findByIdAndUpdate(req_id, { $push: { followRequests: frequestB._id } })
        return res.status(200).json({ success: true, message: "Follow request sent" })

    } catch (err) {
        return next(err);
    }
}

const acceptFollowRequest = async (req, res, next) => {
    try {
        const req_id = req.body.followID;
        const userid = req.user._id;
        const frequestA = await FollowRequest.findOneAndDelete({
            Requester: userid,
            Reciever: req_id
        })
        const frequestB = await FollowRequest.findOneAndDelete({
            Requester: req_id,
            Reciever: userid
        })
        User.findByIdAndUpdate(req_id, { $pull: { followRequests: frequestA }, $push: { followers: userid } }, { new: true })
        User.findByIdAndUpdate(userid, { $pull: { followRequests: frequestB }, $push: { following: req_id } }, { new: true })
        return res.status(200).json({ success: true, message: "Request Accepted" });
    } catch (err) {
        return next(err);
    }
}


const deleteFollowRequest = async (req, res, next) => {
    try {
        const req_id = req.body.id;
        const userid = req.user_id;
        const frequestA = await FollowRequest.findOneAndDelete({
            Requester: userid,
            Reciever: req_id
        })
        const frequestB = await FollowRequest.findOneAndDelete({
            Requester: req_id,
            Reciever: userid
        })
        User.findOneAndUpdate(req_id, { $pull: { followRequests: frequestA } })
        User.findOneAndUpdate(userid, { $pull: { followRequests: frequestB } })
        return res.status(200).json({ success: true, message: "Request deleted successfully" })
    } catch (err) {
        return next(err);
    }
}

const unfollowUser = async (req, res, next) => {
    try {
        const req_id = req.body.unfollowID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if (!user || !req_id) {
            return res.status(400).json({ success: false, message: "Invalid request" })
        }
        User.findByIdAndUpdate(req_id, { $pull: { follower: userid } }, { new: true })
        User.findByIdAndUpdate(userid, { $pull: { following: req_id } }, { new: true })
        return res.status(200).json({ success: true, message: "Unfollowed User successfully" })


    } catch (err) {
        return next(err);
    }
}


const blockUser = async (req, res, next) => {
    try {
        const req_id = req.body.blockID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if (!user || !req_id || req_id === userid) {
            return res.status(400).json({ success: false, message: "Invalid request" })
        }
        User.findByIdAndUpdate(userid, { $push: { blockedUsers: req_id } }, { new: true });
        return res.status(200).json({ success: true, message: "User Blocked Successfully" })

    } catch (err) {
        return next(err);
    }
}


const unblockUser = async (req, res, next) => {
    try {
        const req_id = req.body.blockID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if (!user || !req_id || req_id === userid) {
            return res.status(400).json({ success: false, message: "Invalid request" })
        }
        User.findByIdAndUpdate(userid, { $pull: { blockedUsers: req_id } }, { new: true })
            .then(user => {
                return res.status(200).json({ success: true, message: "User unblocked Successfully" })
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ success: false, message: "Somwthing went wrong" })
            });


    } catch (err) {
        return next(err);
    }
}


const getUser = async (req, res, next) => {
    try {
        const req_user = req.body.username;
        User.findOne({ username: req_user })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ success: false, message: "Not found" })
                }
                const userReturn = {
                    username: user.username,
                    email: user.email,
                    followers: user.followers,
                    profilePicture: user.profilePicture,
                }
                return res.status(200).json({ success: true, message: "User returned", profile: userReturn })
            }).catch((err) => {
                console.error(err)
            })
    } catch (err) {
        return next(err);
    }
}


const getAllUsers = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 100
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        User.find({}, {}, query, function (err, data) {
            // Mongo command to fetch all data from collection.
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                response = { "success": true, "message": data };
            }
            res.json(response);
        });

    } catch (err) {
        return next(err);
    }
}

const getAllFollowers = async (req, res, next) => {
    try {
        const userid= req.user._id;
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 100
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        User.findById(userid, {}, query, function (err, data) {
            data = user.followers;
            // Mongo command to fetch all data from collection.
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                response = { "success": true, "message": data };
            }
            res.json(response);
        });

    } catch (err) {
        return next(err);
    }
}


const getAllFollowing = async (req, res, next) => {
    try {
        const userid= req.user._id;
        const page = req.query.page ? parseInst(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 100
        const query = {}
        if (page < 0 || page === 0) {
            response = { "error": true, "message": "invalid page number, should start with 1" };
            return res.json(response)
        }
        query.page = limit * (page - 1)
        query.limit = limit
        User.findById(userid, {}, query, function (err, data) {
            data = user.following;
            // Mongo command to fetch all data from collection.
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                response = { "success": true, "message": data };
            }
            res.json(response);
        });

    } catch (err) {
        return next(err);
    }
}

const editProfile = async (req, res, next) => {
    try {
        const userid = req.user_id;
        User.findById(userid, function (err, user) {

            if (!user) {
                return res.status(401).json({ error: true, message: "user not found" });
            }
        });


            var email = req.body.email.trim();
            var username = req.body.username.trim();
            if (!email || !username) {
                return res.status(422).json({ error: true, message: 'One or more fields are empty' })
            }
            // check if username already exists
            User.findOne({ username: username })
                .then(savedUsername => {
                    if (savedUsername) {
                        return res.status(422).json({ error: "Username already exists" })
                    }
                });
            user.email = email;
            user.username = username;
            user.updated_at = new Date();
            user.save()
                .then(user => {
                    res.json({ message: "changes saved successfully" })
                }).catch(err => {
                    console.log(err)
                });
        

    } catch (err) {
        return next(err);
    }
}



const setProfilePicture = async (req, res, next) => {
    try {
        const pic = req.files.pic;
        cloudinary.uploader.upload(pic.tempFilePath, (err, result) => {
            console.log(result);
            User.findById(req.user._id)
                .then(user => {
                    if (!user) {
                        return res.status(400).json({ success: false, message: "User not found" });
                    }
                    // Uploading profile picture
                    user.profilePicture = result.url;
                    return res.json({ success: true, message: "Profile picture successfully uploaded" })
                }).catch(err => {
                    console.log(err);
                })
        })
    } catch (err) {
        return next(err);
    }
}


const getProfilePicture = async (req, res, next) => {
    try {
        const req_user = req.user._id;
        User.findById(req_user)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ success: false, message: "Not found" })
                }
                const userReturn = {
                    profilePicture: user.profilePicture,
                }
                return res.status(200).json({ success: true, message: "Profile Profile returned", profilePic: userReturn })
            }).catch((err) => {
                console.error(err)
            })
    } catch (err) {
        return next(err);
    }
}


module.exports = {
    sendFollowRequest,
    acceptFollowRequest,
    deleteFollowRequest,
    unfollowUser,
    blockUser,
    unblockUser,
    getUser,
    getAllUsers,
    getAllFollowers,
    getAllFollowing,
    editProfile,
    setProfilePicture,
    getProfilePicture
};

