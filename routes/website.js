const express = require('express');
const dotenv=require('dotenv');
const sgMail=require('@sendgrid/mail');
const Post = require("../models/Post");
const Category = require("../models/Category");
const Comments = require("../models/Comments");
const User = require("../models/User");


const router = express.Router();
dotenv.config();

router.post('/contact',async (req,res)=>{

    try {

        const {Name,email,message} = req.body;

        const msg = {
            to: process.env.SENDGRID_EMAIL, 
            from: process.env.SENDGRID_EMAIL,
            subject: 'Message recieved from Contact Form',
            html: `<h3>Message from contact form</h3>
                   <p><b><u>Name</u></b></p>
                   <p>${Name}</p>
                   <p><b><u>Email</u></b></p>
                   <p>${email}</p>
                   <p><b><u>Message</u></b></p>
                   <p>${message}</p>`,
        }

        const data=await sgMail.send(msg);

        return res.json({success : true});
        
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal server error",success : false});
    }

});

router.get('/analytics',async (req,res)=>{

    try {

        const postCount = await Post.countDocuments();
        const commentCount = await Comments.countDocuments();
        const userCount = await User.countDocuments();
        const categoryCount =await Category.countDocuments();

        return res.json({postCount,commentCount,userCount,categoryCount,success : true});
        
    } catch (error) {
        
        return res.status(500).json({error : "Internal server error"});
    }

});

module.exports=router;