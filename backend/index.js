import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();

// Middleware: CORS y JSON
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Ruta raíz
app.get('/', (req, res) => res.send('Servidor Express funcionando 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ LOL: Servidor escuchando en puerto ${PORT}`));
