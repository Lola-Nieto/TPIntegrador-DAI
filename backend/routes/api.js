import express from 'express';
import { 
    getHello, 
    getAllEvents, 
    getEventByName, 
    getEventByStartDate, 
    getEventByTag 
} from '../controllers/apiController.js';

const router = express.Router();

// Ruta de prueba
router.get('/hello', getHello);

// Rutas de eventos
router.get('/events', getAllEvents);
router.get('/events/name/:name', getEventByName);
router.get('/events/startdate/:startdate', getEventByStartDate);
router.get('/events/tag/:tag', getEventByTag);

export default router;
