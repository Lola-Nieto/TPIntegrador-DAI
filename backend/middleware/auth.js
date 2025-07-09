import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
        req.user = user;
        next();
    });
};

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}; 