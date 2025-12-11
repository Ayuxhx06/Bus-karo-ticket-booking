# Architecture Documentation - Bus Karo

## System Overview

Bus Karo is a full-stack bus booking platform built with a modern three-tier architecture:
- **Presentation Layer**: React SPA with TypeScript
- **Application Layer**: Node.js REST API
- **Data Layer**: SQLite database

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pages   │  │ Context  │  │   API    │ │
│  │          │◄─┤          │◄─┤  Client  │ │
│  └──────────┘  └──────────┘  └────┬─────┘ │
└───────────────────────────────────┼─────────┘
                                    │ HTTP/REST
┌───────────────────────────────────┼─────────┐
│           Backend (Node.js)       │         │
│  ┌──────────┐  ┌──────────┐  ┌───▼─────┐  │
│  │  Routes  ├─►│Controller├─►│ Service │  │
│  └──────────┘  └──────────┘  └───┬─────┘  │
│                                    │        │
│                              ┌─────▼──────┐ │
│                              │ Repository │ │
│                              └─────┬──────┘ │
└────────────────────────────────────┼────────┘
                                     │ SQL
┌────────────────────────────────────▼────────┐
│           Database (SQLite)                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────┐ │
│  │ Users │ │ Buses │ │ Seats │ │Bookings│ │
│  └───────┘ └───────┘ └───────┘ └────────┘ │
└─────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture

#### Layer Structure
```
src/
├── pages/           # Route-level components
├── components/      # Reusable UI components
├── context/         # State management (Auth, Booking)
├── api/             # HTTP client & API calls
└── types/           # TypeScript interfaces
```

#### Key Components

**1. Authentication Context**
- Manages user session state
- Provides login/signup/guest functionality
- Persists to localStorage

**2. Booking Context**
- Manages selected seats state
- Global seat selection across app

**3. Pages**
- `HomePage`: Bus search & filters
- `BookingPage`: Seat selection & passenger details
- `LoginPage`: Authentication
- `AdminDashboard`: Bus management

### Backend Architecture

#### Layered Design

**1. Routes Layer** (`/routes`)
- Defines API endpoints
- HTTP method mapping
- Route grouping (auth, bookings, admin)

**2. Controller Layer** (`/controllers`)
- Request/response handling
- Input validation
- Error formatting
- HTTP status codes

**3. Service Layer** (`/services`)
- Business logic implementation
- Data validation
- Cross-cutting concerns

**4. Repository Layer** (`/repositories`)
- Database operations
- Query construction
- Transaction management

#### Design Patterns

**Repository Pattern**
- Separates data access from business logic
- Single source of truth for queries
- Easy to test and mock

**Transaction Pattern**
```javascript
db.transaction(() => {
  // Lock seats
  // Validate availability
  // Update status
  // Save booking
})();
```

## Database Design

### Schema

```sql
-- Users table
users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT
)

-- Buses table
buses (
  id INTEGER PRIMARY KEY,
  name TEXT,
  bus_type TEXT,
  from_city TEXT,
  to_city TEXT,
  start_time DATETIME,
  total_seats INTEGER,
  price REAL,
  amenities TEXT
)

-- Seats table
seats (
  id INTEGER PRIMARY KEY,
  bus_id INTEGER → buses(id),
  seat_number INTEGER,
  status TEXT CHECK(status IN ('AVAILABLE','BOOKED','LOCKED')),
  is_women_only INTEGER,
  booked_by_gender TEXT,
  UNIQUE(bus_id, seat_number)
)

-- Bookings table
bookings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER → users(id),
  bus_id INTEGER → buses(id),
  seat_ids TEXT,
  passenger_details TEXT,
  status TEXT
)
```

### Indexes
- `idx_seats_bus_id` on seats(bus_id)
- `idx_seats_status` on seats(status)

### Relationships
- One bus has many seats (1:N)
- One user has many bookings (1:N)
- One booking references multiple seats (N:M stored as JSON)

