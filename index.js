const express= require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 5000
const {MONGOURI}=require('./config/keys')
const auth = require('./routes/auth.js')

// connecting to MongoDB
mongoose.connect(MONGOURI)
mongoose.connection.on('connected',()=>{
    console.log('connected to mongodb')
})
mongoose.connection.on('error',(err)=>{
    console.log('error connecting',err)
})

app.use(express.json())

app.use(auth)

app.listen(PORT,()=>{
    console.log('listening on port', PORT);
});
