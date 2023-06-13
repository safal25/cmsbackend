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

router.put('/edit-user/:id',validateToken,isAdminUser,
            body('username','Username must have atleast 5 chars').isLength({min : 5}),
            body('password','Password must have atleat 8 chars').isLength({min : 8}),
            body('email','Email is invalid').isEmail(),
            async (req,res)=>{

                const errors=validationResult(req);
                if(!errors.isEmpty()){
                    return res.json({error : errors.array()[0].msg,success : false});
                }

                try {

                    const {username,email,role,checked,image}=req.body;

                    let user=null;
                    if(checked){

                        let salt=await bcrypt.genSalt(10);
                        let hash=await bcrypt.hash(req.body.password,salt);

                        user=await User.findByIdAndUpdate({_id : req.params.id},{
                            email,
                            username,
                            password : hash,
                            role,
                            image
                        },{new:true});

                    }
                    else{
                        user=await User.findByIdAndUpdate({_id : req.params.id},{
                            email,
                            username,
                            role,
                            image
                        },{new : true});
                    }

                    if(!user){
                        return res.status(400).json({message : "User not found"});
                    }

                    if(checked){
                        const msg = {
                            to: email, 
                            from: process.env.SENDGRID_EMAIL,
                            subject: 'Your account has been updated for CMS',
                            html: `<h1>Hi ${username},</h1> 
                                    <p>A new password has been generated for your CMS account, following are your creds</p>
                                    <p>UserName : ${username}</p>
                                    <p>Password : ${req.body.password}</p>`,
                        }
    
                        const data=await sgMail.send(msg);
                        console.log(data);
                    }

                    return res.json({success : true});

                    
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({error : "Internal server error",success : false});
                }

});



router.get('/get-users',validateToken,isAdminUser,async (req,res)=>{

    try {

        const allUsers=await User.find().populate('image','url').select('-password');

        return res.json({success : true, users : allUsers});
        
    } catch (error) {

        console.log(error);
        return res.json({success : false,message : 'Something went wrong, internal server error'});
    }

});

router.get('/get-user/:id',validateToken,isAdminUser,async (req,res)=>{

    try {

        const userId=req.params.id;
        const user=await User.findById(userId).populate('image','url').select('-password');
        if(!user){
            return res.status(400).json({message : 'User dosent exists'});
        }

        return res.json({success : true, user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message : 'Internal Server Error'});
    }
});

router.delete('/delete-user/:id',validateToken,isAdminUser,async (req,res)=>{

    try {

        if(req.userId===req.params.id){
            return res.status(400).json({ message : "You can not delete your own user"});
        }

        const deletedUser=await User.findByIdAndDelete(req.params.id);

        return res.json({success : true , message : "User deleted successfully"});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Internal Server Error"});
    }
})


module.exports=router;