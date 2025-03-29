import express from 'express';
import { signup, login, logout } from '../controllers/AuthController.js';
import isAuthenticated from '../middleware/Authentication.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);

export default router;