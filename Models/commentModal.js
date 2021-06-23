const mongoonse = require('mongoose');

const commentSchema = new mongoonse.Schema({
    user: {
        type: mongoonse.Schema.Types.ObjectId, 
        ref : 'User', 
        required: true
     },
    
     postId: {
      type: mongoonse.Schema.Types.ObjectId, 
      ref : 'Post', 
      required: true
   },
   
      responseTo: {
         type: mongoonse.Schema.Types.ObjectId
      
      },
   text: {
       type: String,
       required: true
   },
   timeOfSubmit: {
      type: String,
   }
   
}, {timestamps: true}

);

const commentModal = new mongoonse.model('Comment', commentSchema);

module.exports = commentModal;