const express=require('express');
const slugify=require('slugify');
const router=express.Router();

const {validateToken,isAdminUser,canCreateRead}=require('../middlewares/checkAuth');

const Category=require('../models/Category');

router.post("/category",validateToken,isAdminUser,async (req,res)=>{

    try {

        const {name}=req.body;
        const slug=slugify(name);

        const newCategory=await Category.create({name,slug});

        return res.json({category : newCategory, success : true});


    } catch (error) {
        return res.json({error : "Internal server error, please try again after sometime",success : false});
    }

});

router.get("/categories",validateToken,canCreateRead,async (req,res)=>{

    try {

        const categories=await Category.find().sort({createdAt : -1});

        return res.json({categories,success : true});
        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in some time",success : false})
    }

})

router.delete("/category/:slug",validateToken,isAdminUser,async (req,res)=>{

    try {

        const {slug}=req.params;

        const category=await Category.findOneAndDelete({slug});

        return res.json({success : true});
        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in some time",success : false})
    }

});

router.put("/category/:slug",validateToken,isAdminUser,async (req,res)=>{
    try {

        const {slug}=req.params;
        const {name}=req.body;
        // console.log(name);
        const newSlug=slugify(name);
        // console.log(newSlug);
        const category=await Category.findOneAndUpdate({slug},
                                                        {name,slug : newSlug}
                                                        ,{new : true});
        // console.log(category);
        return res.json({category,success : true});

        
    } catch (error) {
        return res.json({error : "Internal server error, please try again in some time",success : false})
    }
});


module.exports=router;