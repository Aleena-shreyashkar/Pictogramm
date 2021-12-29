const express= require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 5000
const {MONGOURI}=require('./config/keys')

require('./models/user')

mongoose.connect(MONGOURI)
mongoose.connection.on('connected',()=>{
    console.log('connected to mongodb')
})
mongoose.connection.on('error',(err)=>{
    console.log('error connecting',err)
})

app.listen(PORT,()=>{
    console.log('listening on port', PORT);
});
