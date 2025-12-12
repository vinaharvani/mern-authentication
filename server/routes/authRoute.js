import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import { requireAuth }  from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

// authRouter.get("/me", requireAuth, (req, res) => {

//     res.json({ success: true, userId: req.userId });
// });

// LOGOUT (protected Route)
authRouter.post("/logout", requireAuth, logout);

authRouter.post("/send-verify-otp", requireAuth, sendVerifyOtp);
authRouter.post("/verify-account", requireAuth, verifyEmail);

authRouter.get("/is-auth", requireAuth, isAuthenticated);

authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);




export default authRouter;