const API_URL = 'http://localhost:5000/api';

export interface Car {
  id: string;
  brand: string;
  model: string;
  avgConsumption: number;
  fuelType: 'benzyna' | 'diesel' | 'lpg';
}

export interface TripOption {
  mode: string;
  totalCost: number;
  costPerPerson: number;
  durationMinutes: number;
  co2Gram: number;
  isEcoFriendly: boolean;
}

export interface TripResult {
  carUsed: string;
  distanceKm: number;
  options: TripOption[];
}

export interface Location {
  lat: number;
  lon: number;
  displayName: string;
}

export interface RoadRoute {
  distanceKm: number;
  durationMinutes: number;
}

// Retrieve the list of cars
export async function getCars(): Promise<Car[]> {
  const res = await fetch(`${API_URL}/cars`);
  if (!res.ok) throw new Error('Nie udało się pobrać samochodów');
  return res.json();
}

// Add a new car
export async function createCar(carData: Omit<Car, 'id'>): Promise<Car> {
  const res = await fetch(`${API_URL}/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carData),
  });
  if (!res.ok) throw new Error('Nie udało się dodać samochodu');
  return res.json();
}

// Delete a car by ID
export async function deleteCar(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/cars/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Nie udało się usunąć samochodu');
}

// Calculate trip options based on the provided data
export async function calculateTrip(data: {
  carId: string;
  distanceKm: number;
  durationMinutes: number;
  passengersCount: number;
}): Promise<TripResult> {
  const res = await fetch(`${API_URL}/trip/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? `Nie udało się obliczyć trasy (HTTP ${res.status}).`);
  }
  return res.json();
}

// Nominatim API call to get coordinates for a given city name
export async function getCoordinates(cityName: string) {
  const location = await searchLocation(cityName);
  return { lat: location.lat, lon: location.lon };
}

export async function searchLocation(query: string, signal?: AbortSignal): Promise<Location> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
    addressdetails: '1',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`Nie udało się znaleźć lokalizacji (HTTP ${res.status}).`);
  }

  const results: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
  const result = results[0];
  if (!result) {
    throw new Error(`Nie znaleziono lokalizacji: ${query}`);
  }

  const lat = Number(result.lat);
  const lon = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Nieprawidłowe współrzędne dla lokalizacji: ${query}`);
  }

  return { lat, lon, displayName: result.display_name };
}

export async function getRoadRoute(
  origin: Location,
  destination: Location,
  signal?: AbortSignal,
): Promise<RoadRoute> {
  const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`,
    { signal },
  );
  if (!res.ok) {
    throw new Error(`Nie udało się wyznaczyć trasy drogowej (HTTP ${res.status}).`);
  }

  const data: {
    code: string;
    routes?: Array<{ distance: number; duration: number }>;
  } = await res.json();
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) {
    throw new Error('Nie znaleziono trasy drogowej dla tych lokalizacji.');
  }

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: Math.round(route.duration / 60),
  };
}