## Data Flow

### Booking Flow

```
User selects seat
       ↓
Frontend validates
       ↓
API POST /bookings
       ↓
Controller extracts request
       ↓
Service validates business rules
       ↓
Repository starts transaction
       ↓
   Lock seats (sorted by ID)
       ↓
   Check availability
       ↓
   Update seat status + gender
       ↓
   Create booking record
       ↓
   Commit transaction
       ↓
Return success
       ↓
Frontend refreshes bus data
       ↓
UI shows updated seat colors
```

## Concurrency Control

### Problem
Multiple users booking the same seat simultaneously.

### Solution
1. **Database Transactions**: Atomic operations
2. **Sorted Locking**: Prevents deadlocks by always locking seats in same order
3. **Status Validation**: Check seat is 'AVAILABLE' before booking
4. **Optimistic Locking**: Return error if seat taken

### Implementation
```javascript
// Sort to prevent deadlocks
const sortedSeatIds = [...seatIds].sort((a, b) => a - b);

db.transaction(() => {
  // Lock all seats at once
  const seats = db.prepare(
    `SELECT * FROM seats WHERE id IN (${placeholders})`
  ).all(...sortedSeatIds);
  
  // Validate all available
  if (seats.some(s => s.status !== 'AVAILABLE')) {
    throw new Error('Seat not available');
  }
  
  // Update all
  seats.forEach(seat => {
    db.prepare('UPDATE seats SET status = ?').run('BOOKED');
  });
})();
```

## State Management

### Frontend State

**React Context API**
- `AuthContext`: User authentication state
- `BookingContext`: Selected seats

**Component State**
- Form inputs (passenger details)
- Loading/error states
- UI toggles

### Backend State
- Stateless API design
- All state in database
- No session storage

## Security Considerations

### Implemented
- ✅ SQL injection prevention (prepared statements)
- ✅ Input validation (email, phone, age)
- ✅ CORS configuration
- ✅ Type safety (TypeScript)

### Recommended Additions
- Authentication tokens (JWT)
- Rate limiting
- Request payload size limits
- HTTPS enforcement
- Environment variable encryption

## Performance Optimizations

### Database
- Indexes on frequently queried columns
- Transaction batching for multiple updates
- Prepared statement reuse

### Frontend
- Code splitting (React.lazy)
- Framer Motion for smooth animations
- Debounced search filters
- Optimistic UI updates

### Backend
- Better-sqlite3 (faster than node-sqlite3)
- Connection pooling ready
- Minimal middleware overhead

## Scalability Path

### Current Limitations
- SQLite (single file, no horizontal scaling)
- In-memory state (no Redis)
- Single server instance

### Migration Path
1. **Database**: SQLite → PostgreSQL
2. **Caching**: Add Redis for sessions/seat locks
3. **Load Balancing**: Multiple backend instances
4. **CDN**: Frontend static assets
5. **Queue**: Background job processing

## Technology Choices

### Why SQLite?
- Zero configuration
- Perfect for MVP/assessment
- Fast for small-medium load
- Single file deployment

### Why TypeScript?
- Type safety reduces bugs
- Better IDE support
- Self-documenting code

### Why React Context?
- Built-in state management
- No external dependencies
- Simple for this scale

### Why Express?
- Minimal and flexible
- Large ecosystem
- Well-documented
- Easy to learn

## Deployment Architecture

### Production Setup
```
Internet
    ↓
  Nginx (Reverse Proxy)
    ↓
  ┌─────────────────┐
  │  Frontend (CDN) │
  └─────────────────┘
    ↓ API calls
  ┌─────────────────┐
  │  Backend Server │
  └─────────────────┘
    ↓
  ┌─────────────────┐
  │  SQLite File    │
  └─────────────────┘
```

---
**Version**: 1.0.0 | **Last Updated**: December 2025
