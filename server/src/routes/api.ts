import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';

const router = Router();
const bookingController = new BookingController();

// Admin Routes
router.post('/admin/buses', (req, res) => bookingController.createBus(req, res));

// User Routes
router.get('/buses', (req, res) => bookingController.getBuses(req, res));
router.get('/buses/:id', (req, res) => bookingController.getBusDetails(req, res));
router.post('/bookings', (req, res) => bookingController.createBooking(req, res));

export default router;
