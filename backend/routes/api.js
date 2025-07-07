import express from 'express';
import { getHello } from '../controllers/apiController.js';

const router = express.Router();

router.get('/hello', getHello);

export default router;
