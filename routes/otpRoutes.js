const express = require('express');
const bodyParser = require('body-parser');
const { sendOTP, validateOTP } = require('../otp/otp');
const User = require('../models/user'); // Assuming you have a User model for database operations
const bcrypt = require('bcrypt'); // For securely hashing passwords

const router = express.Router();

router.use(bodyParser.json());

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const response = await sendOTP(email);
    res.status(response.success ? 200 : 500).json(response);
});

// Route to validate OTP and update password
router.post('/validate-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Check for required fields
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    // Validate the OTP
    const otpResponse = validateOTP(email, otp);
    if (!otpResponse.success) {
        return res.status(400).json(otpResponse);
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the password.' });
    }
});

module.exports = router;
