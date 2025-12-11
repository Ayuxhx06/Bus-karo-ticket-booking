import db from '../config/database';

export const initializeDatabase = () => {
    // Create tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      total_seats INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bus_id INTEGER NOT NULL,
      seat_number INTEGER NOT NULL,
      status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'BOOKED', 'LOCKED')),
      FOREIGN KEY (bus_id) REFERENCES buses(id),
      UNIQUE(bus_id, seat_number)
    );

    CREATE INDEX IF NOT EXISTS idx_seats_bus_id ON seats(bus_id);
    CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bus_id INTEGER NOT NULL,
      seat_ids TEXT NOT NULL,
      status TEXT DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (bus_id) REFERENCES buses(id)
    );
  `);

    console.log('✅ SQLite database initialized');
};

export const seedDatabase = () => {
    // Check if already seeded
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) {
        console.log('Database already seeded');
        return;
    }

    // Insert sample user
    db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Admin User', 'admin@busbook.com', 'admin');
    db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Test User', 'user@busbook.com', 'user');

    // Insert sample buses
    const buses = [
        { name: 'Mumbai Express', start_time: new Date(Date.now() + 86400000).toISOString(), total_seats: 40 },
        { name: 'Delhi Superfast', start_time: new Date(Date.now() + 172800000).toISOString(), total_seats: 36 },
        { name: 'Bangalore Sleeper', start_time: new Date(Date.now() + 259200000).toISOString(), total_seats: 50 },
    ];

    buses.forEach(bus => {
        const result = db.prepare('INSERT INTO buses (name, start_time, total_seats) VALUES (?, ?, ?)').run(bus.name, bus.start_time, bus.total_seats);
        const busId = result.lastInsertRowid;

        // Create seats
        for (let i = 1; i <= bus.total_seats; i++) {
            db.prepare('INSERT INTO seats (bus_id, seat_number, status) VALUES (?, ?, ?)').run(busId, i, 'AVAILABLE');
        }
        console.log(`✅ Created bus: ${bus.name} with ${bus.total_seats} seats`);
    });

    console.log('🎉 Database seeded successfully!');
};
