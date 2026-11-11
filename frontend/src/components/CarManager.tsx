import React, { useState, useEffect } from 'react';
import { getCars, createCar, deleteCar } from '../services/api';
import type { Car } from '../services/api';
import { Trash2, Plus, Fuel } from 'lucide-react';

interface CarManagerProps {
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  selectedCarId: string;
  setSelectedCarId: (id: string) => void;
  selectionEnabled: boolean;
}

export const CarManager: React.FC<CarManagerProps> = ({
  cars,
  setCars,
  selectedCarId,
  setSelectedCarId,
  selectionEnabled,
}) => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [avgConsumption, setAvgConsumption] = useState('');
  const [fuelType, setFuelType] = useState<'benzyna' | 'diesel' | 'lpg'>('benzyna');
  const [error, setError] = useState('');

  useEffect(() => {
    getCars()
      .then(setCars)
      .catch(err => console.error(err));
  }, [setCars]);

  const isFormValid =
    brand.trim() !== '' &&
    model.trim() !== '' &&
    avgConsumption !== '' &&
    Number.isFinite(Number(avgConsumption)) &&
    Number(avgConsumption) > 0;

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Wypełnij poprawnie wszystkie pola (spalanie musi być > 0).');
      return;
    }

    try {
      const newCar = await createCar({
        brand: brand.trim(),
        model: model.trim(),
        avgConsumption: parseFloat(avgConsumption),
        fuelType,
      });
      setCars(prev => [...prev, newCar]);
      setBrand('');
      setModel('');
      setAvgConsumption('');
      setError('');
    } catch {
      setError('Nie udało się dodać samochodu.');
    }
  };

  const handleDeleteCar = async (id: string) => {
    try {
      await deleteCar(id);
      setCars(prev => prev.filter(c => c.id !== id));
      if (selectedCarId === id) {
        setSelectedCarId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="car-manager">
      <div className="car-step-heading">
        <div className="step-number">2</div>
        <div>
          <h3 className="car-manager-title">Wybierz samochód</h3>
          <p className="route-panel-description">
            {selectionEnabled
              ? 'Wybierz auto, którym chcesz odbyć tę podróż.'
              : 'Najpierw wyznacz trasę, aby wybrać samochód.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleAddCar} className="car-form">
        <h4 className="car-form-title">Dodaj samochód</h4>
        <div className="car-form-grid">
          <div className="car-field">
            <label className="car-field-label" htmlFor="car-brand">Marka</label>
            <input
              id="car-brand"
              type="text"
              placeholder="np. Skoda"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="car-field-input"
            />
          </div>
          <div className="car-field">
            <label className="car-field-label" htmlFor="car-model">Model</label>
            <input
              id="car-model"
              type="text"
              placeholder="np. Octavia"
              value={model}
              onChange={e => setModel(e.target.value)}
              className="car-field-input"
            />
          </div>
          <div className="car-field">
            <label className="car-field-label" htmlFor="car-consumption">Spalanie (l/100km)</label>
            <input
              id="car-consumption"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="np. 6.5"
              value={avgConsumption}
              onChange={e => setAvgConsumption(e.target.value)}
              className="car-field-input"
            />
          </div>
          <div className="car-field">
            <label className="car-field-label" htmlFor="car-fuel-type">Rodzaj paliwa</label>
            <select
              id="car-fuel-type"
              value={fuelType}
              onChange={e => {
                const value = e.target.value;
                if (value === 'benzyna' || value === 'diesel' || value === 'lpg') {
                  setFuelType(value);
                }
              }}
              className="car-field-input"
            >
              <option value="benzyna">Benzyna</option>
              <option value="diesel">Diesel</option>
              <option value="lpg">LPG</option>
            </select>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {/* Wyśrodkowany przycisk - zmienia się na zielony, gdy formularz jest uzupełniony */}
        <div className="form-actions">
          <button
            type="submit"
            className={`add-car-button${isFormValid ? ' add-car-button-valid' : ''}`}
          >
            <Plus size={16} /> Dodaj auto
          </button>
        </div>
      </form>

      {/* Lista samochodów */}
      <div className="car-list">
        {cars.length === 0 ? (
          <p className="empty-car-list">Brak zapisanych samochodów. Uzupełnij formularz powyżej, aby dodać pierwsze auto!</p>
        ) : (
          <div className="car-grid">
            {cars.map(car => (
              <div
                key={car.id}
                className={`car-card${selectedCarId === car.id ? ' car-card-selected' : ''}`}
              >
                <button
                  type="button"
                  className="car-info"
                  onClick={() => setSelectedCarId(car.id)}
                  disabled={!selectionEnabled}
                  aria-pressed={selectedCarId === car.id}
                >
                  <div className="car-name">{car.brand} {car.model}</div>
                  <div className="car-details">
                    <Fuel className="fuel-icon" /> {car.fuelType} • {car.avgConsumption} l/100km
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteCar(car.id)}
                  className="delete-car-button"
                  title="Usuń auto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};