import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.FRONTEND_URL, optionsSuccessStatus: 200 }
  : {};
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor Express funcionando 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});

