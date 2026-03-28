-- ============================================================
-- Hotel Management System — Full DDL + Seed Data
-- MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_mgmt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hotel_mgmt;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS rooms (
  room_id        INT AUTO_INCREMENT PRIMARY KEY,
  room_number    VARCHAR(10) UNIQUE NOT NULL,
  type           ENUM('single','double','suite','deluxe') NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  status         ENUM('available','occupied','maintenance') DEFAULT 'available',
  floor          INT NOT NULL,
  max_occupancy  INT NOT NULL,
  amenities      TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guests (
  guest_id    INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(50) UNIQUE,
  password    VARCHAR(255),
  phone       VARCHAR(20),
  address     TEXT,
  id_type     ENUM('passport','aadhar','driving_license','pan'),
  id_number   VARCHAR(50),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id       INT AUTO_INCREMENT PRIMARY KEY,
  guest_id         INT NOT NULL,
  room_id          INT NOT NULL,
  check_in         DATE NOT NULL,
  check_out        DATE NOT NULL,
  status           ENUM('confirmed','checked_in','checked_out','cancelled') DEFAULT 'confirmed',
  adults           INT DEFAULT 1,
  children         INT DEFAULT 0,
  special_requests TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id)
    REFERENCES guests(guest_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_dates CHECK (check_out > check_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS billing (
  bill_id         INT AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT NOT NULL UNIQUE,
  room_charges    DECIMAL(10,2) NOT NULL,
  tax_amount      DECIMAL(10,2) GENERATED ALWAYS AS (room_charges * 0.18) STORED,
  service_charges DECIMAL(10,2) DEFAULT 0.00,
  total_amount    DECIMAL(10,2) GENERATED ALWAYS AS (room_charges + (room_charges * 0.18) + service_charges) STORED,
  payment_status  ENUM('pending','paid','refunded') DEFAULT 'pending',
  payment_method  ENUM('cash','card','upi','bank_transfer'),
  paid_at         TIMESTAMP NULL,
  CONSTRAINT fk_billing_booking FOREIGN KEY (booking_id)
    REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS staff (
  staff_id     INT AUTO_INCREMENT PRIMARY KEY,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  role         ENUM('manager','receptionist','housekeeping','maintenance','chef') NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  phone        VARCHAR(20),
  salary       DECIMAL(10,2),
  shift        ENUM('morning','evening','night'),
  joining_date DATE NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-update room status on booking status change
DROP TRIGGER IF EXISTS after_booking_checkin;
DELIMITER $$
CREATE TRIGGER after_booking_checkin
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
    UPDATE rooms SET status = 'occupied' WHERE room_id = NEW.room_id;
  END IF;
  IF NEW.status = 'checked_out' AND OLD.status = 'checked_in' THEN
    UPDATE rooms SET status = 'available' WHERE room_id = NEW.room_id;
  END IF;
END$$
DELIMITER ;

-- Trigger 2: Auto-create billing record when booking is created
DROP TRIGGER IF EXISTS after_booking_insert;
DELIMITER $$
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  INSERT INTO billing (booking_id, room_charges, service_charges)
  SELECT NEW.booking_id,
         r.price_per_night * DATEDIFF(NEW.check_out, NEW.check_in),
         0.00
  FROM rooms r WHERE r.room_id = NEW.room_id;
END$$
DELIMITER ;

-- ============================================================
-- VIEWS
-- ============================================================

-- View: Full booking details (used in dashboard and reports)
CREATE OR REPLACE VIEW v_booking_details AS
SELECT
  b.booking_id, b.check_in, b.check_out, b.status AS booking_status,
  b.adults, b.children, b.special_requests, b.created_at AS booking_created,
  b.guest_id, b.room_id,
  CONCAT(g.first_name, ' ', g.last_name) AS guest_name, g.email, g.phone,
  r.room_number, r.type AS room_type, r.floor, r.price_per_night,
  bl.bill_id, bl.room_charges, bl.tax_amount, bl.service_charges,
  bl.total_amount, bl.payment_status, bl.payment_method, bl.paid_at,
  DATEDIFF(b.check_out, b.check_in) AS nights
FROM bookings b
JOIN guests g ON b.guest_id = g.guest_id
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN billing bl ON b.booking_id = bl.booking_id;

-- View: Room occupancy summary
CREATE OR REPLACE VIEW v_room_summary AS
SELECT
  type,
  COUNT(*) AS total_rooms,
  SUM(status = 'available') AS available,
  SUM(status = 'occupied') AS occupied,
  SUM(status = 'maintenance') AS under_maintenance,
  AVG(price_per_night) AS avg_price
FROM rooms
GROUP BY type;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Rooms (12 rooms across 4 types)
INSERT INTO rooms (room_number, type, price_per_night, status, floor, max_occupancy, amenities) VALUES
('101', 'single',  2500.00, 'available',   1, 1, 'WiFi, AC, TV'),
('102', 'single',  2500.00, 'available',   1, 1, 'WiFi, AC, TV'),
('103', 'double',  4000.00, 'available',   1, 3, 'WiFi, AC, TV, Mini-bar'),
('201', 'double',  4000.00, 'available',   2, 3, 'WiFi, AC, TV, Mini-bar'),
('202', 'double',  4500.00, 'available',   2, 4, 'WiFi, AC, TV, Mini-bar, Balcony'),
('203', 'deluxe',  6500.00, 'available',   2, 3, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service'),
('301', 'deluxe',  7000.00, 'available',   3, 3, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service, Jacuzzi'),
('302', 'suite',  12000.00, 'available',   3, 4, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service, Jacuzzi, Living Room'),
('303', 'suite',  12000.00, 'available',   3, 4, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service, Jacuzzi, Living Room'),
('401', 'suite',  15000.00, 'available',   4, 5, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service, Jacuzzi, Living Room, Kitchen'),
('104', 'single',  2800.00, 'maintenance', 1, 1, 'WiFi, AC, TV'),
('204', 'deluxe',  6500.00, 'occupied',    2, 3, 'WiFi, AC, TV, Mini-bar, Balcony, Room Service');

-- Guests (12 guests)
INSERT INTO guests (first_name, last_name, email, username, password, phone, address, id_type, id_number) VALUES
('Arjun',   'Sharma',    'arjun.sharma@email.com',    'arjun.sharma',    'password123', '+91-9876543210', '42 MG Road, Bengaluru',      'aadhar',          '1234-5678-9012'),
('Priya',   'Patel',     'priya.patel@email.com',     'priya.patel',     'password123', '+91-9876543211', '15 Park Street, Mumbai',      'passport',        'K1234567'),
('Rahul',   'Verma',     'rahul.verma@email.com',     'rahul.verma',     'password123', '+91-9876543212', '78 Nehru Place, Delhi',       'driving_license', 'DL-0420110012345'),
('Sneha',   'Reddy',     'sneha.reddy@email.com',     'sneha.reddy',     'password123', '+91-9876543213', '23 Jubilee Hills, Hyderabad', 'pan',             'ABCDE1234F'),
('Vikram',  'Singh',     'vikram.singh@email.com',    'vikram.singh',    'password123', '+91-9876543214', '9 Civil Lines, Jaipur',       'aadhar',          '9876-5432-1098'),
('Ananya',  'Gupta',     'ananya.gupta@email.com',    'ananya.gupta',    'password123', '+91-9876543215', '56 Salt Lake, Kolkata',       'passport',        'L7654321'),
('Karthik', 'Nair',      'karthik.nair@email.com',   'karthik.nair',    'password123', '+91-9876543216', '31 Marine Drive, Kochi',      'driving_license', 'KL-1320140067890'),
('Meera',   'Iyer',      'meera.iyer@email.com',     'meera.iyer',      'password123', '+91-9876543217', '12 T Nagar, Chennai',         'aadhar',          '5678-1234-9012'),
('Rohit',   'Joshi',     'rohit.joshi@email.com',    'rohit.joshi',     'password123', '+91-9876543218', '45 Koregaon Park, Pune',      'pan',             'FGHIJ5678K'),
('Divya',   'Menon',     'divya.menon@email.com',    'divya.menon',     'password123', '+91-9876543219', '8 MG Road, Thrissur',         'passport',        'M9876543'),
('Amit',    'Chauhan',   'amit.chauhan@email.com',   'amit.chauhan',    'password123', '+91-9876543220', '19 Lajpat Nagar, Delhi',      'aadhar',          '3456-7890-1234'),
('Pooja',   'Deshmukh',  'pooja.deshmukh@email.com', 'pooja.deshmukh',  'password123', '+91-9876543221', '67 FC Road, Pune',            'driving_license', 'MH-1220150098765');

-- Bookings (10 bookings)
INSERT INTO bookings (guest_id, room_id, check_in, check_out, status, adults, children, special_requests) VALUES
(1, 3,  '2026-03-15', '2026-03-18', 'checked_out', 2, 0, 'Extra pillows'),
(2, 5,  '2026-03-16', '2026-03-20', 'checked_out', 2, 1, 'Late check-out requested'),
(3, 7,  '2026-03-17', '2026-03-19', 'checked_out', 1, 0, NULL),
(4, 8,  '2026-03-18', '2026-03-22', 'checked_in',  2, 2, 'Anniversary — cake and flowers'),
(5, 1,  '2026-03-19', '2026-03-21', 'confirmed',   1, 0, NULL),
(6, 6,  '2026-03-20', '2026-03-25', 'confirmed',   2, 0, 'Vegetarian meals only'),
(7, 9,  '2026-03-20', '2026-03-23', 'confirmed',   2, 1, NULL),
(8, 2,  '2026-03-22', '2026-03-24', 'confirmed',   1, 0, 'Early check-in if possible'),
(9, 10, '2026-03-25', '2026-03-30', 'confirmed',   2, 0, 'Airport pickup needed'),
(10,4,  '2026-03-19', '2026-03-21', 'cancelled',   2, 1, NULL);

-- Staff (10 staff members)
INSERT INTO staff (first_name, last_name, role, email, phone, salary, shift, joining_date, is_active) VALUES
('Rajesh',   'Kumar',      'manager',       'rajesh.kumar@grandstay.com',   '+91-9000000001', 75000.00, 'morning', '2023-01-10', TRUE),
('Sunita',   'Devi',       'receptionist',  'sunita.devi@grandstay.com',    '+91-9000000002', 30000.00, 'morning', '2023-03-15', TRUE),
('Anil',     'Prasad',     'receptionist',  'anil.prasad@grandstay.com',    '+91-9000000003', 30000.00, 'evening', '2023-06-01', TRUE),
('Lakshmi',  'Narayanan',  'housekeeping',  'lakshmi.n@grandstay.com',      '+91-9000000004', 22000.00, 'morning', '2023-02-20', TRUE),
('Ramesh',   'Yadav',      'housekeeping',  'ramesh.yadav@grandstay.com',   '+91-9000000005', 22000.00, 'evening', '2023-04-10', TRUE),
('Gopal',    'Mishra',     'maintenance',   'gopal.mishra@grandstay.com',   '+91-9000000006', 25000.00, 'morning', '2023-05-18', TRUE),
('Deepa',    'Krishnan',   'chef',          'deepa.k@grandstay.com',       '+91-9000000007', 45000.00, 'morning', '2023-01-25', TRUE),
('Farhan',   'Sheikh',     'chef',          'farhan.sheikh@grandstay.com',  '+91-9000000008', 40000.00, 'evening', '2023-07-12', TRUE),
('Kavitha',  'Rajan',      'receptionist',  'kavitha.rajan@grandstay.com',  '+91-9000000009', 28000.00, 'night',   '2024-01-05', TRUE),
('Suresh',   'Babu',       'maintenance',   'suresh.babu@grandstay.com',    '+91-9000000010', 24000.00, 'night',   '2024-02-14', FALSE);

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('staff', 'staff123', 'user');
