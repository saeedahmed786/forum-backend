const express = require('express');
const upload = require('./multer');
const User = require('../Models/userModel');
const cloudinary = require('./cloudinary');
var fs = require('fs');
var bcrypt = require('bcryptjs');
const {jwtSecret} = require('../config/dev');
const jwt = require('jsonwebtoken');
const cloudinaryCon = require('./cloudinaryConfig');
const {AuthenticatorJWT} = require('./authenticator');
const {isAdmin} = require('./authenticator');
const { api_key, DOMAIN } = require('../config/dev');
const Mailgun = require('mailgun-js');
const crypto = require('crypto');

const router  = express.Router();


router.get('/get', async (req, res) => {
    const findUsers = await User.find();
    if(findUsers) {
        res.status(200).json(findUsers);
    } else {
        res.status(404).json({errorMessage: 'No Users Found'});
    }
});
router.get('/get/:id', async (req, res) => {
    const findUser = await User.findOne({_id: req.params.id});
    if(findUser) {
        res.status(200).json(findUser);
    } else {
        res.status(404).json({errorMessage: 'No Users Found'});
    }
})
router.post('/signup', upload.single('file'), async(req, res) => {
    
    const ifEmailAlreadyPresent = await User.findOne({email: req.body.email});
    const ifUsernameAlreadyPresent = await User.findOne({username: req.body.username});
    if(ifEmailAlreadyPresent) {
        res.status(201).json({errorMessage: 'Email already exists. Please try another one.'});
    }
    else if(ifUsernameAlreadyPresent) {
        res.status(201).json({errorMessage: 'Username already exists. Please try another one.'});
    }
    else if(req.body.password !== req.body.confirm){
        res.status(202).json({errorMessage: "The two passwords you entered don't match."})
    }
    else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        const {path}   = req.file;
        const uploader = async(path) => await cloudinary.uploads(path, 'Forum/User/Images');
        const newPath = await uploader(path);
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: hash,
        userPicture: newPath.url,
        cloudinary_id: newPath.id
    });

    const saveUser = await user.save();
    if(saveUser) {
        res.status(200).json({successMessage: 'Account created successfuly!. Please Sign in.'});
    } else {
        res.status(400).json({errorMessage: 'Account not created. Please try again'});
    }
  }
});
        
router.post('/login', upload.any(), async(req, res) => {
    console.log(req.body.email);
   const findUser = await User.findOne({
        $or:[{email: req.body.email},{username:req.body.email}]
    });

    if(findUser) {
        const checkPassword =  bcrypt.compareSync(req.body.password, findUser.password);
        if(checkPassword){
            const payload = {
                user: {
                    _id: findUser._id,
                    role: findUser.role
                }
            }
            jwt.sign(payload, jwtSecret ,(err, token) => {
                if(err)  res.status(400).json({errorMessage: 'Jwt Error'})
    
            const {_id, firstName, role, lastName, username, email, userPicture} = findUser;
            res.status(200).json({
                _id,
                role,
                firstName, 
                lastName, 
                username, 
                email, 
                userPicture, 
                token,
                successMessage: 'Logged In Successfully',
               
            });
        });
        } else {
            res.status(201).json({errorMessage: 'Incorrect username or password.'})
        }

    } else {
        res.status(201).json({errorMessage: 'Incorrect username or password.'})
    }   
});

router.post('/edit/:id', AuthenticatorJWT, isAdmin ,upload.single('file'), async(req, res) => {
    const findUser = await User.findOne({_id : req.params.id});
    if(req.file) {
        const imgUrl = findUser.cloudinary_id;
        const del =  cloudinaryCon.uploader.destroy(imgUrl);
        const { path } = req.file;
        const uploading =  await cloudinary.uploads(path, 'UserImages');
        imageUpload = uploading.url;
        cloudinary_id = uploading.id
        fs.unlinkSync(path);
    } 
    else if(req.body.image) {
         imageUpload = req.body.image;
         cloudinary_id = findUser.cloudinary_id;

    }
    if(findUser) {
        findUser.firstName = req.body.firstName,
        findUser.lastName = req.body.lastName,
        findUser.email = req.body.email,
        findUser.username = req.body.username,
        findUser.phone = req.body.phone,
        findUser.city = req.body.city,
        findUser.country = req.body.country,
        findUser.DOB = req.body.DOB,
        findUser.userPicture = imageUpload,
        findUser.cloudinary_id = cloudinary_id

        const saveUser = await findUser.save();
        if(saveUser) {
            res.status(200).json({successMessage: 'User Updated Successfully'})
        } else (
            res.status(400).json({errorMessage: 'User could not be Updated.'})
        )
    } else {
        res.status(404).json({errorMessage: 'User not found.'})
    }
});


