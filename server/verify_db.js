const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log('Opening database at:', dbPath);

const db = new Database(dbPath);

try {
    console.log('\n--- Checking Recent Bookings ---');
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY id DESC LIMIT 5').all();
    console.log('Recent Bookings Count:', bookings.length);
    if (bookings.length > 0) {
        console.log('Last Booking:', JSON.stringify(bookings[0], null, 2));
    } else {
        console.log('No bookings found.');
    }

    console.log('\n--- Checking Seat Status (Bus 1) ---');
    const seats = db.prepare('SELECT * FROM seats WHERE bus_id = 1 AND status = "BOOKED"').all();
    console.log('Total Booked Seats (Bus 1):', seats.length);
    seats.forEach(seat => {
        console.log(`Seat ${seat.seat_number}: Status=${seat.status}, Gender=${seat.booked_by_gender}, WomenOnly=${seat.is_women_only}`);
    });

} catch (err) {
    console.error('Error querying database:', err);
}
