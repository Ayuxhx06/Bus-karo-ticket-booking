-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buses/Trips Table
CREATE TABLE IF NOT EXISTS buses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  total_seats INT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seats Table
-- status: 'AVAILABLE', 'BOOKED', 'LOCKED' (for transaction)
CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  bus_id INT REFERENCES buses(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE',
  version INT DEFAULT 0, -- Optimistic locking support (optional, but we use pessimistic)
  UNIQUE(bus_id, seat_number)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  bus_id INT REFERENCES buses(id),
  seat_ids INT[] NOT NULL, -- Array of seat IDs
  total_amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'CONFIRMED', -- 'PENDING', 'CONFIRMED', 'CANCELLED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_seats_bus_id ON seats(bus_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
