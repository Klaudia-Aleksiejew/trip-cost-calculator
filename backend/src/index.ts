import express from 'express';
import cors from 'cors';
import carRoutes from './routes/car.routes';
import tripRoutes from './routes/trip.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Cors configuration
app.use(cors({
  origin: 'http://localhost:5173', // domyślny port Vite / React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// API path configuration
app.use('/api/cars', carRoutes);
app.use('/api/trip', tripRoutes);

// Test endpoint to check if the server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API kalkulatora podróży działa poprawnie!' });
});


app.listen(PORT, () => {
  console.log(`Serwer backendowy działa na porcie http://localhost:${PORT}`);
});