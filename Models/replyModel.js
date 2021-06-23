const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    comments: {
        type: Array
    },
    parentId: {
        type: String,
        required: true
    },
    postSubject: {
        type: String,
        required: true
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
    timeOfPost: {
        type: String,
        required: true
    }
  
}, {timestamps: true}
);

const replyModel = new mongoose.model('Reply', replySchema);
module.exports = replyModel;
