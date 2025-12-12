import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing details"
        });
    }

    try {

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });


        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome to mern-auth app`,
            text: `Your account has been created with email: ${email}`,
        }

        await transporter.sendMail(mailOptions);


        return res.status(201).json({ success: true });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true, // only http only access this cookie
            secure: process.env.NODE_ENV === 'production', // secure property is for = if the project run on live server than it run on https than we send true value means it is secure and in local it run on http than it not secure  
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }

};


export const logout = async (req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: "/" // for clear the cookie on all routes

        })

        return res.json({ success: true, message: "Logged out" })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


// send verification otp to user's email

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.status(409).json({ success: false, message: "Account already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Welcome to mern-auth app`,
            // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOption);

        res.json({ success: true, message: 'Verification OTP Sent on Email.' })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "Missing details" })
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (user.verifyOtp === '' || user.verifyOtp === otp) {
            return res.status(400).json({ success: false, message: "Invalid otp" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP Expired' })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfuly"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}


// check if the user is authenticated or not
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Welcome to mern-auth app`,
            // text: `Your OTP for reseting your password is ${otp}. reset ypur password using this OTP.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)

        }

        await transporter.sendMail(mailOption);

        res.json({ success: true, message: 'OTP Sent to your Email for reset the password.' })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



// Reset user password 


export const resetPassword = async (req, res) => {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "Email, otp, and new password are required." })
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" });
        }
        if (user.resetOtp === '' || user.resetOtp === otp) {
            return res.status(400).json({ success: false, message: "Invalid otp" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP Expired' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "password has been reset successfully" })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}