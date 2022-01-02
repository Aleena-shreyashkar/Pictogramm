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
                email_verified:true
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

module.exports =router
