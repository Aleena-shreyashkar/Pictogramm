const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userSchema=require('../models/user')
mongoose.model("User",userSchema)
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto');
const { route } = require('express/lib/router');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:"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"
    }

}))


router.get('/protected',requireLogin,(req, res) => {
    res.send("hello")
})


router.post('/signup',(req, res) => {
    const {username,email,password} = req.body;
    if(!username || !email || !password)
    {
       return res.status(422).json({error:"Please add all the fields"})
    }
    User.findOne({email:email})
    .then(savedUser => {
        if(savedUser)
        {
            return res.status(422).json({error:"user already exist"})
        }
        User.findOne({username:username})
        .then(savedUsername => {
            if(savedUsername)
            {
                return res.status(422).json({error:"Username already exists"})
            }
        })
        // hashing password
        bcrypt.hash(password,12)
        .then(hashedpassword => {
            const user = new User({
                username,
                email,
                password:hashedpassword,
                email_verified:true,
                created_at: Date.now(),
                updated_at: Date.now()
            })
    
            user.save()
            .then(user => {
                res.json({message:"user saved successfully"})
            })
            .catch(err => {
                console.log(err)
            })
        })
        
    })
    .catch(err => {
        console.log(err)
    })
})


router.post('/signin',(req, res) => {
    const {email,password} =req.body
    if(!email || !password) {
        res.status(402).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser)
        {
           return res.status(402).json({error:"ivalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(!doMatch){
                res.status(402).json({error:"invalid email or password"})
            }
            else{
                // res.json({message:"succesfully signed in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                res.json({token})
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
})


router.post('/reset-password',(req,res)=>{
   crypto.randomBytes(32,(err,buffer)=>{
       if(err){
           console.log(err)
       }
       const token = buffer.toString("hex")
       User.findOne({email:req.body.email})
       .then(user => {
           if(!user){
               return res.status(422).json({error:"User doesnt exist"})
           }
           user.resetToken = token
           user.expireToken = Date.now()+3600000
           user.save().then((result)=>{
               transporter.sendMail({
                   to:user.email,
                   from:"no-reply@picto.com",
                   subject:"Password-reset",
                   html:`
                   <p> you requested for password reset</p>
                   <h5> Click on this <a href="http://localhost:5000/reset/${token}">Link</a> to reset password</h5>`  
               })
               res.json({message:"Check your email"})
           })
       })
   })
})


router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user => {
        if(!user){
            return res.status(422).json({err:"Session expired. Try again"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((savedUser)=>{
                res.json({message:"password changed successfully"})
            })
        })
    }).catch((err)=>{
        console.log(err)
    })
})

module.exports =router
