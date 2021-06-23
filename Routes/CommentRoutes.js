const express = require('express');
const { AuthenticatorJWT } = require('./authenticator');
const Comment = require('../Models/commentModal'); 
const Post = require('../Models/postModel');
const Edit = require('../Models/editsModal'); 
const Reply = require('../Models/replyModel'); 
const router = express.Router();
const { v4: uuidv4 } = require('uuid');





router.get('/getComments/:id', async(req, res) => {
    await Comment.find({postId: req.params.id}).populate('user').exec((err, result) => {
        if(result) {
            return res.status(200).json({result});
        }
         else {
            return res.status(404).json({errorMessage: 'No Comments found', err});
         }
    });
   
})


router.post('/home/create', AuthenticatorJWT,  async (req, res) => {
    const findPost = await Post.findOne({
        _id: req.body.postId 
    });
    if(findPost) {
        let comments = [];
        comments.push({
            commentId: uuidv4(),
            text: req.body.commentValue,
            user: req.user._id,
            userPicture: req.body.userPicture,
            username: req.body.username,
            postId: req.body.postId,
            responseTo: req.body.responseTo,
            timeOfSubmit: req.body.timeOfSubmit,
        })
    Post.findOneAndUpdate(
        {_id: req.body.postId},
        {$push: { comments: comments}},
        {new: true},
        (error, data) => {
            if(data) {
                Post.find().sort({ 'createdAt': -1 }).populate('userId').exec((err, result) => {
                    if(result) {
                       res.status(200).json({result});
                    }
                    else {
                        res.status(404).json({errorMessage: 'No posts.', err});
                    }
                })
            }
             if(error) {
                return res.status(404).json({errorMessage: 'Comment not saved.'});
             }
        });
    }
}); 


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
router.post('/main-post/create', AuthenticatorJWT,  async (req, res) => {
    const findPost = await Post.findOne({
        _id: req.body.postId 
    });
    console.log(req.body.postId);
    if(findPost) {
        let comments = [];
        comments.push({
            commentId: uuidv4(),
            text: req.body.commentValue,
            user: req.user._id,
            userPicture: req.body.userPicture,
            username: req.body.username,
            postId: req.body.postId,
            responseTo: req.body.responseTo,
            timeOfSubmit: req.body.timeOfSubmit,
        })
    Post.findOneAndUpdate(
        {_id: req.body.postId},
        {$push: { comments: comments}},
        {new: true},
        (error, result) => {
            if(result) {
                Post.find().populate('userId').exec((error, postsFound) => {
                    if(postsFound) {
                        const posts = getAllPosts(postsFound);
                        res.status(200).send(posts);
                    } else {
                        res.status(404).json({errorMessage: 'No Posts Found'});
                    }
                })
               
            }
             if(error) {
                return res.status(404).json({errorMessage: 'Comment not saved.'});
             }
        });
    }
}); 

router.post('/individual/create', AuthenticatorJWT,  async (req, res) => {
    const findPost = await Post.findOne({
        _id: req.body.postId 
    });
    if(findPost) {
        let comments = [];
        comments.push({
            commentId: uuidv4(),
            text: req.body.commentValue,
            user: req.user._id,
            userPicture: req.body.userPicture,
            username: req.body.username,
            postId: req.body.postId,
            responseTo: req.body.responseTo,
            timeOfSubmit: req.body.timeOfSubmit,
        })
    Post.findOneAndUpdate(
        {_id: req.body.postId},
        {$push: { comments: comments}},
        {new: true},
        (error, result) => {
            if(result) {
                Post.find({_id: req.body.postId}).populate('userId').exec((error, postsFound) => {
                    if(postsFound) {
                        res.status(200).send(postsFound);
                    } else {
                        res.status(404).json({errorMessage: 'No Post Found'});
                    }
                })
               
            }
             if(error) {
                return res.status(404).json({errorMessage: 'Comment not saved.'});
             }
        });
    }
}); 

