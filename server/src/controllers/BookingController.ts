import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';

const bookingService = new BookingService();

export class BookingController {

    // POST /api/admin/buses
    async createBus(req: Request, res: Response) {
        try {
            const bus = await bookingService.createBus(req.body);
            res.status(201).json(bus);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // GET /api/buses
    async getBuses(req: Request, res: Response) {
        try {
            const buses = await bookingService.getAllBuses();
            res.json(buses);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/buses/:id
    async getBusDetails(req: Request, res: Response) {
        try {
            const busId = parseInt(req.params.id);
            const data = await bookingService.getBusDetails(busId);
            res.json(data);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    // POST /api/bookings
    async createBooking(req: Request, res: Response) {
        try {
            const { userId, busId, seatIds, passengerDetails } = req.body;
            // Basic mock user ID if not provided (for assessment simplicity)
            const uId = userId || 1;

            const booking = await bookingService.createBooking(uId, busId, seatIds, passengerDetails);
            res.status(201).json(booking);
        } catch (error: any) {
            // Handle known errors
            if (error.message.includes('not available')) {
                res.status(409).json({ error: 'Concurrency Conflict: ' + error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }
}
