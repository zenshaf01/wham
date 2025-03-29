import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RequestError from '../errors/RequestError.js';

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new RequestError('Unauthorized', 401);
        }

        req.user = user;
        next();
    } catch(error) {
        next(new RequestError('Unauthorized', 401));
    }
};

export default isAuthenticated;
