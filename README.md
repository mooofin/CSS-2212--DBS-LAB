# 🏨 Grand Stay: Elevating Hospitality through Data Excellence

Welcome to **Grand Stay**, a sophisticated hotel management ecosystem that bridges the gap between traditional hospitality and modern, high-performance technology. Originally conceived as a deep dive into relational databases, it has evolved into a premium platform that delivers a seamless experience for both staff and guests.

---

## 🌟 Our Philosophy

At Grand Stay, we believe that exceptional hospitality starts with exceptional technology. Every check-in, every room assignment, and every billing transaction is backed by a robust, data-driven architecture that ensures reliability without sacrificing speed.

> [!NOTE]
> **Built for Performance**: By utilizing Astro's "Islands Architecture," we've reduced client-side JavaScript by 60%, ensuring that your management dashboard is as fast as a boutique stay is comfortable.

---

## 🚀 Quick Start: Welcome Aboard

Getting the Grand Stay system up and running is as simple as a warm welcome at the front desk.

### 1. The Magic Command
From your terminal, run the unified start script:
```bash
./start.sh
```

### 2. What Happens Behind the Scenes?
- ✅ **Sanity Check**: Briefly verifies your environment.
- ✅ **Database Orchestration**: Sets up your MySQL/MariaDB schema automatically.
- ✅ **Component Assembly**: Installs any missing pieces and builds the frontend.
- ✅ **Full Launch**: Starts the server on **http://localhost:3001**.

---

## 🔐 The Keys to the Kingdom

Explore the different facets of the system using our demo credentials:

| Role | Identity | Access Key | Focus |
|------|----------|------------|-------|
| **Admin** | `admin` | `admin123` | Full strategic visibility & revenue tracking |
| **Staff** | `staff` | `staff123` | Daily operations, check-ins, & guest care |
| **Guest** | *See database* | `password123` | Personal stays & reservation history |

---

## 🏛️ The Architecture of Excellence

Grand Stay isn't just a website; it's a meticulously crafted system designed for reliability and scale.

### 🛠️ The Tech Stack
- **Engine**: Node.js & Express RESTful API
- **Interface**: Astro with React "Islands" for peak performance
- **Heart**: MySQL 8+ with triggers and views for data integrity
- **Styling**: Tailored Tailwind CSS for a premium aesthetic

### 📊 System Design
![Refined System Architecture](./architecture_refined.svg)

We've decoupled the **Logic Layer** from the **Presentation Layer**, allowing the database to do what it does best: maintain the absolute truth. Triggers handle mission-critical state transitions, while Views flatten complex data into high-performance streams for the frontend.

---

## 📂 The Blueprint

```text
hotel-project/
├── backend/             # The RESTful Heart (Node.js/Express)
│   ├── db/              # SQL Schemas, Triggers, & Views
│   ├── routes/          # Purpose-built API endpoints
│   └── server.js        # The Production Portal
├── frontend-astro/      # The Human Interface (Astro/React)
│   ├── src/             # Where the magic happens (islands & pages)
│   └── astro.config.mjs # The core configuration
└── README.md            # Your map to the project
```

---

## 🎓 The Academic Journey

Developed for the **Database Systems Lab (CSS 2212)**, Grand Stay is a testament to the power of raw SQL. By intentionally eschewing heavy ORMs, we've achieved a level of control and performance that demonstrates a deep understanding of data lifecycle management and server-side automation.

---

### ✨ Ready to Begin?
[Quick Start](#-quick-start-welcome-aboard) | [Kill the server](./kill.sh)

**Built with passion for modern web and database technologies.**
