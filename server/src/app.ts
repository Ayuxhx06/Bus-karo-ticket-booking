import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
const { initializeDatabase, seedDatabase } = require('./database/init-sqlite');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Initialize and seed database
initializeDatabase();
seedDatabase();

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Bus Booking API is running' });
});

app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
