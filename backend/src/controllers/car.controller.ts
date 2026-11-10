import { Request, Response } from 'express';
import { carsTable, Car } from '../data/memoryDB';

export class CarController {
  // GET: Retrieve all cars (Read)
  public static getAllCars(req: Request, res: Response) {
    return res.status(200).json(carsTable);
  }

  // POST: Add a new car (Create)
  public static createCar(req: Request, res: Response) {
    const { brand, model, avgConsumption, fuelType } = req.body;

    if (!brand || !model || avgConsumption === undefined || !fuelType) {
      return res.status(400).json({ error: 'Wszystkie pola (brand, model, avgConsumption, fuelType) są wymagane.' });
    }

    const newCar: Car = {
      id: Date.now().toString(), // ID based on current timestamp for simplicity; in a real application, consider using UUIDs
      brand,
      model,
      avgConsumption: Number(avgConsumption),
      fuelType
    };

    carsTable.push(newCar);
    return res.status(201).json(newCar);
  }

  // PUT: Edit an existing car (Update)
  public static updateCar(req: Request, res: Response) {
    const { id } = req.params;
    const { brand, model, avgConsumption, fuelType } = req.body;

    const carIndex = carsTable.findIndex(car => car.id === id);
    const existingCar = carsTable[carIndex];
    if (!existingCar) {
      return res.status(404).json({ error: 'Nie znalezniono samochodu o podanym ID.' });
    }

    const updatedCar: Car = {
      id: existingCar.id,
      brand: brand || existingCar.brand,
      model: model || existingCar.model,
      avgConsumption: avgConsumption !== undefined ? Number(avgConsumption) : existingCar.avgConsumption,
      fuelType: fuelType || existingCar.fuelType
    };

    carsTable[carIndex] = updatedCar;
    return res.status(200).json(updatedCar);
  }

  // DELETE: Delete a car (Delete)
  public static deleteCar(req: Request, res: Response) {
    const { id } = req.params;
    const carIndex = carsTable.findIndex(car => car.id === id);

    if (carIndex === -1) {
      return res.status(404).json({ error: 'Nie znaleziono samochodu o podanym ID.' });
    }

    const deletedCar = carsTable.splice(carIndex, 1);
    return res.status(200).json({ message: 'Usunięto pomyślnie', deletedCar });
  }
}