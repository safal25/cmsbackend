const express = require('express');

const router=express.Router();
const {validateToken,isAdminUser}=require("../middlewares/checkAuth");
const Post=require("../models/Post");
const Category=require("../models/Category");
const {body,validationResult}=require("express-validator");


router.get("/get-posts",async (req,res)=>{

    try {
        const posts=await Post.find().sort({createdAt : -1});

        return res.json({posts,success : true});
    } catch (error) {
        return res.json({error : "Internal server error",success : false});
    }
    

});


router.post("/create-post",validateToken,isAdminUser,
            body('title','Title should have atleast 5 chars').isLength({min : 5}),
            async (req,res)=>{

                const errors=validationResult(req);

                if(!errors.isEmpty()){
                    return res.json({error : errors.array()[0].msg,success : false});
                }

                try {

                    const {title,content,categories}=req.body;
                    const slug=title.toLowerCase().replace(" ","-");

                    const checkPost=await Post.findOne({slug});
                    if(checkPost){
                        return res.json({error : "Title already exists",success : "false"});
                    }

                    let ids=[];
                    for(let i=0; i<categories.length; i++){
                        let cat=await Category.findOne({_id : categories[i]});
                        ids.push(cat._id);
                    }



                    const newPost=await Post.create({
                        title,
                        categories : ids,
                        content,
                        postedBy : req.userId,
                        slug
                    });

                    return res.json({post : newPost,success : true});

                    
                } catch (error) {
                    console.log(error);
                    return res.json({error : "Internal server error",success : false});
                }
});

module.exports=router;