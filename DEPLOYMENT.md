# Deployment Guide - Bus Karo

## Quick Deployment Options

### Option 1: Local Production Build

#### Backend
```bash
cd server
npm install --production
npm run build
PORT=5000 npm start
```

#### Frontend
```bash
cd client
npm install
npm run build
# Serve dist/ folder with any static server
npx serve -s dist -p 3000
```

### Option 2: Cloud Deployment

#### Backend on Railway/Render
1. Create new project
2. Connect GitHub repository
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   ```
4. Build command: `cd server && npm install && npm run build`
5. Start command: `cd server && npm start`

#### Frontend on Vercel/Netlify
1. Connect repository
2. Set build settings:
   - Build command: `cd client && npm run build`
   - Output directory: `client/dist`
3. Environment variable:
   ```
   VITE_API_URL=<your-backend-url>/api
   ```

### Option 3: Docker Deployment

#### Create Dockerfiles

**server/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

**client/Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
  
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run: `docker-compose up -d`

## Environment Configuration

### Production Environment Variables

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=<your-frontend-url>
```

**Frontend (.env.production):**
```env
VITE_API_URL=<your-backend-url>/api
```

## Database Setup

### For Production
SQLite database will be created automatically on first run.

### Seeding Data
The system auto-seeds 5 buses on initialization. To customize:
1. Edit `server/src/database/init-sqlite.js`
2. Modify the `buses` array in `seedDatabase()`
3. Restart server

## Post-Deployment Checklist

- [ ] Verify backend is accessible
- [ ] Verify frontend loads
- [ ] Test complete booking flow
- [ ] Check database persistence
- [ ] Verify seat color changes
- [ ] Test search filters
- [ ] Test authentication
- [ ] Check error handling
- [ ] Verify women-only seat validation

## Monitoring

### Health Check Endpoints
- Backend: `GET /` (returns "OK")
- Database: Check `database.sqlite` file exists

### Logs
- Backend logs to console
- Use PM2 for process management and logging

```bash
npm install -g pm2
cd server
pm2 start npm --name "bus-karo-backend" -- start
pm2 logs
```

## Scaling Considerations

### Current Limitations
- SQLite (single-file database)
- No horizontal scaling support

### For Scale
Consider migrating to:
- PostgreSQL/MySQL for database
- Redis for session management
- Load balancer for multiple instances

## Security Checklist

- [ ] CORS properly configured
- [ ] SQL injection prevention (using prepared statements)
- [ ] Input validation on all endpoints
- [ ] HTTPS in production
- [ ] Environment variables protected
- [ ] Rate limiting (consider adding)

## Backup Strategy

### Database Backup
```bash
# Backup SQLite database
cp server/database.sqlite server/backup-$(date +%Y%m%d).sqlite

# Restore
cp server/backup-YYYYMMDD.sqlite server/database.sqlite
```

## Support & Troubleshooting

### Common Production Issues

**Database locked:**
- SQLite limitation with concurrent writes
- Consider PostgreSQL for heavy traffic

**CORS errors:**
- Update CORS_ORIGIN in backend .env
- Check frontend VITE_API_URL

**Build failures:**
- Clear node_modules and reinstall
- Check Node version compatibility (v18+)

---
**Deployment Status**: ✅ Ready for Production
