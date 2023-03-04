const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const User=require('../models/User');
const Token=require('../models/token');
const {randomBytes}=require('node:crypto');
const sgMail=require('@sendgrid/mail');
const {body,validationResult}=require('express-validator');

dotenv.config();

const JWT_SECRET=process.env.JWT_SECRET;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//route for signup
router.post("/signup", 
            body('username','Username must have atleast 5 chars').isLength({min : 5}),
            body('password','Password must have atleat 8 chars').isLength({min : 8}),
            body('email','Email is invalid').isEmail(),
            async (req,res)=>{
            const errors=validationResult(req);
            if(!errors.isEmpty()){
                //returning the first error encountered
                return res.json({error : errors.array()[0].msg,success : false});
            }
            try {

                const {username,email}=req.body;

                const user = await User.findOne({email : email});
                if(user){
                    return res.json({error : 'A user already exists with same email',success : false});
                }

                let salt=await bcrypt.genSalt(10);
                let hash=await bcrypt.hash(req.body.password,salt);

                const newuser=await User.create({
                    email : email,
                    username : username,
                    password : hash
                });

                const data={
                    userId : newuser.id
                }

                const {password,...responseUser}=newuser._doc;

                const token=await jwt.sign(data,JWT_SECRET);

                return res.json({token : token,user : responseUser,success : true});

                
            } catch (error) {
                return res.json({error : "Internal server error",success : false});
            }
});

//route for signin
router.post("/signin",
             body('email','Email is invalid').isEmail(),
             body('password','Enter valid password').isLength({min : 8}),
             async (req,res)=>{
                const errors=validationResult(req);
                if(!errors.isEmpty()){
                    //returning the first error encountered
                    return res.json({error : errors.array()[0].msg,success : false});
                }
                try {

                    const {email}=req.body;
                    const user=await User.findOne({email : email});
                    if(!user){
                        return res.json({error : 'Please enter valid credentials',success : false});
                    }

                    const validPassword=await bcrypt.compare(req.body.password,user.password);

                    if(!validPassword){
                        return res.json({error : 'Please enter valid credentials',success: false});
                    }

                    const data={
                        userId : user.id
                    };
                    
                    
                    const token=await jwt.sign(data,JWT_SECRET);
                    
                    const{password , ...responseUser}=user._doc;

                    return res.json({token : token, user : responseUser, success : true});


                    
                } catch (error) {
                    return res.json({error : "Internal server error",success : false});
                }
});

router.post('/forgot-password',
            body('email','Please enter a valid email').isEmail(),
            async (req,res)=>{
                const errors=validationResult(req);
                if(!errors.isEmpty()){
                    return res.json({error : errors.array()[0].msg,success : false});
                }

                try {
                    const {email}=req.body;

                    const user=await User.findOne({email});
                    if(!user){
                        return res.json({error : 'User does not exist',success : false});
                    }
                    
                    const buffer=await randomBytes(9);
                    const code=buffer.toString('hex');
                    const newToken=await Token.create({
                        userId : user._id,
                        code : code
                    });


                    const msg = {
                        to: user.email, 
                        from: process.env.SENDGRID_EMAIL,
                        subject: 'Password reset code',
                        html: `<p>Your password reset code is : <strong>${code}</strong> please reset before it expires in 1 hour</p>`,
                    }

                    const data=await sgMail.send(msg);
                    return res.json({success : true});
                    
                } catch (error) {
                    return res.json({error : "Internal server error please try again later after some time or contact support",success : false});
                }
});

router.post('/reset-password',
            body('password','Password must have atleat 8 chars').isLength({min : 8}),
            body('email','Email is invalid').isEmail(),
            async (req,res)=>{

                const errors=validationResult(req);

                if(!errors.isEmpty()){
                    return res.json({error : errors.array()[0].msg,success : false});
                }

                const {email,code,password}=req.body;

                try {

                    let user = await User.findOne({email});
                    if(!user){
                        return res.json({error : 'User not found',success : false});
                    }

                    let token=await Token.findOne({userId : user._id,code : code});

                    if(!token){
                        return res.json({error : 'Please enter valid code',success : false});
                    }

                    await Token.deleteMany({userId : user._id});

                    let salt=await bcrypt.genSalt(10);
                    let hash=await bcrypt.hash(password,salt);

                    user.password=hash;
                    await user.save();
                    
                    

                    return res.json({success : true});



                    
                } catch (error) {
                    return res.json({error : "Internal server error please try again later after some time or contact support",success : false});
                }
            })

module.exports=router;