router.post('/edits/create', AuthenticatorJWT,  async (req, res) => {
    const findPost = await Edit.findOne({
        _id: req.body.postId 
    });
    if(findPost) {
        let comments = [];
        comments.push({
            commentId: uuidv4(),
            text: req.body.commentValue,
            user: req.user._id,
            userPicture: req.body.userPicture,
            username: req.body.username,
            postId: req.body.postId,
            responseTo: req.body.responseTo,
            timeOfSubmit: req.body.timeOfSubmit,
        })
    Edit.findOneAndUpdate(
        {_id: req.body.postId},
        {$push: { comments: comments}},
        {new: true},
        (error, result) => {
            if(result) {
                Edit.find({parentId: result.parentId}).sort({ 'createdAt': -1 }).populate('userId').exec((error, edits) => {
                    if(edits) {
                        res.status(200).json(edits);
                    } else {
                        res.status(404).json({errorMessage: 'No Edits Found'});
                    }
                });                
            }
             if(error) {
                return res.status(404).json({errorMessage: 'Comment not saved.'});
             }
        });
    }
}); 

router.post('/replies/create', AuthenticatorJWT,  async (req, res) => {
    const findReply = await Reply.findOne({
        _id: req.body.postId 
    });
    if(findReply) {
        let comments = [];
        comments.push({
            commentId: uuidv4(),
            text: req.body.commentValue,
            user: req.user._id,
            userPicture: req.body.userPicture,
            username: req.body.username,
            postId: req.body.postId,
            responseTo: req.body.responseTo,
            timeOfSubmit: req.body.timeOfSubmit,
        })
    Reply.findOneAndUpdate(
        {_id: req.body.postId},
        {$push: { comments: comments}},
        {new: true},
        (error, result) => {
            if(result) {
                Reply.find({parentId: result.parentId}).sort({ 'createdAt': -1 }).populate('userId').exec((error, reply) => {
                    if(reply) {
                        res.status(200).json(reply);
                    } else {
                        res.status(404).json({errorMessage: 'No reply Found'});
                    }
                });                
            }
             if(error) {
                return res.status(404).json({errorMessage: 'Comment not saved.'});
             }
        });
    }
}); 
 
router.post('/main-post/comments/delete', AuthenticatorJWT,  async(req, res) => {
    Post.updateOne({ _id: req.body.postId }, { "$pull": { "comments": { "commentId": req.body.commentId} }}, { safe: true, multi:true, new: true }, function(err, obj) {
        if(obj) {
            Post.find().populate('userId').exec((error, postsFound) => {
                if(postsFound) {
                    const posts = getAllPosts(postsFound);
                    res.status(200).send(posts);
                } else {
                    res.status(404).json({errorMessage: 'No Posts Found'});
                }
            })
           
        } else {
            console.log(err);
        }
    });
    
});

router.post('/individual/comments/delete', AuthenticatorJWT,  async(req, res) => {
    Post.updateOne({ _id: req.body.postId }, { "$pull": { "comments": { "commentId": req.body.commentId} }}, { safe: true, multi:true, new: true }, function(err, obj) {
        if(obj) {
            Post.find({_id: req.body.postId}).populate('userId').exec((error, postsFound) => {
                if(postsFound) {
                    res.status(200).send(postsFound);
                } else {
                    res.status(404).json({errorMessage: 'No Post Found'});
                }
            })
           
        } else {
            console.log(err);
        }
    });
    
});

router.post('/edits/comments/delete', AuthenticatorJWT,  async(req, res) => {
    Edit.updateOne({ _id: req.body.postId }, { "$pull": { "comments": { "commentId": req.body.commentId} }}, { safe: true, multi:true, new: true }, function(err, obj) {
        if(obj) {
            Edit.find({parentId: req.body.parentId}).sort({ 'createdAt': -1 }).populate('userId').exec((error, result) => {
                if(result) {
                    res.status(200).json({result});
                } else {
                    res.status(404).json({errorMessage: 'No Edits Found'});
                }
            })
     }
    });
    
})

router.post('/replies/comments/delete', AuthenticatorJWT,  async(req, res) => {
    Reply.updateOne({ _id: req.body.postId }, { "$pull": { "comments": { "commentId": req.body.commentId} }}, { safe: true, multi:true, new: true }, function(err, obj) {
        if(obj) {
            Reply.find({parentId: req.body.parentId}).sort({ 'createdAt': -1 }).populate('userId').exec((error, result) => {
                if(result) {
                    res.status(200).json({result});
                } else {
                    res.status(404).json({errorMessage: 'No Edits Found'});
                }
            })
     }
    });
    
})



module.exports = router;