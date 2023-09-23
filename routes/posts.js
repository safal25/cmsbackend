const express = require('express');

const router = express.Router();
const { validateToken, isAdminUser, canCreateRead, canUpdateDelete,canUpdateDeleteComments } = require("../middlewares/checkAuth");
const Post = require("../models/Post");
const Category = require("../models/Category");
const Comments = require("../models/Comments");
const { body, validationResult } = require("express-validator");
const slugify = require('slugify');


router.get("/get-post-count",async(req,res)=>{

    try {

        const count=await Post.countDocuments();
        return res.json({count,success : true});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : 'Internal server error'});
    }

});

router.get("/get-posts/:page" , async (req, res) => {

    try {

        const perPage=6;
        const page=parseInt(req.params.page);
        const posts = await Post.find().skip((page-1)*perPage).
                                               populate('featuredImage', 'url').
                                               sort({ createdAt: -1 }).
                                               limit(perPage);

        return res.json({ posts, success: true });
    } catch (error) {
        console.log(error);
        return res.json({ error: "Internal server error", success: false });
    }


});

router.get("/get-post-admin",async (req,res)=>{
    try {

        const posts=await Post.find().select('title slug');
        return res.json({success : true, posts});
        
    } catch (error) {
        return res.json({error : "Internal Server error",success : false});
    }
})

router.get("/get-posts/author", validateToken, async (req,res)=>{

    try {
        const posts=await Post.find({postedBy : req.userId}).sort({createdAt : -1});

        return res.json({posts, success : true});

    } catch (error) {

        return res.json({ error : "Internal server error",success : false});
        
    }


});



router.post("/create-post", validateToken, canCreateRead,
    body('title', 'Title should have atleast 5 chars').isLength({ min: 5 }),
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.json({ error: errors.array()[0].msg, success: false });
        }

        try {

            const { title, content, categories, featuredImage } = req.body;
            const slug = slugify(title);

            const checkPost = await Post.findOne({ slug });
            if (checkPost) {
                return res.json({ error: "Title already exists", success: "false" });
            }

            let ids = [];
            for (let i = 0; i < categories.length; i++) {
                let cat = await Category.findOne({ _id: categories[i] });
                ids.push(cat._id);
            }



            const newPost = await Post.create({
                title,
                categories: ids,
                content,
                postedBy: req.userId,
                slug,
                featuredImage,
            });

            return res.json({ post: newPost, success: true });


        } catch (error) {
            console.log(error);
            return res.json({ error: "Internal server error", success: false });
        }
    });

router.get('/get-post/:slug', async (req, res) => {

    try {

        const slug = req.params.slug;

        const post = await Post.findOne({ slug }).populate('featuredImage', 'url')
            .populate('postedBy', 'username')
            .populate({ path: 'categories', select: 'name' });
        

        const comments = await Comments.find({postId : post._id}).populate('postedBy','username');

        return res.json({ post, comments,success: true });


    } catch (error) {
        console.log(error);
        return res.json({ message: "Internal server error", success: false });
    }


});

router.delete('/delete-post/:id', validateToken, canUpdateDelete, async (req, res) => {

    try {
        const postId = req.params.id;
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.json({ error: "Post not found", success: false });
        }
        res.json({ post: deletedPost, success: true });
    } catch (err) {
        console.error(err);
        res.json({ error: 'Internal Server error', success: false });
    }

});

router.put("/edit-post/:id", validateToken, canUpdateDelete,
    body('title', 'Title should have atleast 5 chars').isLength({ min: 5 }),
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.json({ error: errors.array()[0].msg, success: false });
        }

        try {

            const { title, content, categories, featuredImage } = req.body;
            const slug = slugify(title);


            let ids = [];
            for (let i = 0; i < categories.length; i++) {
                let cat = await Category.findOne({ _id: categories[i] });
                ids.push(cat._id);
            }

            const post = await Post.findByIdAndUpdate({ _id: req.params.id }, {
                title,
                categories: ids,
                content,
                slug,
                featuredImage,
            }, { new: true });

            if(!post){
                return res.json({error : "Post not found",success : false});
            }

            return res.json({post,success : true});

        } catch (error) {
            console.log(error);
            return res.json({ error: "Internal Server error", success: false });
        }
    });

router.post('/add-comment/:postId',validateToken,async (req,res)=>{
        try {

            const postId=req.params.postId;

            const {comment} = req.body;

            let newComment = await Comments.create({
                content : comment,
                postedBy : req.userId,
                postId
            })

            newComment = await newComment.populate("postedBy","username");

            return res.json({newComment , success : true});

        } catch (error) {
            console.log(error);
            return res.json({ error: "Internal Server error", success: false });
        }
});

router.get('/get-comment-count',async (req,res)=>{

    try {

        const count =  await Comments.countDocuments();

        return res.json({count,success : true});
        
    } catch (error) {

        console.log(error);
        return res.json({message : "Internal Server error",success : false});
        
    }

});

router.get('/get-comments',validateToken,isAdminUser,async (req,res)=>{

    try {
        const page=parseInt(req.query.page);
        const perPage=5;
    
        const comments = await Comments.find().skip((page-1)*perPage).
                                               populate('postedBy','username').
                                               populate('postId','title slug').
                                               limit(perPage)
    
        return res.json({comments,success : true});
        
    } catch (error) {
        console.log(error);
        return res.json({message : "Internal Server error",success : false});
    }

});

router.delete('/delete-comment',validateToken,canUpdateDeleteComments,async (req,res)=>{

    try {
        
        const comment=await Comments.findByIdAndDelete(req.query.id);
        if(!comment){
            return res.json({error : "Comment not found",success : false});
        }

        return res.json({comment , success : true});
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false});
    }

});

router.put('/update-comment',validateToken,canUpdateDeleteComments,async (req,res)=>{

    try {

        const {content}=req.body;

        const comment = await Comments.findByIdAndUpdate(req.query.id,{content},{new : true});

        if(!comment){
            return res.json({error : "Comment not found", success : false});
        }

        return res.json({comment,success : true});
        
    } catch (error) {
        console.log(error);
        return res.json({error : "Internal Server error",success : false});
    }

});

module.exports = router;