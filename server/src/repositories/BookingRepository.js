const db = require('../config/database');

class BookingRepository {
    async getAllBuses() {
        const buses = db.prepare('SELECT * FROM buses ORDER BY start_time').all();

        // Add available seats count for each bus
        return buses.map(bus => {
            const availableSeatsCount = db.prepare('SELECT COUNT(*) as count FROM seats WHERE bus_id = ? AND status = ?').get(bus.id, 'AVAILABLE');
            return {
                ...bus,
                available_seats: availableSeatsCount.count
            };
        });
    }

    async getBusById(busId) {
        const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(busId);
        if (!bus) return null;

        const seats = db.prepare('SELECT * FROM seats WHERE bus_id = ? ORDER BY seat_number').all(busId);
        return { ...bus, seats };
    }

    async createBus(name, bus_type, from_city, to_city, startTime, totalSeats, price, amenities) {
        const result = db.prepare(`
      INSERT INTO buses (name, bus_type, from_city, to_city, start_time, total_seats, price, amenities, bus_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, bus_type, from_city, to_city, startTime, totalSeats, price, amenities, 'volvo_luxury_bus');

        const busId = Number(result.lastInsertRowid);

        // Create seats with women-only seats (first 4)
        for (let i = 1; i <= totalSeats; i++) {
            const isWomenOnly = i <= 4 ? 1 : 0;
            db.prepare('INSERT INTO seats (bus_id, seat_number, status, is_women_only) VALUES (?, ?, ?, ?)').run(busId, i, 'AVAILABLE', isWomenOnly);
        }

        const newBus = db.prepare('SELECT * FROM buses WHERE id = ?').get(busId);
        return newBus;
    }

    async bookSeats(userId, busId, seatIds, passengerDetails = []) {
        const result = db.transaction(() => {
            // Sort seat IDs to prevent deadlocks
            const sortedSeatIds = [...seatIds].sort((a, b) => a - b);

            // Lock and check seats
            const placeholders = sortedSeatIds.map(() => '?').join(',');
            const seats = db.prepare(`SELECT * FROM seats WHERE id IN (${placeholders})`).all(...sortedSeatIds);

            if (seats.length !== seatIds.length) {
                throw new Error('Some seats not found');
            }

            const unavailableSeats = seats.filter(seat => seat.status !== 'AVAILABLE');
            if (unavailableSeats.length > 0) {
                const seatNums = unavailableSeats.map(s => s.seat_number).join(', ');
                throw new Error(`Seats ${seatNums} are not available`);
            }

            // Update seats to BOOKED and set gender
            sortedSeatIds.forEach((seatId, index) => {
                const seat = seats.find(s => s.id === seatId);
                const passenger = passengerDetails.find(p => p.seatNumber === seat.seat_number);
                const gender = passenger?.gender || null;

                db.prepare('UPDATE seats SET status = ?, booked_by_gender = ? WHERE id = ?')
                    .run('BOOKED', gender, seatId);
            });

            // Create booking with passenger details
            const bookingResult = db.prepare(`
        INSERT INTO bookings (user_id, bus_id, seat_ids, passenger_details, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
                userId,
                busId,
                JSON.stringify(sortedSeatIds),
                JSON.stringify(passengerDetails),
                'CONFIRMED'
            );

            const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(bookingResult.lastInsertRowid));
            return booking;
        })();

        return result;
    }
}

const bookingRepository = new BookingRepository();

module.exports = { BookingRepository, bookingRepository };
