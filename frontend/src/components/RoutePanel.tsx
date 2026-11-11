import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { LoaderCircle, MapPin, Route as RouteIcon } from 'lucide-react';
import { getRoadRoute, searchLocation } from '../services/api';
import type { Location, RoadRoute } from '../services/api';

export interface ResolvedRoute extends RoadRoute {
  origin: Location;
  destination: Location;
}

interface RoutePanelProps {
  onRouteChange: (route: ResolvedRoute | null) => void;
}

const wait = (milliseconds: number) =>
  new Promise(resolve => window.setTimeout(resolve, milliseconds));

export function RoutePanel({ onRouteChange }: RoutePanelProps) {
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [route, setRoute] = useState<ResolvedRoute | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const lastGeocodeRequestAt = useRef(0);

  const updateQuery = (
    setter: (value: string) => void,
  ) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
    requestId.current += 1;
    controller.current?.abort();
    setRoute(null);
    setError('');
    setIsLoading(false);
    onRouteChange(null);
  };

  const handleFindRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError('');
    setRoute(null);
    onRouteChange(null);

    try {
      const searchAtRateLimit = async (query: string) => {
        const delay = Math.max(0, 1100 - (Date.now() - lastGeocodeRequestAt.current));
        if (delay > 0) {
          await wait(delay);
        }
        if (requestController.signal.aborted) {
          throw new DOMException('Route lookup was cancelled.', 'AbortError');
        }
        lastGeocodeRequestAt.current = Date.now();
        return searchLocation(query, requestController.signal);
      };

      const origin = await searchAtRateLimit(originQuery.trim());
      const destination = await searchAtRateLimit(destinationQuery.trim());
      const roadRoute = await getRoadRoute(origin, destination, requestController.signal);
      const resolvedRoute = { origin, destination, ...roadRoute };

      if (currentRequestId === requestId.current) {
        setRoute(resolvedRoute);
        onRouteChange(resolvedRoute);
      }
    } catch (requestError) {
      if (currentRequestId === requestId.current && !requestController.signal.aborted) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Nie udało się wyznaczyć trasy.',
        );
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="route-panel">
      <div className="route-panel-heading">
        <div className="step-number">1</div>
        <div>
          <h2 className="car-manager-title">Wyznacz trasę</h2>
          <p className="route-panel-description">
            Podaj początek i cel podróży, aby sprawdzić odległość drogową.
          </p>
        </div>
      </div>

      <form onSubmit={handleFindRoute} className="route-form">
        <div className="route-fields">
          <div className="car-field">
            <label className="car-field-label" htmlFor="route-origin">Punkt początkowy</label>
            <input
              id="route-origin"
              className="car-field-input"
              value={originQuery}
              onChange={updateQuery(setOriginQuery)}
              placeholder="np. Warszawa, Polska"
              required
            />
          </div>
          <div className="car-field">
            <label className="car-field-label" htmlFor="route-destination">Punkt docelowy</label>
            <input
              id="route-destination"
              className="car-field-input"
              value={destinationQuery}
              onChange={updateQuery(setDestinationQuery)}
              placeholder="np. Kraków, Polska"
              required
            />
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button
            type="submit"
            className="route-submit-button"
            disabled={isLoading || !originQuery.trim() || !destinationQuery.trim()}
          >
            {isLoading ? <LoaderCircle className="loading-icon" size={16} /> : <RouteIcon size={16} />}
            {isLoading ? 'Wyznaczanie trasy...' : 'Wyznacz trasę'}
          </button>
        </div>
      </form>

      {route && (
        <div className="route-result" role="status">
          <div className="route-place">
            <MapPin size={16} />
            <span>{route.origin.displayName}</span>
          </div>
          <div className="route-result-line" />
          <div className="route-place">
            <MapPin size={16} />
            <span>{route.destination.displayName}</span>
          </div>
          <div className="route-distance">
            <strong>{route.distanceKm.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} km</strong>
            <span>odległość drogowa</span>
          </div>
          <p className="route-attribution">
            Geokodowanie: Nominatim, routing drogowy: OSRM. Dane mapowe:{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>.
          </p>
        </div>
      )}
    </section>
  );
}
