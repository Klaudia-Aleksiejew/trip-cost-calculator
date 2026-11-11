import React, { useState, useEffect } from 'react';
import { getCars, createCar, deleteCar, updateCar } from '../services/api';
import type { Car } from '../services/api';
import { Trash2, Plus, Fuel, Pencil, X } from 'lucide-react';

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
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editAvgConsumption, setEditAvgConsumption] = useState('');
  const [editFuelType, setEditFuelType] = useState<Car['fuelType']>('benzyna');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
  const isEditFormValid =
    editBrand.trim() !== '' &&
    editModel.trim() !== '' &&
    editAvgConsumption !== '' &&
    Number.isFinite(Number(editAvgConsumption)) &&
    Number(editAvgConsumption) > 0;

  const openEditDialog = (car: Car) => {
    setEditingCar(car);
    setEditBrand(car.brand);
    setEditModel(car.model);
    setEditAvgConsumption(String(car.avgConsumption));
    setEditFuelType(car.fuelType);
    setEditError('');
  };

  const closeEditDialog = () => {
    if (isSavingEdit) return;
    setEditingCar(null);
    setEditError('');
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCar || !isEditFormValid) {
      setEditError('Wypełnij poprawnie wszystkie pola (spalanie musi być większe od 0).');
      return;
    }

    setIsSavingEdit(true);
    setEditError('');
    try {
      const updatedCar = await updateCar(editingCar.id, {
        brand: editBrand.trim(),
        model: editModel.trim(),
        avgConsumption: Number(editAvgConsumption),
        fuelType: editFuelType,
      });
      setCars(previousCars =>
        previousCars.map(car => car.id === updatedCar.id ? updatedCar : car),
      );
      setEditingCar(null);
    } catch (requestError) {
      setEditError(
        requestError instanceof Error
          ? requestError.message
          : 'Nie udało się zapisać zmian w samochodzie.',
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

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
                  onClick={() => openEditDialog(car)}
                  className="edit-car-button"
                  title={`Edytuj ${car.brand} ${car.model}`}
                  aria-label={`Edytuj ${car.brand} ${car.model}`}
                >
                  <Pencil size={16} />
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

      {editingCar && (
        <div
          className="edit-dialog-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeEditDialog();
          }}
          onKeyDown={event => {
            if (event.key === 'Escape') closeEditDialog();
          }}
        >
          <section
            className="edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-car-title"
          >
            <header className="edit-dialog-heading">
              <div>
                <p className="edit-dialog-eyebrow">Zapisany samochód</p>
                <h2 id="edit-car-title">Edytuj samochód</h2>
              </div>
              <button
                type="button"
                className="edit-dialog-close"
                onClick={closeEditDialog}
                disabled={isSavingEdit}
                aria-label="Zamknij okno edycji"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={event => void handleSaveEdit(event)}>
              <div className="edit-dialog-fields">
                <div className="car-field">
                  <label className="car-field-label" htmlFor="edit-car-brand">Marka</label>
                  <input
                    autoFocus
                    required
                    id="edit-car-brand"
                    className="car-field-input"
                    value={editBrand}
                    onChange={event => setEditBrand(event.target.value)}
                  />
                </div>
                <div className="car-field">
                  <label className="car-field-label" htmlFor="edit-car-model">Model</label>
                  <input
                    required
                    id="edit-car-model"
                    className="car-field-input"
                    value={editModel}
                    onChange={event => setEditModel(event.target.value)}
                  />
                </div>
                <div className="car-field">
                  <label className="car-field-label" htmlFor="edit-car-consumption">
                    Spalanie (l/100km)
                  </label>
                  <input
                    required
                    id="edit-car-consumption"
                    className="car-field-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={editAvgConsumption}
                    onChange={event => setEditAvgConsumption(event.target.value)}
                  />
                </div>
                <div className="car-field">
                  <label className="car-field-label" htmlFor="edit-car-fuel-type">
                    Rodzaj paliwa
                  </label>
                  <select
                    id="edit-car-fuel-type"
                    className="car-field-input"
                    value={editFuelType}
                    onChange={event => {
                      const value = event.target.value;
                      if (value === 'benzyna' || value === 'diesel' || value === 'lpg') {
                        setEditFuelType(value);
                      }
                    }}
                  >
                    <option value="benzyna">Benzyna</option>
                    <option value="diesel">Diesel</option>
                    <option value="lpg">LPG</option>
                  </select>
                </div>
              </div>

              {editError && <p className="form-error edit-dialog-error" role="alert">{editError}</p>}

              <div className="edit-dialog-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={closeEditDialog}
                  disabled={isSavingEdit}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={!isEditFormValid || isSavingEdit}
                >
                  {isSavingEdit ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};