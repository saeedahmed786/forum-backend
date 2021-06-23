const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    postSubject: {
        type: String,
        required: true
    },
    parentId: {
        type: String
    },
    type: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref : 'User', 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: {
        type: Array
    },
    timeOfPost: {
        type: String,
        required: true
    }
  
}, {timestamps: true}
);

const postModel = new mongoose.model('Post', postSchema);
module.exports = postModel;
