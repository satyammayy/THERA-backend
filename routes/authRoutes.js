const express = require('express');
const multer = require('multer');
const { registerUser } = require('../controllers/authController');
const cloudinary = require('../config/cloudinaryConfig');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up Cloudinary storage with Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_images',
    allowed_formats: ['jpg', 'png'],
  },
});
const upload = multer({ storage });

const router = express.Router();

// Registration route
router.post('/register', upload.single('image'), registerUser);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      console.log(user)
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Create a JWT token
      const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
  
      // Send success response with token, fullName, and image URL
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          fullName: user.fullName,
          imageUrl: user.imageUrl, // Ensure this field is part of your User model
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

module.exports = router;
