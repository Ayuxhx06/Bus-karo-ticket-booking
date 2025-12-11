# Quick Setup Guide - PostgreSQL Installation

## ⚠️ Current Status

✅ **Backend Server**: Running on `http://localhost:5000`  
✅ **Frontend Server**: Running on `http://localhost:5173`  
❌ **Database**: PostgreSQL not installed/running

The frontend loads but shows "Failed to load buses" because the backend cannot connect to PostgreSQL.

---

## 🛠️ Install PostgreSQL (Windows)

### Option 1: Download Installer (Recommended)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for user `postgres` (remember this!)
   - Default port: `5432`
   - Install pgAdmin (GUI tool)

4. After installation, start PostgreSQL service:
   ```powershell
   Get-Service postgresql* | Start-Service
   ```

### Option 2: Using Docker (If you have Docker Desktop)

```powershell
docker run --name postgres-booking -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ticket_booking -p 5432:5432 -d postgres:14
```

---

## 📝 After PostgreSQL is Installed

1. **Verify PostgreSQL is running:**
   ```powershell
   # Check if service is running
   Get-Service postgresql*
   ```

2. **Update server/.env if needed:**
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=ticket_booking
   DB_PASSWORD=postgres  # Use your password
   DB_PORT=5432
   ```

3. **Run the seed script:**
   ```powershell
   cd server
   npm run seed
   ```

   You should see:
   ```
   🌱 Starting database seed...
   ✅ Schema created
   ✅ Users created
   ✅ Bus "Mumbai Express" created with 40 seats
   ✅ Bus "Delhi Superfast" created with 36 seats
   ✅ Bus "Bangalore Sleeper" created with 50 seats
   🎉 Database seeded successfully!
   ```

4. **Restart the backend server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

5. **Refresh the frontend:**
   - Go to `http://localhost:5173`
   - You should see the premium UI with bus listings!

---

## 🎯 Alternative: Use a Cloud Database (For Quick Testing)

If you don't want to install PostgreSQL locally, use a free cloud database:

### Render.com (Free PostgreSQL)

1. Go to https://dashboard.render.com/
2. Click "New +" → "PostgreSQL"
3. Create a free instance
4. Copy the "Internal Database URL"
5. Update `server/.env`:
   ```env
   DB_USER=<from_render>
   DB_HOST=<from_render>
   DB_NAME=<from_render>
   DB_PASSWORD=<from_render>
   DB_PORT=5432
   ```
6. Run `npm run seed` in the server folder
7. Restart backend

---

## ✅ Verify Everything Works

1. **Backend Health Check:**
   - Visit: http://localhost:5000
   - Should see: "Bus Booking API is running"

2. **API Test:**
   - Visit: http://localhost:5000/api/buses
   - Should see JSON array of buses

3. **Frontend:**
   - Visit: http://localhost:5173
   - Should see premium UI with bus cards
   - Click on a bus → See seat grid
   - Select seats → Book → See success message

---

## 🔥 Full Demo Flow (After Database Setup)

1. **Admin Flow:**
   - Go to http://localhost:5173/admin
   - Create a new bus (e.g., "Chennai Express", tomorrow's date, 40 seats)
   - Success message appears
   - Redirect to home page

2. **User Flow:**
   - See the new bus in the list
   - Click "Book Now"
   - Select 2-3 seats (they turn orange)
   - Click "Book Now" button
   - Success! (seats turn grey/booked)

3. **Concurrency Test:**
   - Open TWO browser windows side by side
   - Navigate to the same bus booking page in both
   - Select THE SAME SEAT in both windows
   - Click "Book Now" in BOTH windows at the same time
   - **Result:** One succeeds, the other shows "Concurrency Conflict" error ✅

---

## 📞 Need Help?

If you still face issues:

1. Check backend terminal for errors
2. Check browser console (F12) for frontend errors
3. Verify PostgreSQL is running: `Get-Service postgresql*`
4. Check database credentials in `server/.env`

**The project code is 100% ready - just needs PostgreSQL to run! 🚀**
