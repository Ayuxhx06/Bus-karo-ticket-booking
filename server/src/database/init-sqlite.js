const db = require('../config/database');

const initializeDatabase = () => {
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
      bus_type TEXT NOT NULL,
      from_city TEXT NOT NULL,
      to_city TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      total_seats INTEGER NOT NULL,
      price REAL DEFAULT 0,
      bus_image TEXT,
      amenities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bus_id INTEGER NOT NULL,
      seat_number INTEGER NOT NULL,
      status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'BOOKED', 'LOCKED')),
      is_women_only INTEGER DEFAULT 0,
      booked_by_gender TEXT,
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
      passenger_details TEXT,
      status TEXT DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (bus_id) REFERENCES buses(id)
    );
  `);

  console.log('✅ SQLite database initialized with gender tracking');
};

const seedDatabase = () => {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('📊 Database already seeded');
    return;
  }

  // Insert sample users
  db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Admin User', 'admin@buskaro.com', 'admin');
  db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Test User', 'user@buskaro.com', 'user');

  // Insert premium buses with realistic routes
  const buses = [
    {
      name: 'Red Roadways Express',
      bus_type: 'Volvo 9000 Multi-Axle',
      from_city: 'Mumbai',
      to_city: 'Indore',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      total_seats: 40,
      price: 1200,
      bus_image: 'volvo_luxury_bus',
      amenities: 'AC,WiFi,Charging Points,Water Bottle,Blankets'
    },
    {
      name: 'Golden Line Sleeper',
      bus_type: 'Bharat Benz Sleeper',
      from_city: 'Kanpur',
      to_city: 'Gwalior',
      start_time: new Date(Date.now() + 129600000).toISOString(),
      total_seats: 36,
      price: 900,
      bus_image: 'bharat_benz_bus',
      amenities: 'AC,Sleeper,WiFi,Charging Points,Reading Light'
    },
    {
      name: 'Platinum Travels',
      bus_type: 'Mercedes Multi-Axle',
      from_city: 'Delhi',
      to_city: 'Jaipur',
      start_time: new Date(Date.now() + 172800000).toISOString(),
      total_seats: 45,
      price: 800,
      bus_image: 'mercedes_sleeper_bus',
      amenities: 'AC,WiFi,Snacks,Entertainment,USB Charging'
    },
    {
      name: 'Royal Express',
      bus_type: 'Volvo 9000 Multi-Axle',
      from_city: 'Pune',
      to_city: 'Bangalore',
      start_time: new Date(Date.now() + 259200000).toISOString(),
      total_seats: 40,
      price: 1500,
      bus_image: 'volvo_luxury_bus',
      amenities: 'AC,WiFi,Charging Points,Meals,Blankets'
    },
    {
      name: 'Star Line Travels',
      bus_type: 'Bharat Benz Sleeper',
      from_city: 'Lucknow',
      to_city: 'Agra',
      start_time: new Date(Date.now() + 345600000).toISOString(),
      total_seats: 36,
      price: 700,
      bus_image: 'bharat_benz_bus',
      amenities: 'AC,Sleeper,WiFi,Charging Points,Water'
    }
  ];

  buses.forEach(bus => {
    const result = db.prepare(`
      INSERT INTO buses (name, bus_type, from_city, to_city, start_time, total_seats, price, bus_image, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bus.name, bus.bus_type, bus.from_city, bus.to_city, bus.start_time, bus.total_seats, bus.price, bus.bus_image, bus.amenities);

    const busId = result.lastInsertRowid;

    // Create seats with women-only reserved seats
    for (let i = 1; i <= bus.total_seats; i++) {
      const isWomenOnly = i <= 4 ? 1 : 0;
      db.prepare('INSERT INTO seats (bus_id, seat_number, status, is_women_only) VALUES (?, ?, ?, ?)').run(busId, i, 'AVAILABLE', isWomenOnly);
    }
    console.log(`✅ Created ${bus.bus_type}: ${bus.from_city} → ${bus.to_city} (${bus.total_seats} seats, 4 women-only)`);
  });

  console.log('🎉 Database seeded successfully!');
};

module.exports = { initializeDatabase, seedDatabase };
