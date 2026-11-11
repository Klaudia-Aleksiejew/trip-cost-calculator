import { ArrowLeft, Bus, Car, Clock3, Leaf, MapPin, RotateCcw, Train } from 'lucide-react';
import type { Car as CarModel, TripResult } from '../services/api';
import type { ResolvedRoute } from './RoutePanel';

interface ComparisonResultsProps {
  car: CarModel;
  result: TripResult;
  route: ResolvedRoute;
  passengerCount: number;
  onBack: () => void;
  onNewComparison: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} godz.`;
  return `${hours} godz. ${remainingMinutes} min`;
};

const formatEmissions = (grams: number) =>
  grams >= 1000
    ? `${(grams / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} kg CO₂`
    : `${grams.toLocaleString('pl-PL')} g CO₂`;

const formatPassengerCount = (count: number) => {
  if (count === 1) return '1 osoba';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
    return `${count} osoby`;
  }
  return `${count} osób`;
};

const getOptionIcon = (mode: string) => {
  if (mode === 'Samochód') return Car;
  if (mode === 'Pociąg') return Train;
  return Bus;
};

export function ComparisonResults({
  car,
  result,
  route,
  passengerCount,
  onBack,
  onNewComparison,
}: ComparisonResultsProps) {
  const cheapestOption = result.options.reduce((lowest, option) =>
    option.costPerPerson < lowest.costPerPerson ? option : lowest,
  );
  const lowestEmissionOption = result.options.reduce((lowest, option) =>
    option.co2Gram < lowest.co2Gram ? option : lowest,
  );

  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <header className="comparison-heading">
        <div className="comparison-heading-icon"><Leaf size={22} /></div>
        <div>
          <p className="comparison-eyebrow">Porównanie podróży</p>
          <h2 id="comparison-title" className="comparison-title">Twoje wyniki</h2>
          <p className="comparison-subtitle">
            Koszt samochodu jest dzielony między pasażerów. Ceny pociągu i autobusu są podane za osobę; ich czasy i ceny są orientacyjne.
          </p>
        </div>
      </header>

      <div className="comparison-route">
        <div className="comparison-route-place">
          <MapPin size={17} />
          <span><strong>Start</strong>{route.origin.displayName}</span>
        </div>
        <div className="comparison-route-place">
          <MapPin size={17} />
          <span><strong>Cel</strong>{route.destination.displayName}</span>
        </div>
        <div className="comparison-route-stat">
          <strong>{route.distanceKm.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} km</strong>
          <span>odległość drogowa</span>
        </div>
      </div>

      <div className="comparison-highlights">
        <div className="comparison-highlight">
          <span className="highlight-icon"><Leaf size={17} /></span>
          <span><small>Najmniej CO₂</small><strong>{lowestEmissionOption.mode}</strong></span>
          <b>{formatEmissions(lowestEmissionOption.co2Gram)}</b>
        </div>
        <div className="comparison-highlight">
          <span className="highlight-icon"><Clock3 size={17} /></span>
          <span><small>Najszybciej</small><strong>{result.options.reduce((fastest, option) =>
            option.durationMinutes < fastest.durationMinutes ? option : fastest,
          ).mode}</strong></span>
          <b>{formatDuration(Math.min(...result.options.map(option => option.durationMinutes)))}</b>
        </div>
        <div className="comparison-highlight">
          <span className="highlight-icon"><span className="currency-symbol">zł</span></span>
          <span><small>Najniższy koszt na osobę</small><strong>{cheapestOption.mode}</strong></span>
          <b>{formatCurrency(cheapestOption.costPerPerson)}</b>
        </div>
      </div>

      <h3 className="comparison-section-title">Porównanie opcji</h3>
      <div className="comparison-options">
        {result.options.map(option => {
          const OptionIcon = getOptionIcon(option.mode);
          const isCheapest = option.mode === cheapestOption.mode;
          const isLowestEmission = option.mode === lowestEmissionOption.mode;
          const isSelectedCar = option.mode === 'Samochód';

          return (
            <article
              className={`comparison-option${isSelectedCar ? ' comparison-option-car' : ''}`}
              key={option.mode}
            >
              <div className="comparison-option-heading">
                <span className="comparison-option-icon"><OptionIcon size={20} /></span>
                <div>
                  <h4>{option.mode}</h4>
                  {isSelectedCar && (
                    <p>{car.brand} {car.model} · {car.avgConsumption} l/100km · {car.fuelType}</p>
                  )}
                  {!isSelectedCar && <p>Wartość szacunkowa</p>}
                </div>
              </div>
              <div className="comparison-metrics">
                <div>
                  <span>{isSelectedCar ? `Koszt łącznie (${passengerCount} os.)` : 'Koszt'}</span>
                  <strong>{formatCurrency(option.totalCost)}</strong>
                </div>
                <div><span>Czas</span><strong>{formatDuration(option.durationMinutes)}</strong></div>
                <div><span>Emisja CO₂</span><strong>{formatEmissions(option.co2Gram)}</strong></div>
              </div>
              {isSelectedCar ? (
                <p className="comparison-cost-per-person">
                  {formatCurrency(option.costPerPerson)} na osobę · koszt podzielony między{' '}
                  {formatPassengerCount(passengerCount)}
                </p>
              ) : (
                <p className="comparison-cost-per-person">
                  Około {formatCurrency(option.costPerPerson)} na osobę
                </p>
              )}
              <div className="comparison-badges">
                {isCheapest && <span>Najniższy koszt na osobę</span>}
                {isLowestEmission && <span>Najmniej CO₂</span>}
                {option.isEcoFriendly && <span className="eco-badge">Bardziej ekologiczna</span>}
              </div>
            </article>
          );
        })}
      </div>

      <div className="comparison-car-summary">
        <Car size={17} />
        <span>Wybrany samochód: <strong>{result.carUsed}</strong></span>
        <span className="comparison-passenger-summary">
          {formatPassengerCount(passengerCount)} w samochodzie
        </span>
        <span><Clock3 size={15} /> Jazda: {formatDuration(route.durationMinutes)}</span>
      </div>

      <p className="comparison-attribution">
        Odległość i czas jazdy na podstawie OSRM. Dane mapowe: OpenStreetMap.
        Pozostałe wartości są szacunkowe.
      </p>

      <div className="comparison-actions">
        <button type="button" className="secondary-action-button" onClick={onBack}>
          <ArrowLeft size={17} /> Wróć i zmień dane
        </button>
        <button type="button" className="primary-action-button" onClick={onNewComparison}>
          <RotateCcw size={17} /> Nowe porównanie
        </button>
      </div>
    </section>
  );
}
