# Campus Print & Deliver System - Database Setup Guide

This guide explains how to set up and configure the PostgreSQL database for the Campus Print & Deliver System.

## Technology Stack

- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Password Hashing**: bcrypt
- **Driver**: pg (node-postgres)

## Prerequisites

Choose one of the following setup methods:

### Option 1: Docker (Recommended - Easiest)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- No additional setup needed

### Option 2: Local PostgreSQL Installation
- Install [PostgreSQL 14+](https://www.postgresql.org/download/)
- PostgreSQL running on `localhost:5432`

## Database Setup Instructions

### Using Docker (Recommended)

1. **Start PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Create a PostgreSQL 16 container named `campus-print-db`
   - Create the database `campus_print_deliver`
   - Start pgAdmin at `http://localhost:5050` (optional database UI)

2. **Update `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_print_deliver"
   ```

3. **Initialize database schema:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Verify connection:**
   ```bash
   npx prisma db push
   ```

### Using Local PostgreSQL

1. **Create database:**
   ```bash
   createdb campus_print_deliver
   ```

2. **Update `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campus_print_deliver"
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

3. **Initialize database schema:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Available Database Commands

```bash
# Apply migrations to database
npx prisma migrate dev

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (careful - deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## Database Schema

The database includes the following tables:

### Orders (`orders`)
- Stores student print orders
- Tracks order status, pricing, and payment
- Indexed by: `studentEmailOrPhone`, `status`, `createdAt`

### FileItems (`file_items`)
- Stores uploaded files associated with orders
- Contains file metadata (name, size, type, upload date)
- Indexed by: `orderId`

### OrderStatusHistory (`order_status_history`)
- Tracks all status changes for auditing
- Records who changed the status and when
- Indexed by: `orderId`, `changedAt`

### AdminUsers (`admin_users`)
- Stores admin user credentials (password is hashed)
- Tracks admin role

### ActivityLogs (`activity_logs`)
- Logs all admin actions (login, logout, order updates)
- Useful for auditing and debugging

### Payments (`payments`)
- Stores payment information for each order
- Tracks payment status and transaction IDs

## API Endpoints

### Order Management
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/student/:email` - Get orders by student email
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/confirm-payment` - Confirm payment
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/dashboard` - Get order statistics

### Admin Management
- `POST /api/admin/login` - Admin login
- `POST /api/admin/users` - Create new admin user
- `GET /api/admin/logs` - Get activity logs
- `POST /api/admin/logs` - Log activity

## Troubleshooting

### Connection Error: "ECONNREFUSED"
- Ensure PostgreSQL is running
- Verify `.env` DATABASE_URL is correct
- For Docker: `docker-compose logs postgres`

### Migration Error
- Reset migrations: `npx prisma migrate reset`
- Then reapply: `npx prisma migrate dev`

### Port Already in Use (5432)
- Check if another PostgreSQL instance is running
- Change port in `docker-compose.yml` or `.env`

### pgAdmin Access
- URL: `http://localhost:5050`
- Email: `admin@example.com`
- Password: `admin`
- Add server: Host = `postgres`, Username = `postgres`, Password = `postgres`

## Prisma Studio

View and edit database data visually:
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

## Data Backup

To backup your database:
```bash
# Using Docker
docker exec campus-print-db pg_dump -U postgres campus_print_deliver > backup.sql

# Using local PostgreSQL
pg_dump -U postgres campus_print_deliver > backup.sql
```

To restore:
```bash
# Using Docker
docker exec -i campus-print-db psql -U postgres campus_print_deliver < backup.sql

# Using local PostgreSQL
psql -U postgres campus_print_deliver < backup.sql
```

## Production Considerations

For production deployment:
1. Use environment variables for sensitive data
2. Hash passwords (already configured with bcrypt)
3. Use connection pooling (consider Prisma's built-in support)
4. Enable SSL for database connections
5. Set up automated backups
6. Monitor database performance
7. Implement proper access controls
8. Use read replicas for scaling

## Next Steps

1. Start the database: `docker-compose up -d` (or use local PostgreSQL)
2. Run migrations: `npx prisma migrate dev`
3. Start the development server: `ng serve`
4. API endpoints are now available at `http://localhost:PORT/api/`

## Support

For issues or questions:
- Check Prisma documentation: https://www.prisma.io/docs/
- View database schema: `npx prisma studio`
- Check logs: `docker logs campus-print-db`
