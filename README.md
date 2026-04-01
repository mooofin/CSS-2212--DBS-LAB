# Grand Stay: Hotel Management System

Database Systems Lab project. A working hotel management system with business logic in MySQL.



## Run It

```bash
./manage.sh start
```

Installs dependencies and starts backend (3001) and frontend (5173).

**Commands:**
```bash
./manage.sh stop      
./manage.sh restart   
./manage.sh test      # API tests
./manage.sh status    # 
./manage.sh clean     # Clean build
```



## Demo Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin` | `admin123` | Reports, billing |
| Staff | `staff` | `staff123` | Bookings, check-ins |
| Guest | (in DB) | `password123` | Own bookings |


## Stack

- Node.js + Express backend
- React + Vite frontend
- MySQL 8+ database
- Tailwind CSS

### Architecture

![System Architecture](./architecture_refined.svg)

The system uses a three-tier architecture. React handles the interface. Express provides REST endpoints. MySQL manages data and enforces business rules through triggers and stored views.

**Control Flow:**

A guest searches for rooms. The frontend sends a request to `/api/rooms`. The endpoint queries a view that already calculated availability-checking current bookings, maintenance status, and date conflicts in a single SELECT. The view returns the data. The API returns JSON. React renders the list.

When staff check in a guest, the flow changes. The frontend POSTs to `/api/bookings/:id/checkin`. Express receives the request and updates the booking status. A database trigger fires automatically, marking the room as occupied. Another trigger creates a billing record with calculated charges and tax. No application code handles these updates. The database maintains consistency.

This design centralizes business logic. Room availability, billing calculations, and state transitions all happen in SQL. The API layer remains thin: read from views, write to tables. Fewer bugs, less code. The cost is expertise: debugging requires reading trigger definitions and understanding MySQL's execution order.


## Structure

```
hotel-project/
├── backend/
│   ├── db/          # SQL schemas, triggers
│   ├── routes/      # API endpoints
│   └── server.js
├── frontend/
│   └── src/         # React components
└── manage.sh
```

---

Built for CSS 2212 (Database Systems Lab)
"
