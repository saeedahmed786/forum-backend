const mongoose = require('mongoose');

const editSchema = new mongoose.Schema({
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

const editModel = new mongoose.model('Edit', editSchema);
module.exports = editModel;
