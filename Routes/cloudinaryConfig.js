const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'saeedahmed' || process.env.CLOUD_NAME,
    api_key: '633615861791628' || process.env.CLOUDINARY_API_KEY,
    api_secret: 'pcu5hDuFK01arwcxuotN3EHXFRc' || process.env.CLOUDINARY_SECRET_KEY
  });

  module.exports = cloudinary;