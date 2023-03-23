const express=require('express');
const router=express.Router();
const ImageKit=require('imagekit');
const formidable=require('formidable');
const Image=require('../models/Image');
const fs=require('fs');

require('dotenv').config();
const {validateToken}=require('../middlewares/checkAuth');


const imagekit=new ImageKit({
    publicKey : process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey : process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGE_KIT_END_POINT
});

router.post('/upload-image',validateToken,(req,res)=>{

    try {

        const form=formidable({multiples : true});

        form.parse(req,async (err,fields,files)=>{
            if(err){
                return res.json({error : "Some error occured", success : false});
            }

           const rawData=fs.readFileSync(files.file.filepath);

           const result=await imagekit.upload({
                file : rawData,
                fileName : files.file.originalFilename
            });
    
            const image=await Image.create({
                url : result.url,
                postedBy : req.userId,
            });

            return res.json({image});
        })
    
        
    } catch (error) {
        
        console.log(error);
        return res.status(500).json({message : "Internal server error",success : false});
    }


});


module.exports=router;
