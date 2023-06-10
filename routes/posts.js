const express = require('express');

const router = express.Router();
const { validateToken, isAdminUser, canCreateRead, canUpdateDelete } = require("../middlewares/checkAuth");
const Post = require("../models/Post");
const Category = require("../models/Category");
const { body, validationResult } = require("express-validator");
const slugify = require('slugify');

router.get("/get-posts" , async (req, res) => {

    try {
        const posts = await Post.find().populate('featuredImage', 'url').sort({ createdAt: -1 });

        return res.json({ posts, success: true });
    } catch (error) {
        console.log(error);
        return res.json({ error: "Internal server error", success: false });
    }


});

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



        return res.json({ post, success: true });


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


module.exports = router;