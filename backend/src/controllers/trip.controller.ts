import { Request, Response } from 'express';
import { CalculationService } from '../services/calculation.services';
import { carsTable } from '../data/memoryDB';

export class TripController {
  public static calculateTrip(req: Request, res: Response) {
    const { carId, distanceKm, durationMinutes, passengersCount } = req.body;

    // Input validation: check if required fields are present
    if (!carId || distanceKm === undefined || durationMinutes === undefined) {
      return res.status(400).json({ 
        error: 'Wymagane pola to: carId, distanceKm oraz durationMinutes.' 
      });
    }

    // Find the car in the carsTable using the provided carId
    const car = carsTable.find(c => c.id === carId);
    if (!car) {
      return res.status(404).json({ error: 'Nie znalezniono wybranego samochodu.' });
    }

    // Calculate the trip using the CalculationService and return the result
    try {
      const result = CalculationService.calculateTrip({
        distanceKm: Number(distanceKm),
        durationMinutes: Number(durationMinutes),
        fuelType: car.fuelType,
        avgConsumption: car.avgConsumption,
        passengersCount: passengersCount ? Number(passengersCount) : 1
      });

      return res.status(200).json({
        carUsed: `${car.brand} ${car.model}`,
        ...result
      });
    } catch (error) {
      return res.status(500).json({ error: 'Wystąpił błąd podczas obliczania trasy.' });
    }
  }
}