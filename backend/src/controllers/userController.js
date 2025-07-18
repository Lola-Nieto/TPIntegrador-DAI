import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import config from '../../configs/db-configs.js';
import { generateToken } from '../../middleware/auth.js';
import {validaciones} from '../helpers/validaciones/validaciones-helper.js'
import {userService} from '../services/userService.js'

const { Pool } = pkg;
const pool = new Pool(config);

// 5- Autenticación de Usuarios

// Registro de usuario
export const registerUser = async (req, res) => {
    const { first_name, last_name, username, password } = req.body;

    try {
        
// backend/src/controllers/userController.js
        try {
            validaciones.isValidString(first_name, "nombre");
            validaciones.isValidString(last_name, "apellido");
            validaciones.isValidEmail(username);
            validaciones.isValidString(password, "contraseña");
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
        }
           const newId = await userService.registerUser(username);
           if (newId > 0){
            res.status(StatusCodes.CREATED).json(newId);
        } else {
            res.status(StatusCodes.BAD_REQUEST);
        }
    });

        // Insertar nuevo usuario
        const insertQuery = `
            INSERT INTO Users (first_name, last_name, username, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, username
        `;
        const result = await pool.query(insertQuery, [
            first_name, last_name, username, hashedPassword
        ]);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Login de usuario
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        try {
            isValidEmail(username);
            isValidString(password, "contraseña");
        } catch (error) {
            console.error(error)
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
            
        }

        // Buscar usuario
        const query = 'SELECT * FROM Users WHERE username = $1';
        const result = await pool.query(query, [username]);

        if (result.rowCount === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Usuario o clave inválida',
                token: ''
            });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Usuario o clave inválida',
                token: ''
            });
        }

        // Generar token
        const token = generateToken(user);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Login exitoso',
            token: token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor',
            token: ''
        });
    }
}; 