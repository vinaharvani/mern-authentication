import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getUserData } from '../controllers/userController.js';

const userRouter = express.Router();


userRouter.get('/data', requireAuth , getUserData);

export default userRouter;