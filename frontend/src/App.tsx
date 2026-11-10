import { useState } from 'react';
import type { Car } from './services/api';
import { CarManager } from './components/CarManager';
import './App.css';

export function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');

  return (
    <main className="app-page">
      <div className="app-container">
        <CarManager
          cars={cars}
          setCars={setCars}
          selectedCarId={selectedCarId}
          setSelectedCarId={setSelectedCarId}
        />
      </div>
    </main>
  );
}

export default App;