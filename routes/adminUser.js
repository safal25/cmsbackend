const express=require('express');
const router=express.Router();
const User=require('../models/User');
const bcrypt=require('bcrypt');
const {body,validationResult}=require('express-validator');
const {validateToken,isAdminUser}=require('../middlewares/checkAuth');
const dotenv=require('dotenv');
const sgMail=require('@sendgrid/mail');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);



router.post('/create-user',validateToken,isAdminUser,
            body('username','Username must have atleast 5 chars').isLength({min : 5}),
            body('password','Password must have atleat 8 chars').isLength({min : 8}),
            body('email','Email is invalid').isEmail(),
            async (req,res)=>{

                const errors=validationResult(req);
                if(!errors.isEmpty()){
                    return res.json({error : errors.array()[0].msg,success : false});
                }

                try {

                    const {username,email,role,checked}=req.body;

                    const user=await User.findOne({email});

                    if(user){
                        return res.json({error : "User with same email exists",success : false});
                    }


                    let salt=await bcrypt.genSalt(10);
                    let hash=await bcrypt.hash(req.body.password,salt);

                    const newuser=await User.create({
                        email,
                        username,
                        password : hash,
                        role,
                    });

                    const {password,...rest}=newuser._doc;

                    if(checked){
                        const msg = {
                            to: email, 
                            from: process.env.SENDGRID_EMAIL,
                            subject: 'Your account has been created for CMS',
                            html: `<h1>Hi ${username},</h1> 
                                    <p>Following are the credentials for your cms account we recommend changing the password after first login</p>
                                    <p>UserName : ${username}</p>
                                    <p>Password : ${req.body.password}</p>`,
                        }
    
                        const data=await sgMail.send(msg);
                        console.log(data);
                    }

                    return res.json({user : rest,success : true});

                    
                } catch (error) {
                    console.log(error);
                    return res.json({error : "Internal server error",success : false});
                }

});

module.exports=router;