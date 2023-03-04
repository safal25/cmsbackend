const express=require('express');

const router=express.Router();

const {validateToken,isAdminUser}=require('../middlewares/checkAuth');

const Category=require('../models/Category');

router.post("/category",validateToken,isAdminUser,async (req,res)=>{

    try {

        const {name}=req.body;
        const slug=name.toLowerCase().replace(" ","-");

        const newCategory=await Category.create({name,slug});

        return res.json({category : newCategory, success : true});


    } catch (error) {
        return res.json({error : "Internal server error, please try again after sometime",success : false});
    }

});

module.exports=router;