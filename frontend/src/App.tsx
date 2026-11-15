import { useState } from 'react';
import type { Car, TripResult } from './services/api';
import { calculateTrip } from './services/api';
import { CarManager } from './components/CarManager';
import { RoutePanel } from './components/RoutePanel';
import type { ResolvedRoute } from './components/RoutePanel';
import { ComparisonResults } from './components/ComparisonResults';
import { Car as CarIcon, LoaderCircle } from 'lucide-react';
import './App.css';

export function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [route, setRoute] = useState<ResolvedRoute | null>(null);
  const [results, setResults] = useState<TripResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparisonError, setComparisonError] = useState('');
  const [routePanelKey, setRoutePanelKey] = useState(0);
  const [passengerCount, setPassengerCount] = useState('1');
  const selectedCar = cars.find(car => car.id === selectedCarId);
  const passengerCountValue = Number(passengerCount);
  const isPassengerCountValid =
    Number.isInteger(passengerCountValue) && passengerCountValue > 0;

  const handleShowResults = async () => {
    if (!route || !selectedCar || !isPassengerCountValid) return;

    setIsCalculating(true);
    setComparisonError('');
    try {
      const calculation = await calculateTrip({
        carId: selectedCar.id,
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        passengersCount: passengerCountValue,
      });
      setResults(calculation);
      window.scrollTo(0, 0);
      setShowResults(true);
    } catch (error) {
      setComparisonError(
        error instanceof Error ? error.message : 'Nie udało się przygotować porównania.',
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNewComparison = () => {
    window.scrollTo(0, 0);
    setShowResults(false);
    setResults(null);
    setRoute(null);
    setSelectedCarId('');
    setPassengerCount('1');
    setComparisonError('');
    setRoutePanelKey(key => key + 1);
  };

  return (
    <main className="app-page">
      <div className="app-container">
        <div hidden={showResults}>
          <div className="welcome-panel">
            <h2 className="welcome-title">
              <CarIcon className="welcome-icon" /> Witaj w kalkulatorze podróży!
            </h2>
            <p className="welcome-description">
              Podaj miasta i wyznacz odległość drogową, następnie dodaj lub wybierz samochód, a na końcu zobacz porównanie kosztów, czasu i emisji CO₂.
            </p>
          </div>

          <RoutePanel
            key={routePanelKey}
            onRouteChange={nextRoute => {
              setRoute(nextRoute);
              if (!nextRoute) {
                setSelectedCarId('');
                setResults(null);
                setComparisonError('');
              }
            }}
          />
          <CarManager
            cars={cars}
            setCars={setCars}
            selectedCarId={selectedCarId}
            setSelectedCarId={setSelectedCarId}
            selectionEnabled={route !== null}
          />
          {route && selectedCar && (
            <div className="results-action-panel">
              <p>Trasa i samochód są gotowe. Możesz teraz zobaczyć porównanie podróży.</p>
              <div className="passenger-field">
                <label className="car-field-label" htmlFor="passenger-count">
                  Pasażerowie łącznie z kierowcą
                </label>
                <input
                  id="passenger-count"
                  className="car-field-input"
                  type="number"
                  min="1"
                  step="1"
                  value={passengerCount}
                  onChange={event => {
                    setPassengerCount(event.target.value);
                    setComparisonError('');
                  }}
                  aria-describedby="passenger-count-help"
                />
                <span id="passenger-count-help" className="passenger-help">
                  Koszt samochodu zostanie podzielony między podróżujących.
                </span>
              </div>
              {comparisonError && <p className="form-error" role="alert">{comparisonError}</p>}
              <button
                type="button"
                className="primary-action-button"
                onClick={() => void handleShowResults()}
                disabled={isCalculating || !isPassengerCountValid}
              >
                {isCalculating && <LoaderCircle className="loading-icon" size={17} />}
                {isCalculating ? 'Przygotowywanie wyników...' : 'Pokaż porównanie'}
              </button>
            </div>
          )}
        </div>

        {showResults && results && route && selectedCar && (
          <ComparisonResults
            car={selectedCar}
            result={results}
            route={route}
            passengerCount={passengerCountValue}
            onBack={() => {
              window.scrollTo(0, 0);
              setShowResults(false);
            }}
            onNewComparison={handleNewComparison}
          />
        )}
      </div>
    </main>
  );
}

export default App;