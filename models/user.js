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
    resetToken: String,
    expireToken:Date,
    email_verified:{
        type: 'boolean',
        required: true
    },
    followers:[{ type:ObjectId,ref:"User"}],
    following:[{ type:ObjectId,ref:"User"}],
    followRequests:[{ type:ObjectId,ref:"FollowRequest"}],
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