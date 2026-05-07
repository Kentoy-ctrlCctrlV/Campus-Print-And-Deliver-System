# Quick Reference Guide

## Database Commands

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs postgres

# Database initialization (after updating .env)
npx prisma migrate dev --name init

# View database GUI
npx prisma studio

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name [migration_name]

# Backup database
docker exec campus-print-db pg_dump -U postgres campus_print_deliver > backup.sql

# Restore database
docker exec -i campus-print-db psql -U postgres campus_print_deliver < backup.sql
```

## API Examples

### Create New Order
```bash
curl -X POST http://localhost:PORT/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Juan Dela Cruz",
    "studentEmailOrPhone": "juan@kean.edu.ph",
    "deliveryBuilding": "Building A",
    "printMode": "color",
    "paperSize": "A4",
    "copies": 2,
    "pagesPerCopy": 10,
    "totalPages": 20,
    "totalPrice": 150.00,
    "paymentMethod": "gcash",
    "notes": "Print on both sides"
  }'
```

### Get All Orders
```bash
curl http://localhost:PORT/api/orders
```

### Get Order by ID
```bash
curl http://localhost:PORT/api/orders/[order-id]
```

### Get Orders by Student Email
```bash
curl http://localhost:PORT/api/orders/student/juan@kean.edu.ph
```

### Update Order Status
```bash
curl -X PUT http://localhost:PORT/api/orders/[order-id]/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "printing",
    "changedBy": "admin-username"
  }'
```

### Confirm Payment
```bash
curl -X PUT http://localhost:PORT/api/orders/[order-id]/confirm-payment \
  -H "Content-Type: application/json"
```

### Cancel Order
```bash
curl -X PUT http://localhost:PORT/api/orders/[order-id]/cancel \
  -H "Content-Type: application/json"
```

### Create Admin User
```bash
curl -X POST http://localhost:PORT/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@kean.edu.ph",
    "password": "SecurePassword123!"
  }'
```

### Admin Login
```bash
curl -X POST http://localhost:PORT/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "SecurePassword123!"
  }'
```

### Get Activity Logs
```bash
curl http://localhost:PORT/api/admin/logs
```

### Log Activity
```bash
curl -X POST http://localhost:PORT/api/admin/logs \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-id",
    "action": "order_status_updated",
    "orderId": "order-id",
    "details": {"previousStatus": "pending", "newStatus": "printing"}
  }'
```

### Get Order Statistics
```bash
curl http://localhost:PORT/api/orders/stats/dashboard
```

Response Example:
```json
{
  "total": 25,
  "pending": 5,
  "printing": 8,
  "delivering": 3,
  "completed": 9
}
```

## Database Schema Quick Reference

### Orders Table
```
id (PK)
studentName
studentEmailOrPhone (indexed)
deliveryBuilding
printMode (bw | color)
paperSize (A4 | short | long)
copies
pagesPerCopy
totalPages
totalPrice
paymentMethod (gcash | cod)
paymentConfirmed
notes
status (pending | printing | delivering | completed | cancelled) (indexed)
createdAt (indexed)
updatedAt
estimatedCompletion
```

### FileItems Table
```
id (PK)
orderId (FK, indexed)
name
sizeInBytes
type (pdf | doc | docx | other)
uploadedAt
fileUrl
storagePath
```

### AdminUsers Table
```
id (PK)
username (unique)
password (hashed with bcrypt)
email (unique)
role (always 'admin')
createdAt
updatedAt
```

### OrderStatusHistory Table
```
id (PK)
orderId (FK, indexed)
previousStatus
newStatus
changedAt (indexed)
changedBy (admin username or 'system')
notes
```

### ActivityLogs Table
```
id (PK)
adminId (FK, indexed)
action
orderId (optional)
details (JSON)
createdAt (indexed)
```

### Payments Table
```
id (PK)
orderId (FK, unique)
amount
paymentMethod
status (pending | confirmed | failed)
transactionId
confirmedAt
createdAt
updatedAt
```

## Environment Setup

### .env File
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_print_deliver"
```

## Port Configuration

- **Angular App**: `http://localhost:4200` (or alternate if port in use)
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050` (if using Docker)
- **Prisma Studio**: `http://localhost:5555`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5432 in use | Change port in `docker-compose.yml` or `.env` |
| Database connection refused | Verify PostgreSQL is running (`docker ps`) |
| Migration failed | Run `npx prisma migrate reset` then redeploy |
| Can't access pgAdmin | Check port 5050 is available, verify Docker container is running |
| Wrong password for postgres | Check docker-compose.yml for credentials |

## Status Values

- **pending** - Order received, awaiting processing
- **printing** - Currently being printed
- **delivering** - Printed and being delivered
- **completed** - Delivered to student
- **cancelled** - Order was cancelled

## Payment Methods

- **gcash** - GCash mobile payment
- **cod** - Cash on Delivery

## Print Modes

- **bw** - Black & White
- **color** - Color printing

## Paper Sizes

- **A4** - Standard A4 paper
- **short** - Short bond paper
- **long** - Long bond paper

---

Need help? Check `DATABASE_SETUP.md` for detailed instructions.
