const bcrypt = require('bcryptjs');
const User = require('../models/user');
const cloudinary = require('../config/cloudinaryConfig');

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, address, phone } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload to Cloudinary
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      address,
      phone,
      imageUrl,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
