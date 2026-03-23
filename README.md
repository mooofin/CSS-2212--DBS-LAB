# Grand Stay: A Deep Dive into Professional Hotel Management

The Grand Stay project represents a modern approach to hotel operations, prioritizing database integrity and high-performance frontend architecture. Originally developed as a Database Systems Lab project (CSS 2212), it has evolved into an Astro-powered application that balances raw SQL power with a premium user experience.

## System Flow & Architecture

The application follows a strict data-driven lifecycle, transitioning from server-side rendered layouts to interactive client-side islands.

![Detailed System Architecture](./architecture_refined.svg)

### The Architecture Strategy

The system is built on a decoupled stack: a Node.js/Express backend providing a RESTful API and an Astro-powered frontend utilizing Islands Architecture.

- **Unified Logic Layer**: The backend serves as a stateless REST API, handling authentication, business logic, and database orchestration. 
- **Partial Hydration**: Migrating to Astro allowed for a 60% reduction in client-side JavaScript by rendering the "shell" (sidebar, headers) as static HTML. Only high-interactivity components, such as the Dashboard stats and Booking modals, are hydrated as React "islands."
- **Raw SQL Engine**: Bypassing ORMs removes the "abstraction tax," ensuring that every millisecond of database overhead is accounted for. Triggers and Views handle the heavy lifting of state transitions and data aggregation.

---

## Technical Deep Dive

### Data Architecture
At the heart of Grand Stay is a MySQL 8+ database utilizing the InnoDB engine. The relational model is strictly enforced through foreign keys and CHECK constraints.

#### Advanced SQL Logic:
- **Reactive Triggers**: SQL triggers handle the mission-critical logic of updating room statuses during check-in and auto-generating billing records upon booking confirmation. This ensures the database remains the absolute source of truth.
- **Aggregated Views**: Custom views like `v_booking_details` flatten complex relationships (Guests → Rooms → Billing) into a single, high-performance read stream for the frontend.
- **Generated Columns**: The `billing` table uses virtual columns to calculate taxes and totals, ensuring billing consistency without extra application code.

### API Surface & Security
The backend exposes a structured REST API with role-based access control (RBAC):
- **Rooms (`/api/rooms`)**: Inventory management and soft-delete capabilities.
- **Guests (`/api/guests`)**: PII storage and comprehensive stay history.
- **Bookings (`/api/bookings`)**: Lifecycle management (Check-in/Out/Cancel) and real-time availability validation.
- **Staff (`/api/staff`)**: Shift management and role assignment.

---

## Project Structure

```text
hotel-project/
├── backend/
│   ├── db/
│   │   ├── connection.js        # mysql2 pool management
│   │   └── schema.sql           # full DDL + seed data
│   ├── routes/                  # Express controllers per module
│   ├── middleware/              # RBAC & Error handling
│   └── server.js                # Production entry point
├── frontend-astro/              # Optimized Astro environment
│   ├── src/
│   │   ├── components/react/    # Interactive islands
│   │   ├── layouts/             # Astro static layout
│   │   └── pages/               # File-based routing
│   └── astro.config.mjs
└── README.md
```

---

## Getting Started (Production)

To run the Grand Stay system locally, follow these technical steps:

### 1. Database Initialization
Create a MySQL database named `hotel_mgmt` and run the schema script:
```bash
mysql -u root -p hotel_mgmt < backend/db/schema.sql
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_mgmt
PORT=3001
```

### 3. Build & Deployment
Install dependencies and build the optimized Astro frontend:
```bash
# Frontend setup
cd frontend-astro
npm install
npm run build

# Backend launch
cd ../backend
npm install
node server.js
```

The system will be accessible at [**http://localhost:3001**](http://localhost:3001).

---

## User Access Levels

- **Admin** (`admin` / `admin123`): Full visibility into revenue, staff performance, and system settings.
- **Staff** (`staff` / `staff123`): Limited to guest check-ins, room inventory, and scheduling.

## Academic Context

This project was developed for the **Database Systems Lab (CSS 2212)**. By eschewing modern ORMs, it demonstrates a ground-up understanding of relational data modeling, query optimization, and server-side automation through SQL triggers and views.
