const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userSchema=require('../models/user')
mongoose.model("User",userSchema)
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET,Mailgun_API_Key,JWT_ACC_Activate} = require('../config/keys');
const requireLogin = require('../middleware/requireLogin')
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox2c4f3404967c42728455654bc7dc7790.mailgun.org';
const mg = mailgun({apiKey: Mailgun_API_Key, domain: DOMAIN});
const crypto = require('crypto');
const { route } = require('express/lib/router');


router.get('/protected',requireLogin,(req, res) => {
    res.send("hello")
})

//signup, check if user already exists, if not then send activation email
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

        const token = jwt.sign({username,email,password},JWT_ACC_Activate,{expiresIn:'45m'});
        
        // send activation mail using mailgun
        const data = {
            from: 'no.reply.picto@gmail.com' ,
            to: req.body.email,
            subject: 'Account Activation Link',
            html:`
              <p> Welcome to the Pictogramm Fam!!</p>
              <h5> Click on this <a href="http://localhost:3000/authentication/activate/${token}">Link</a> to activate account</h5>`
         };
         mg.messages().send(data, function (error, body) {
             if(error){
                 return res.status(402).json({message:err})
             }
             console.log(body);
             return res.json({message:"Email has been sent. Kindly activate your account."})
         });   
    })
    .catch(err => {
        console.log(err)
    })
})

// saving user after successful activation
router.post('/email-activate',(req, res)=>{
    const {token} = req.body;
    if(token){
        jwt.verify(token,JWT_ACC_Activate,function(err,decodedToken){
            if(err){
                return res.status(400).json({error:"Incorrect or expired link"})
            }
            const {username,email,password} = decodedToken;
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
    }
    else{
        return res.status(402).json({error:"something went wrong"})
    }
})

// User Signin
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

// Reset Password
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
            //    send reset email using mailgun
            const data = {
                from: 'no.reply.picto@gmail.com',
                to: user.email,
                subject: 'Password Reset',
                html:`
                   <p> you requested for password reset</p>
                  <h5> Click on this <a href="http://localhost:3000/reset/${token}">Link</a> to reset password</h5>`
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.status(402).json({message:err})
                }
                console.log(body);
                res.json({message:"Check your email to reset password"})
            });
           })
       })
   })
})

// Updating new password
router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user => {
        if(!user){
            return res.status(422).json({err:"Session expired. Try again"})
        }
        // updating password
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.updated_at={time:Date(Date.now())}
            user.save().then((savedUser)=>{
                res.json({message:"password changed successfully"})
            })
        })
    }).catch((err)=>{
        console.log(err)
    })
})

module.exports =router
