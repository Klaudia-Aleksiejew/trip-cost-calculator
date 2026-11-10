export interface Car {
  id: string;
  brand: string;
  model: string;
  avgConsumption: number;
  fuelType: 'benzyna' | 'diesel' | 'lpg';
}

// Example data for the cars table
export let carsTable: Car[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Corolla',
    avgConsumption: 6.5,
    fuelType: 'benzyna',
  },
  {
    id: '2',
    brand: 'Volkswagen',
    model: 'Golf',
    avgConsumption: 5.2,
    fuelType: 'diesel',
  }
];