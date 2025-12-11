import db from '../config/database';

interface Bus {
    id: number;
    name: string;
    start_time: string;
    total_seats: number;
}

interface Seat {
    id: number;
    bus_id: number;
    seat_number: number;
    status: string;
}

interface Booking {
    id: number;
    user_id: number;
    bus_id: number;
    seat_ids: string;
    status: string;
    created_at: string;
}

export class BookingRepository {
    async getAllBuses(): Promise<Bus[]> {
        const buses = db.prepare('SELECT * FROM buses ORDER BY start_time').all();
        return buses as Bus[];
    }

    async getBusById(busId: number): Promise<(Bus & { seats: Seat[] }) | null> {
        const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(busId);
        if (!bus) return null;

        const seats = db.prepare('SELECT * FROM seats WHERE bus_id = ? ORDER BY seat_number').all(busId);
        return { ...(bus as Bus), seats: seats as Seat[] };
    }

    async createBus(name: string, startTime: string, totalSeats: number): Promise<Bus> {
        const result = db.prepare('INSERT INTO buses (name, start_time, total_seats) VALUES (?, ?, ?)').run(name, startTime, totalSeats);
        const busId = Number(result.lastInsertRowid);

        // Create seats
        for (let i = 1; i <= totalSeats; i++) {
            db.prepare('INSERT INTO seats (bus_id, seat_number, status) VALUES (?, ?, ?)').run(busId, i, 'AVAILABLE');
        }

        const newBus = db.prepare('SELECT * FROM buses WHERE id = ?').get(busId);
        return newBus as Bus;
    }

    async bookSeats(userId: number, busId: number, seatIds: number[]): Promise<Booking> {
        const result: Booking = db.transaction(() => {
            // Sort seat IDs to prevent deadlocks
            const sortedSeatIds = [...seatIds].sort((a, b) => a - b);

            // Lock and check seats
            const placeholders = sortedSeatIds.map(() => '?').join(',');
            const seats = db.prepare(`SELECT * FROM seats WHERE id IN (${placeholders})`).all(...sortedSeatIds);

            if ((seats as any[]).length !== seatIds.length) {
                throw new Error('Some seats not found');
            }

            const unavailableSeats = (seats as Seat[]).filter(seat => seat.status !== 'AVAILABLE');
            if (unavailableSeats.length > 0) {
                const seatNums = unavailableSeats.map(s => s.seat_number).join(', ');
                throw new Error(`Seats ${seatNums} are not available`);
            }

            // Update seats to BOOKED
            sortedSeatIds.forEach(seatId => {
                db.prepare('UPDATE seats SET status = ? WHERE id = ?').run('BOOKED', seatId);
            });

            // Create booking
            const bookingResult = db.prepare('INSERT INTO bookings (user_id, bus_id, seat_ids, status) VALUES (?, ?, ?, ?)').run(
                userId,
                busId,
                JSON.stringify(sortedSeatIds),
                'CONFIRMED'
            );

            const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(bookingResult.lastInsertRowid));
            return booking as Booking;
        })();

        return result;
    }
}

export const bookingRepository = new BookingRepository();
