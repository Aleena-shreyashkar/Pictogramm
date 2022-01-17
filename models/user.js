const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
    username:{
        type: 'string',
        required: true,
        unique: true
    },
    email: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    },
    profilePicture:{ 
        type:String,
        default:"https://res.cloudinary.com/pictogramm/image/upload/v1642416423/22-223965_no-profile-picture-icon-circle-member-icon-png_m8uzyp.png"
    },
    resetToken: String,
    expireToken:Date,
    email_verified:{
        type: 'boolean',
        required: true
    },
    followers:[{ type:ObjectId,ref:"User"}],
    following:[{ type:ObjectId,ref:"User"}],
    followRequests:[{ type:ObjectId,ref:"FollowRequest"}],
    blockedUsers:[{type:ObjectId,ref:"User"}],
    created_at: {
        time : { type : Date, default: Date.now }
    },
    updated_at: {
        time : { type : Date, default: Date.now }
    }
    },
    {
        collection:'User'
    }
    
)

// export default userSchema;
module.exports= userSchema;