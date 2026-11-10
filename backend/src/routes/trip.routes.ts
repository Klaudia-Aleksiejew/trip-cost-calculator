import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';

const router = Router();

router.post('/calculate', TripController.calculateTrip);

export default router;