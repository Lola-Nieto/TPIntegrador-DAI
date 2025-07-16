import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import config from '../../configs/db-configs.js';
import { generateToken } from '../../middleware/auth.js';
import {isValidEmail} from './validaciones/mailValidacion.js'
import {isValidString} from './validaciones/stringValidacion.js'


const { Client } = pkg;

// 5- Autenticación de Usuarios


// Registro de usuario
export const registerUser = async (req, res) => {
    const { first_name, last_name, username, password } = req.body;
    const client = new Client(config);

    try {
        
        isValidString(first_name, "nombre");
        isValidString(last_name, "apellido");

        isValidEmail(username);

        isValidString(password, "contraseña");

        await client.connect();

        // Verificar si el usuario ya existe
        const checkUserQuery = 'SELECT id FROM Users WHERE username = $1';
        const existingUser = await client.query(checkUserQuery, [username]);

        if (existingUser.rowCount > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const insertQuery = `
            INSERT INTO Users (first_name, last_name, username, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, username
        `;
        const result = await client.query(insertQuery, [
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
    } finally {
        await client.end();
    }
};

// Login de usuario
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const client = new Client(config);

    try {
        // Validación de email
        if (!isValidEmail(username)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El email es inválido',
                token: ''
            });
        }

        await client.connect();

        // Buscar usuario
        const query = 'SELECT * FROM Users WHERE username = $1';
        const result = await client.query(query, [username]);

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
    } finally {
        await client.end();
    }
}; 