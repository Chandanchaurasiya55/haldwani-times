import express from 'express';
import { registerAdmin, registerReporter, registerUser, login } from '../controller/authController.js';

const router = express.Router();

// @route   POST /api/auth/register/admin
router.post('/register/admin', registerAdmin);

// @route   POST /api/auth/register/reporter
router.post('/register/reporter', registerReporter);

// @route   POST /api/auth/register/user
router.post('/register/user', registerUser);

// @route   POST /api/auth/login
router.post('/login', login);

export default router;
