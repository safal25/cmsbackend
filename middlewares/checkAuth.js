require('dotenv').config();
const jwt=require("jsonwebtoken")
const User=require("../models/User");


const validateToken=async (req,res,next)=>{

    try {
        const authorization=req.header('authorization');
        if(!authorization){
            return res.status(401).json({error : "Unauthorized access",success : false});
        }
        const splitArr=authorization.split(" ");
        if(splitArr[0]!=="Bearer" || splitArr.length!==2){
            return res.status(400).json({error : "Invalid authorization scheme",success : false});
        }
        
        const authToken=splitArr[1];

        const data=await jwt.verify(authToken,process.env.JWT_SECRET);
        req.userId=data.userId;
    
        next();
        
    } catch (error) {

        console.log(error);
        return res.json({error : "Internal server error,please try again in sometime",success : false});
        
    }

}

const isAdminUser=async (req,res,next)=>{

    try {

        const user=await User.findById(req.userId);

        if(!user){
            res.status(401).json({error : "Unauthorized",success : false});
        }

        if(user.role!=="Admin"){
            res.status(403).json({error : "Forbidden",success : false});
        }
        
        next();
        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in sometime",success : false});
    }

}

const isAuthor=async (req,res,next)=>{

    try {

        const user=await User.findById(req.userId);

        if(!user){
            res.status(401).json({error : "Unauthorized",success : false});
        }

        if(user.role!=="Author"){
            res.status(403).json({error : "Forbidden",success : false});
        }
        
        next();
        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in sometime",success : false});
    }

}

module.exports={validateToken,isAdminUser,isAuthor};