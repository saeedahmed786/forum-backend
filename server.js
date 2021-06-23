const express = require('express');
const userRoutes = require('./Routes/userRoutes');
const postRoutes = require('./Routes/postRoutes');
const subjectRoutes = require('./Routes/subjectRoutes');
const commentRoutes = require('./Routes/CommentRoutes');
const mongoose  = require('mongoose');
const config = require('./config/dev');
const path  = require('path');
const app = express();
const cors = require('cors');
app.use(cors({ origin: true }));

/******************************************MiddleWares  ********************************************/
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname+ '/uploads'));
app.use('/api/users', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/subject', subjectRoutes); 
app.use('/api/posts/comments', commentRoutes);

/******************************************MongoDb Connection********************************************/

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log('MongoDb Connected')).catch(err => console.log(err));

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('./frontend/build'));

    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname , 'frontend', 'build', 'index.html'));

    });
}
 app.listen(process.env.PORT || 8000, () => console.log('Listening to port 8000'));


 