router.post('/change/password', AuthenticatorJWT,  async(req, res) => {
      console.log(req.body.oldPassword, req.body.newPassword);
      if(req.body.newPassword !== req.body.confirmNewPassword){
           res.status(400).json({errorMessage: 'Passwords do not match.'})
       }  

       else {
                const findUser = await User.findById({_id: req.user._id});
                if(findUser) {
                    const checkPassword =  bcrypt.compareSync(req.body.oldPassword, findUser.password);
                    if(checkPassword) {
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.newPassword, salt);
                        findUser.password = hash;
                        findUser.save((error, result) => {
                            if(error) {
                                res.status(400).json({errorMessage: 'Failed to change password'});
                            } else {
                                res.status(200).json({successMessage: 'Password changed Successfully.'})
                            }
                        })
                    }  else {
                        res.status(201).json({errorMessage: 'Please enter correct old password.'})
                    }
                  
                }
       }
});


router.post('/admin/change/password/:id', AuthenticatorJWT, isAdmin,  async(req, res) => {
    if(req.body.newPassword !== req.body.confirmNewPassword){
         res.status(400).json({errorMessage: 'Passwords do not match.'})
     }  

     else {
              const findUser = await User.findById({_id: req.params.id});
              if(findUser) {
                      var salt = bcrypt.genSaltSync(10);
                      var hash = bcrypt.hashSync(req.body.newPassword, salt);
                      findUser.password = hash;
                      findUser.save((error, result) => {
                          if(error) {
                              res.status(400).json({errorMessage: 'Failed to change password'});
                          } else {
                              res.status(200).json({successMessage: 'Password changed Successfully.'})
                          }
                      })                
              }
     }
});

router.delete('/delete/:id', AuthenticatorJWT, isAdmin, async(req, res) => {
    const findUser = await User.findOne({_id: req.params.id});
    if (findUser) {
       const del = findUser.remove();
       if(del){
        res.status(200).json({successMessage: 'User Deleted Successfully'});
      } 
        else {
          res.status(400).json({errorMessage: 'User could not be deleted. Please Try Again'});
        } 
        

    }  else {
        res.status(404).json({errorMessage: 'User Not Found.'})
    }

});





/****************************************************** Forgot Password ***********************************************/
router.post('/reset-password', async(req, res) => {
    const mg = Mailgun({apiKey: api_key, domain: DOMAIN});
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            console.log(error);
        } 
        const token = buffer.toString("hex");
       User.findOne({email: req.body.email}).then(user => {
           if(!user) {
               res.status(201).json({errorMessage: 'Email does not exist'});
           } 
           user.resetToken = token;
           user.expireToken = Date.now() + 3600000;
           user.save((err, result) => {
               if(err) {
                   res.status(400).json({errorMessage: 'Token saving failed'});
               }
                if(result) {
                            let url = '';
                            if(process.env.NODE_ENV === 'production') {
                                url = `http://logger.pravdoscope.com/reset/${token}`
                            } else {
                              url =  `http://localhost:3000/reset/${token}`
                            }
                    const data = {
                        from: 'no-reply@logger.pravdoscope.comm',
                        to: req.body.email,
                        subject: 'Password Reset Link',
                        html: `<p>Click this <a href = ${url}>${url}</a> to reset password.</p>`,
                    };
                    mg.messages().send(data, function (error, body) {
                        if(error) {
                            res.status(404).json({err: 'Message not set!'})
                        }
                         else {
                            res.status(200).json({successMessage: 'Check your Inbox!', body});
                         }
                        });

                }
           })

       })
    })
   
   
});

router.post('/update-password',  async(req, res) => { 
    if(req.body.password !== req.body.confirm){
         res.status(400).json({errorMessage: 'Passwords do not match.'})
     }  

     else {
              await User.findOne({resetToken: req.body.token, expireToken: {$gt: Date.now()}}).then(user => {
              if(!user) {
                  res.status(201).json({errorMessage: 'Try again. Session expired!'});
              }    
              if(user) {
                      var salt = bcrypt.genSaltSync(10);
                      var hash = bcrypt.hashSync(req.body.password, salt);
                      user.password = hash;
                      user.resetToken = '',
                      user.expireToken = '',
                      user.save((error, result) => {
                          if(error) {
                              res.status(400).json({errorMessage: 'Failed to update password'});
                          } else {
                              res.status(200).json({successMessage: 'Password updated Successfully.'})
                          }
                      })                
              }
            });
     }
});




module.exports = router;