require('dotenv').config();
const jwt=require("jsonwebtoken")
const User=require("../models/User");
const Post=require("../models/Post");
const Image=require("../models/Image");
const Comments=require("../models/Comments");

const validateToken=async (req,res,next)=>{

    try {
        const authorization=req.header('Authorization');
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
           return res.status(401).json({error : "Unauthorized",success : false});
        }

        if(user.role!=="Admin"){
           return res.status(403).json({error : "Forbidden",success : false});
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
            return res.status(401).json({error : "Unauthorized",success : false});
        }

        if(user.role!=="Author"){
            return res.status(403).json({error : "Forbidden",success : false});
        }
        
        next();
        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in sometime",success : false});
    }

}

const canCreateRead=async (req,res,next)=>{
    try {
        const user=await User.findById(req.userId);

        if(!user){
            return res.status(401).json({error : "Unauthorized",success : false});
        }

        switch(user.role){
            case "Admin":
                next();
                break;
            case "Author":
                next();
                break;
            default:
                return res.status(401).json({error : "Unauthorized",success : false});
        }

    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false});
    }

}

const canUpdateDelete=async (req,res,next)=>{

    try {
        const user=await User.findById(req.userId);

        if(!user){
            return res.status(401).json({error : "Unauthorized",success : false});
        }

        switch(user.role){
            case "Admin":
                next();
                break;
            case "Author":
                const post=await Post.findById(req.params.id);

                if(user._id.toString()===post.postedBy.toString()){
                    next();
                }
                else{
                    return res.status(401).json({error : "Unauthorized",success : false});
                }
                break;
            default:
                return res.status(401).json({error : "Unauthorized",success : false});
        }

    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false});
    }
}

const canDeleteMedia=async (req,res,next)=>{
    try {

        const user=await User.findById(req.userId);

        if(!user){
            return res.status(401).json({error : "Unauthorized",success : false});
        }

        switch(user.role){
            case "Admin":
                next();
                break;
            case "Author":
                const img=await Image.findById(req.params.id);

                if(user._id.toString()===img.postedBy.toString()){
                    next();
                }
                else{
                    return res.json({error : "You are not authorized to delete this image",success : false});
                }
                break;
            default:
                return res.status(401).json({error : "Unauthorized",success : false});
        }

        
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false});
    }
}

const canUpdateDeleteComments = async (req,res,next)=>{
    try {

        const user=await User.findById(req.userId);

        if(!user){
            return res.status(401).json({error : "Unauthorized", success : false});
        }

        switch(user.role){
            case "Admin":
                next();
                break;
            case "Author":
                const commentAuth = await Comments.findById(req.query.id);

                if(commentAuth.postedBy.toString()===user._id.toString()){
                    next();
                }
                else{
                    return res.json({error : "You cannot delete someone else's comments", success : false});
                }
                break;
            case "Subscriber":
                const commentSub = await Comments.findById(req.query.id);

                if(commentSub.postedBy.toString()===user._id.toString()){
                    next();
                }
                else{
                    return res.json({error : "You cannot delete someone else's comments", success : false});
                }
                break;
            default :
                return res.status(401).json({error : "Unauthorized",success : false});
        }
        
        
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false})
    }
}

module.exports={validateToken,isAdminUser,isAuthor,canUpdateDelete,canCreateRead,canDeleteMedia,canUpdateDeleteComments};