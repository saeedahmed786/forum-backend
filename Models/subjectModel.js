const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mainSubjectName: {
        type: String
         
     },
    parentId: {
        type: String,
    }
  
}, {timestamps: true}
);

const subjectModal = new mongoose.model('Subject', subjectSchema);
module.exports = subjectModal;
