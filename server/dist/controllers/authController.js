"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and password.' });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = await User_1.User.create({
            name,
            email,
            passwordHash,
            role: role || 'Logistics Operator'
        });
        const jwtSecret = process.env.JWT_SECRET || 'drone-delivery-secret-key-12345';
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, jwtSecret, { expiresIn: '24h' });
        res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            token,
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'drone-delivery-secret-key-12345';
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '24h' });
        res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getProfile = async (req, res, next) => {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ success: false, message: 'Unauthorized access.' });
        }
        const user = await User_1.User.findById(userPayload.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
