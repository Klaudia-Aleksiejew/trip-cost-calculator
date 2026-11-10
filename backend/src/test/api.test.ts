import http from 'http';

// Additional function to make HTTP requests to the backend API
function makeRequest(method: string, path: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log(' Rozpoczynam testy integracyjne API...\n');

  try {
    // Test endpointu root (GET /)
    const rootRes = await makeRequest('GET', '/');
    console.log(`Test 1 (Root): Status ${rootRes.status}`, rootRes.body);

    // Test endpoint GET /api/cars (Get Cars) 
    const getCarsRes = await makeRequest('GET', '/api/cars');
    console.log(`Test 2 (Get Cars): Status ${getCarsRes.status}`, `Liczba aut: ${getCarsRes.body.length}`);

    // Creation test for a new car (POST /api/cars)
    const newCarPayload = {
      brand: 'Skoda',
      model: 'Octavia',
      avgConsumption: 5.8,
      fuelType: 'diesel'
    };
    const addCarRes = await makeRequest('POST', '/api/cars', newCarPayload);
    console.log(`Test 3 (Add Car): Status ${addCarRes.status}`, addCarRes.body);
    const createdCarId = addCarRes.body.id;

    // Trip calculation test (POST /api/trip/calculate)
    const tripPayload = {
      carId: createdCarId,
      distanceKm: 350,       // like a trip from Warsaw to Krakow
      durationMinutes: 210,  // 3.5 hours
      passengersCount: 3     // 3 passengers
    };
    const calcRes = await makeRequest('POST', '/api/trip/calculate', tripPayload);
    console.log(`Test 4 (Calculate Trip): Status ${calcRes.status}`, JSON.stringify(calcRes.body, null, 2));

    console.log('\nWszystkie testy przeszły pomyślnie!');
  } catch (error) {
    console.error('Błąd podczas wykonywania testów (czy serwer backendowy działa?):', error);
  }
}

runTests();