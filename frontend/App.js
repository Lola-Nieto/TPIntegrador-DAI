import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import express  from "express";
import cors     from "cors";
import config from './configs/db-configs.js'
import pkg from 'pg'
import {StatusCodes} from "http-status-codes";

const { Client }  = pkg;

const app  = express();
const port = 3000;

// Agrego los Middlewares
app.use(cors());         // Middleware de CORS
app.use(express.json()); // Middleware para parsear y comprender JSON

// Acá abajo poner todos los EndPoints
// (por ejemplo)
app.get('/', async (req, res) => 
{
   res.send('Hello World')

})

app.get('/api/event/', async (req, res) => 
{
    const client = new Client(config);

    try{
        await client.connect();
        const sqlQuery = "SELECT * from Events";
        const resultadoPg = await client.query(sqlQuery);
        res.status(StatusCodes.OK).json(resultadoPg.rows);
    }catch(error){
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error:vnjenv`);
    }finally{
        await client.end();
    }

})
app.get('/api/Event/:name', async (req, res) => 
{   
    const name = req.params.name
    const client = new Client(config);
    try {
        await client.connect()
        const sqlQuery = 'SELECT * FROM Event WHERE name = $1';
        const values = [name];
        const resultadoPg = await client.query(sqlQuery, values);
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con el nombre ${name}`); //el 400
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]); // el 200
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: 500`);
    } finally {
        await client.end();
    }
})
app.get('/api/Event/:startdate', async (req, res) => 
{
  const startdate = req.params.startdate
  const client = new Client(config);
  try {
      await client.connect()
      const sqlQuery = 'SELECT * FROM Event WHERE startdate = $1';
      const values = [startdate];
      const resultadoPg = await client.query(sqlQuery, values);
      if (resultadoPg.rowCount === 0) {
          return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con fecha de inicio ${startdate}`); //el 400
      }
      res.status(StatusCodes.OK).json(resultadoPg.rows[0]); // el 200
  } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: 500`);
  } finally {
      await client.end();
  }
})
app.get('/api/Event/:tag', async (req, res) => 
{
  const tag = req.params.tag
  const client = new Client(config);
  try {
      await client.connect()
      const sqlQuery = 'SELECT * FROM Event WHERE startdate = $1';
      const values = [tag];
      const resultadoPg = await client.query(sqlQuery, values);
      if (resultadoPg.rowCount === 0) {
          return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con la etiqueta ${tag}`); //el 400
      }
      res.status(StatusCodes.OK).json(resultadoPg.rows[0]); // el 200
  } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: 500`);
  } finally {
      await client.end();
  }
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});