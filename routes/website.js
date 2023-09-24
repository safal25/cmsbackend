const express = require('express');
const dotenv=require('dotenv');
const sgMail=require('@sendgrid/mail');

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

module.exports=router;