import pkg from 'pg';
import { StatusCodes } from 'http-status-codes';
import config from '../configs/db-configs.js';

const { Client } = pkg;

export const getHello = (req, res) => {
    res.json({ message: 'Hola desde la API 🚀' });
};

// Obtener todos los eventos
export const getAllEvents = async (req, res) => {
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = "SELECT * FROM Events";
        const resultadoPg = await client.query(sqlQuery);
        res.status(StatusCodes.OK).json(resultadoPg.rows);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};

// Obtener evento por nombre
export const getEventByName = async (req, res) => {
    const { name } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE name = $1';
        const values = [name];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con el nombre ${name}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};

// Obtener evento por fecha de inicio
export const getEventByStartDate = async (req, res) => {
    const { startdate } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE startdate = $1';
        const values = [startdate];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con fecha de inicio ${startdate}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};

// Obtener evento por etiqueta
export const getEventByTag = async (req, res) => {
    const { tag } = req.params;
    const client = new Client(config);

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE tag = $1';
        const values = [tag];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con la etiqueta ${tag}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    } finally {
        await client.end();
    }
};
  