import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor Express funcionando 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});