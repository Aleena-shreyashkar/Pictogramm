const FollowRequest = require('../models/followRequest.model.js');
const User = require('../models/user.js');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: 'pictogramm', 
    api_key: '863583389655876', 
    api_secret: 'AW7PNwzxeQCJzfslWkMjfdKssE0',
    secure: true
  })

const sendFollowRequest = async (req, res, next) => {
    try{
        const req_id = req.body.followID; 
        const userid = req.user._id;
        const UserB = await User.findById(req_id);
        const frequest = await FollowRequest.findOne({
            Requester : userid,
            Reciever : req_id,
        }).exec();
        if(frequest || UserB==NULL || userid===req_id){
            if(frequest){
                 return res.status(400).json({
                     sucess: false,
                     message:"Follow request already sent"
                 })
            }
            return res.status(400).json({
                success: false,
                message:"Invalid request"
            })

        }
        const frequestA = await new FollowRequest({
            Requester: userid,
            Reciever: req_id,
            status:"Requested",
        }).save();
        const frequestB = await new FollowRequest({
            Requester: req_id,
            Reciever:userid,
            status:"Pending-Request"
        }).save();

        User.findByIdAndUpdate(userid,{$push:{followRequests:frequestA._id}})
        User.findByIdAndUpdate(req_id,{$push:{followRequests:frequestB._id}})
        return res.status(200).json({success:true,message:"Follow request sent"})

    } catch(err){
        return next(err);
    }
}

const acceptFollowRequest = async (req, res, next) => {
    try{
        const req_id = req.body.followID; 
        const userid = req.user._id;
        const frequestA = await FollowRequest.findOneAndDelete({
            Requester:userid,
            Reciever:req_id
        })
        const frequestB = await FollowRequest.findOneAndDelete({
            Requester:req_id,
            Reciever:userid
        })
        User.findByIdAndUpdate(req_id,{$pull:{followRequests:frequestA}, $push:{followers:userid}},{new:true})
        User.findByIdAndUpdate(userid,{$pull:{followRequests:frequestB}, $push:{following:req_id}},{new:true})
        return res.status(200).json({success:true, message:"Request Accepted"});
    }catch(err){
        return next(err);
    }
}


const deleteFollowRequest = async (req, res, next) => {
    try{
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
        User.findOneAndUpdate(req_id,{$pull:{followRequests:frequestA}})
        User.findOneAndUpdate(userid,{$pull:{followRequests:frequestB}})
        return res.status(200).json({success:true,message:"Request deleted successfully"})
    }catch(err){
        return next(err);
    }
}

const unfollowUser = async (req, res, next) => {
    try{
        const req_id = req.body.unfollowID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if(!user || !req_id)
        {
            return res.status(400).json({success: false,message:"Invalid request"})
        }
        User.findByIdAndUpdate(req_id,{$pull:{follower:userid}},{new:true})
        User.findByIdAndUpdate(userid,{$pull:{following:req_id}},{new:true})
        return res.status(200).json({success:true,message:"Unfollowed User successfully"})

        
    }catch(err){
        return next(err);
    }
}


const blockUser = async (req, res, next) => {
    try{
        const req_id = req.body.blockID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if(!user || !req_id || req_id === userid){
            return res.status(400).json({success: false, message:"Invalid request"})
        }
        User.findByIdAndUpdate(userid,{$push:{blockedUsers:req_id}},{new:true});
        return res.status(200).json({success:true,message:"User Blocked Successfully"})

    }catch (err){
        return next(err);
    }
}


const unblockUser = async (req, res, next) => {
    try{
        const req_id = req.body.blockID;
        const userid = req.user._id;
        const user = await User.findById(req_id);
        if(!user || !req_id || req_id === userid){
            return res.status(400).json({success: false, message:"Invalid request"})
        }
        User.findByIdAndUpdate(userid,{$pull:{blockedUsers:req_id}},{new:true})
        .then(user => {
            return res.status(200).json({success:true,message:"User unblocked Successfully"})
        }).catch(err=>{
            console.log(err)
            return res.status(500).json({success:false,message:"Somwthing went wrong"})
        });
        

    }catch (err){
        return next(err);
    }
}


// const getAllFollowers = async (req, res, next) => {

// }


const setProfilePicture = async (req, res, next) => {
    try{
        const pic = req.files.pic;
        cloudinary.uploader.upload(pic.tempFilePath,(err,result)=>{
            console.log(result);
            User.findById(req.user._id)
            .then(user =>{
                if(!user)
                {
                    return res.status(400).json({success: false, message:"User not found"});
                }
                // Uploading profile picture
                user.profilePicture = result.url;
                return res.json({success: true, message:"Profile picture successfully uploaded"})
            }).catch(err =>{
                console.log(err);
            })
        })
    }catch (err){
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
    setProfilePicture
    // getAllFollowers
};

