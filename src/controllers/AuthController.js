import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { isAdmin } from './RoleController.js';
import RequestError from '../errors/RequestError.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const seedAdmin = async () => {
    try {
        console.log('seeding admin user...');
        const adminRole = await Role.findOne({ name: 'admin' });

        const existingAdmins = await User.find({email: process.env.ADMIN_EMAIL, role: adminRole});
        if (existingAdmins.length > 0) {
            console.log('Database already seeded with admin user...');
            return;
        }

        const admin = new User({
            email: process.env.ADMIN_EMAIL,
            name: process.env.ADMIN_NAME,
            passwordHash: await hashPassword(process.env.ADMIN_PASSWORD),
            role: adminRole,
        });

        await admin.save();
        console.log('Admin user seeded successfully.');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

export const signup = async (req, res, next) => {
    try {
        // Validate request body somewhere
        const { email, name, password, roleId } = req.body;

        //Validate request
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new RequestError('Email already in use.', 400);
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw new RequestError('Invalid role.', 400);
        }
        const isRoleAdmin = await isAdmin(roleId);
        if(isRoleAdmin) {
            throw new RequestError('Cannot create an admin user.', 400);
        }
        // Add a better salt here
        const passwordHash = await hashPassword(password);

        // create user
        const user = new User({
            email,
            name,
            passwordHash,
            role: role
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        //Validate request body somewhere
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new RequestError('Invalid email or password.', 401);
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new RequestError('Invalid email or password.', 401);
        }

        const token = generateToken(user._id);

        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};


// Token blacklisting should be eventually implemented with redis or similar
export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new RequestError('No token provided.', 401);
        }

        const decoded = jwt.decode(token);
        if(!decoded || !decoded.exp) {
            throw new RequestError('Invalid token.', 400);
        }

        const expirationDate = new Date(decoded.exp * 1000);
        await TokenBlacklist.create({ token, expiresAt: expirationDate });
        
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch(error) {
        next(error);
    }
};