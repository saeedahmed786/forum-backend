const express = require('express');
const Post = require('../Models/postModel');
const Edit = require('../Models/editsModal');
const Reply = require('../Models/replyModel');
const upload = require('./multer');
const {AuthenticatorJWT} = require('./authenticator');

const router  = express.Router();


function getAllPosts (posts, parentId) {
    const postsList = [];
    let post;
    if(parentId == null) {
        post = posts.filter(cat => cat.parentId == undefined);
    } else {
        post = posts.filter(cat => cat.parentId == parentId);
    }

    for(let sub of post) {
        postsList.push({
            _id: sub._id,
            title: sub.title,
            userId: sub.userId,
            summary: sub.summary,
            description: sub.description,
            postSubject: sub.postSubject,
            comments: sub.comments,
            type: sub.type,
            timeOfPost: sub.timeOfPost,
            children: getAllPosts(posts, sub._id)
        }) 
    } 
    return postsList; 
} 

router.get('/get', async (req, res) => {
    const findPosts = await Post.find().populate('userId');
    if(findPosts) {
        const posts = getAllPosts(findPosts);
        res.status(200).send(posts);
    } else {
        res.status(404).json({errorMessage: 'No Posts Found'});
    }
});

router.get('/get/post/:id', async (req, res) => {
    const findPost = await Post.findOne({_id: req.params.id}).populate('userId');
    if(findPost) {
        res.status(200).json(findPost);
    } else {
        res.status(404).json({errorMessage: 'No Post Found'});
    }
});

router.get('/get-by-subject/:id', async (req, res) => {
    const findPosts = await Post.find({postSubject: req.params.id}).populate('userId');
    if(findPosts) {
        const posts = getAllPosts(findPosts);
        res.status(200).send(posts);
    } else {
        res.status(404).json({errorMessage: 'No Posts Found'});
    }
});

router.get('/get/edits/:id', async (req, res) => {
    const findEdits = await Edit.find({parentId: req.params.id}).sort({ 'createdAt': -1 }).populate('userId');
    if(findEdits) {
        res.status(200).json(findEdits);
    } else {
        res.status(404).json({errorMessage: 'No Edits Found'});
    }
});

router.get('/get/replies/:id', async (req, res) => {
    const findReplies = await Reply.find({parentId: req.params.id}).sort({ 'createdAt': -1 }).populate('userId');
    if(findReplies) {
        res.status(200).json(findReplies);
    } else {
        res.status(404).json({errorMessage: 'No Replies Found'});
    }
});

router.post('/create', AuthenticatorJWT ,upload.array(''), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        summary: req.body.summary,
        postSubject: req.body.postSubject,
        userId: req.user._id,
        description: req.body.description,
        timeOfPost: req.body.timeOfPost,
        type: 'main'
    });
    const savePost = await post.save();
    if(savePost) {
        res.status(200).json({successMessage: 'Post created successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Post not created. Please try again'});
    }
});

router.post('/edits/create', AuthenticatorJWT ,upload.array(''), async (req, res) => {
    console.log(req.body.title);
    const post = new Post({
        title: req.body.title,
        summary: req.body.summary,
        postSubject: req.body.postSubject,
        userId: req.user._id,
        description: req.body.description,
        timeOfPost: req.body.timeOfPost,
        parentId: req.body.parentId,
        type: 'edits'
    });
    const savePost = await post.save();
    if(savePost) {
        res.status(200).json({successMessage: 'Edit added successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Edit not created. Please try again'});
    }
});

router.post('/replies/post', AuthenticatorJWT ,upload.array(''), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        summary: req.body.summary,
        postSubject: req.body.postSubject,
        userId: req.user._id,
        description: req.body.description,
        timeOfPost: req.body.timeOfPost,
        parentId: req.body.parentId,
        type: 'replies',
    });
    const savePost = await post.save();
    if(savePost) {
        res.status(200).json({successMessage: 'Reply Saved successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Reply not created. Please try again'});
    }
});

router.post('/versions/create', AuthenticatorJWT ,upload.array(''), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        summary: req.body.summary,
        postSubject: req.body.postSubject,
        userId: req.user._id,
        description: req.body.description,
        timeOfPost: req.body.timeOfPost,
        parentId: req.body.parentId,
        type: 'versions',
    });
    const savePost = await post.save();
    if(savePost) {
        res.status(200).json({successMessage: 'Version Saved successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Version not created. Please try again'});
    }
});



module.exports = router;