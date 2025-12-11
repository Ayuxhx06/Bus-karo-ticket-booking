# Bus Karo - Premium Bus Booking System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node](https://img.shields.io/badge/Node-v18+-green)
![React](https://img.shields.io/badge/React-18-blue)

## 🚀 Live Demo
**[https://bus-karo-ticket-booking.onrender.com/](https://bus-karo-ticket-booking.onrender.com/)**

A full-stack bus booking application with real-time seat selection, authentication, and advanced booking features.

## 🌟 Features

### Core Functionality
- **Real-Time Seat Booking**: Interactive seat map with instant updates
- **Women-Only Seats**: First 4 seats reserved for women with pink color coding
- **Gender-Based Color System**: Pink for female-booked seats, gray for male-booked seats
- **Multi-Passenger Booking**: Collect name, age, gender, and meal preferences per passenger
- **Meal Options**: Veg/Non-Veg meal selection (₹100/meal)
- **Search & Filters**: Filter by source, destination, date, and bus type
- **Authentication**: Login/Signup with guest mode support
- **Concurrency Handling**: Prevents double-booking with proper transaction management

### Technical Highlights
- Gender validation for women-only seats
- Real-time seat availability updates
- Responsive design with modern UI
- SQLite database with proper indexing
- RESTful API architecture

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

**Backend:**
- Node.js with Express
- TypeScript
- better-sqlite3 for database
- CORS enabled

**Database:**
- SQLite with optimized schema
- Indexes on frequently queried columns
- Transaction-based seat locking

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Ticket Booking"
```

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
Server will start at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will start at `http://localhost:5173`

### 4. Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
Ticket Booking/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth & Booking contexts
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── database/      # DB initialization & seeding
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── package.json
│
└── README.md
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts (id, name, email, role)
- **buses**: Bus information (id, name, type, route, price, amenities)
- **seats**: Seat details (id, bus_id, seat_number, status, is_women_only, booked_by_gender)
- **bookings**: Booking records (id, user_id, bus_id, seat_ids, passenger_details, status)

### Key Features
- `booked_by_gender` column for color-coded seats
- `is_women_only` flag for reserved women seats
- Transaction-based booking for concurrency safety

## 🎯 Usage

### Making a Booking
1. Browse available buses on homepage
2. Use filters to find specific routes/dates
3. Click on a bus to view seat map
4. Select seats (green = available, pink = women-only)
5. Fill passenger details (name, age, gender, meal)
6. Enter contact information
7. Click "Pay & Confirm"
8. Seats are instantly booked and color-coded

### Color System
- 🟢 **Green**: Available seats
- 💗 **Pink**: Women-only seats OR booked by female passengers
- 🔴 **Red**: Currently selected by you
- ⚫ **Gray**: Booked by male passengers

### Admin Features
- Access at `/admin`
- Create new bus routes
- Configure amenities, pricing, schedules

## 🔒 Concurrency Handling

The system prevents race conditions through:
- Transaction-based seat locking
- Sorted seat ID queries (prevents deadlocks)
- Status validation before booking
- Immediate error response for conflicts

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📦 Production Deployment

### Build Frontend
```bash
cd client
npm run build
# Output in dist/ folder
```

### Build Backend
```bash
cd server
npm run build
# Output in dist/ folder
```

### Deployment Options
1. **Vercel/Netlify** (Frontend)
2. **Railway/Render** (Backend)
3. **Docker** (Full stack)

## 🐛 Troubleshooting

**Database Issues:**
```bash
# Reset database
cd server
Remove-Item database.sqlite -Force
npm run dev
```

**Port Already in Use:**
```bash
# Change PORT in .env file
# Or kill existing process
```

**Frontend Can't Connect:**
- Check VITE_API_URL in .env
- Ensure backend is running
- Check CORS settings

## 📝 API Endpoints

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get bus details with seats
- `POST /api/admin/buses` - Create new bus (admin)

### Bookings
- `POST /api/bookings` - Create new booking
- Body: `{ userId, busId, seatIds, passengerDetails }`

## 👥 Contributors

Created for Modex Assessment

## 📄 License

Private - For Assessment Use Only

## 🙏 Acknowledgments

- React Team for amazing framework
- Tailwind CSS for utility-first styling
- better-sqlite3 for fast database operations

---
**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: December 2025
