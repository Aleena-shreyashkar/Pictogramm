const mongoose = require('mongoose');
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
    email_verified:{
        type: 'boolean',
        required: true
    },
    created_at: {
        type: 'datetime'
    },
    updated_at: {
        type: 'datetime'
    }
    
})

mongoose.model("User",userSchema)