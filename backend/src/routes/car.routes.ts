import { Router } from 'express';
import { CarController } from '../controllers/car.controller';

const router = Router();

router.get('/', CarController.getAllCars);       // Read (all cars)
router.post('/', CarController.createCar);     // Create
router.put('/:id', CarController.updateCar);   // Update
router.delete('/:id', CarController.deleteCar);// Delete

export default router;