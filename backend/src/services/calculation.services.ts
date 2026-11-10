// Average fuel prices in PLN per liter 
// Might be updated in the future based on real-time data or user input
const FUEL_PRICES = {
  benzyna: 6.30,
  diesel: 6.20,
  lpg: 2.90,
};

// CO2 emissions in grams per liter of fuel
const CO2_PER_LITER = {
  benzyna: 2390, 
  diesel: 2640,  
  lpg: 1650      
};

interface CalculationInput {
  distanceKm: number;
  durationMinutes: number;
  fuelType: 'benzyna' | 'diesel' | 'lpg';
  avgConsumption: number;
  passengersCount: number;
}

export class CalculationService {
  public static calculateTrip(input: CalculationInput) {
    const { distanceKm, durationMinutes, fuelType, avgConsumption, passengersCount } = input;

    // Calculations for car travel
    const fuelPrice = FUEL_PRICES[fuelType] || 6.30;
    const totalCarCost = (distanceKm / 100) * avgConsumption * fuelPrice;
    const passengers = passengersCount > 0 ? passengersCount : 1;
    const costPerPersonCar = totalCarCost / passengers;

    // Estimations for train travel
    const trainCost = distanceKm * 0.30 + 30;
    const trainDuration = Math.round(durationMinutes * 1.2);

    // Estimations for bus travel
    const busCost = distanceKm * 0.22 + 20;
    const busDuration = Math.round(durationMinutes * 1.3);

    // Calculations for CO2 emissions for car travel
    const totalFuelUsed = (distanceKm / 100) * avgConsumption;
    const emissionFactor = CO2_PER_LITER[fuelType] || 2390;
    const carCo2 = Math.round(totalFuelUsed * emissionFactor);

    // Estimations for CO2 emissions for bus and train travel
    const busCo2 = Math.round(distanceKm * 68);
    const trainCo2 = Math.round(distanceKm * 40);

    return {
      distanceKm,
      options: [
        {
          mode: 'Samochód',
          totalCost: Number(totalCarCost.toFixed(2)),
          costPerPerson: Number(costPerPersonCar.toFixed(2)),
          durationMinutes: durationMinutes,
          co2Gram: carCo2,
          isEcoFriendly: false
        },
        {
          mode: 'Pociąg',
          totalCost: Number(trainCost.toFixed(2)),
          costPerPerson: Number(trainCost.toFixed(2)),
          durationMinutes: trainDuration,
          co2Gram: trainCo2,
          isEcoFriendly: true 
        },
        {
          mode: 'Flixbus',
          totalCost: Number(busCost.toFixed(2)),
          costPerPerson: Number(busCost.toFixed(2)),
          durationMinutes: busDuration,
          co2Gram: busCo2,
          isEcoFriendly: false
        }
      ]
    };
  }
}