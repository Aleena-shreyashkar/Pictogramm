const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const followRequestsSchema = mongoose.Schema({
    Requester:{ type: ObjectId, ref:"User"},
    Reciever: { type: ObjectId, ref:"User"},
    status:{
        type:"String",
        enums:["Requested","Pending-Request"]
    }
})

const FollowRequest = mongoose.model('FollowRequest',followRequestsSchema);
module.exports=FollowRequest;