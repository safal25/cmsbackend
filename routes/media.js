const express=require('express');
const router=express.Router();
const ImageKit=require('imagekit');
const formidable=require('formidable');
const Image=require('../models/Image');
const fs=require('fs');

require('dotenv').config();
const {validateToken,canDeleteMedia}=require('../middlewares/checkAuth');


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

router.get('/get-images',validateToken,async(req,res)=>{
    try {

        const images=await Image.find().sort({createdAt : -1});

        return res.json({images,success : true});
        
    } catch (error) {
        return res.json({message : "Internal server error",success : false});
    }
});

router.delete('/delete-image/:id',validateToken,canDeleteMedia,async(req,res)=>{

    try {

        const imageId=req.params.id;

        await Image.findByIdAndDelete(imageId);

        return res.json({success : true});
        
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal server error",success : false})
    }

});

module.exports=router;
