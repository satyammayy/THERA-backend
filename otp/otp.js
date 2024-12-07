const nodemailer = require('nodemailer');

const otpStore = new Map(); // Store OTPs temporarily (key: email, value: otp & expiry)

// Nodemailer Configuration
const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'no.reply.thera@gmail.com',
        pass: 'nglk mjry husb pqxx',
    },
});

// Generate OTP
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
}

// Send OTP Email
async function sendOTP(email) {
    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    otpStore.set(email, { otp, expiry });

    const mailDetails = {
        from: 'no.reply.thera@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await mailTransporter.sendMail(mailDetails);
        console.log(`OTP sent to ${email}`);
        return { success: true, message: 'OTP sent successfully.' };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Failed to send OTP.' };
    }
}

// Validate OTP
function validateOTP(email, userOTP) {
    const storedData = otpStore.get(email);

    if (!storedData) {
        return { success: false, message: 'OTP not found or expired.' };
    }

    const { otp, expiry } = storedData;

    if (Date.now() > expiry) {
        otpStore.delete(email); // Remove expired OTP
        return { success: false, message: 'OTP expired.' };
    }

    if (otp !== userOTP) {
        return { success: false, message: 'Invalid OTP.' };
    }

    otpStore.delete(email); // OTP used successfully
    return { success: true, message: 'OTP validated successfully.' };
}

module.exports = { sendOTP, validateOTP };
