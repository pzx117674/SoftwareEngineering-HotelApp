function seed(db) {
  // --- Rooms (10 total: 7 AVAILABLE, 2 BOOKED, 1 MAINTENANCE) ---
  const insertRoom = db.prepare(
    `INSERT INTO rooms (roomNumber, capacity, pricePerNight, city, description, imageUrl, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const rooms = [
    ["101", 2, 289.99, "Warsaw",    "Cozy double room with a king-size bed, city view, and modern furnishings.",         "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80", "AVAILABLE"],
    ["102", 1, 199.99, "Warsaw",    "Compact single room ideal for business travelers. Includes a work desk and WiFi.",  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", "AVAILABLE"],
    ["103", 3, 419.99, "Krakow",    "Spacious family suite with a living area, two queen beds, and Old Town views.",     "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "AVAILABLE"],
    ["201", 2, 349.99, "Krakow",    "Elegant double room near Wawel Castle with premium bedding and minibar.",           "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", "BOOKED"],
    ["202", 4, 549.99, "Gdansk",    "Luxury family apartment with balcony overlooking the Motława River.",               "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80", "AVAILABLE"],
    ["203", 1, 179.99, "Gdansk",    "Budget-friendly single room close to the beach. Clean and comfortable.",            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80", "MAINTENANCE"],
    ["301", 2, 319.99, "Wroclaw",   "Modern double room with skyline views, rain shower, and complimentary breakfast.",  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80", "AVAILABLE"],
    ["302", 3, 459.99, "Poznan",    "Premium triple room with separate lounge, Smart TV, and top-floor panorama.",       "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80", "BOOKED"],
    ["303", 4, 599.99, "Warsaw",    "Presidential suite with jacuzzi, dining area, and panoramic Warsaw skyline.",       "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80", "AVAILABLE"],
    ["401", 2, 299.99, "Wroclaw",   "Charming room in the Old Town district with exposed brick and river view.",         "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80", "AVAILABLE"],
  ];

  const insertRooms = db.transaction(() => {
    for (const r of rooms) insertRoom.run(...r);
  });
  insertRooms();

  // --- Customers ---
  const insertCustomer = db.prepare(
    "INSERT INTO customers (fullName, email, phoneNumber) VALUES (?, ?, ?)"
  );

  const customers = [
    ["Alice Johnson", "alice@example.com", "+1-555-0101"],
    ["Bob Smith", "bob@example.com", "+1-555-0102"],
    ["Carol Williams", "carol@example.com", "+1-555-0103"],
  ];

  const insertCustomers = db.transaction(() => {
    for (const c of customers) insertCustomer.run(...c);
  });
  insertCustomers();

  // --- Reservations ---
  const insertReservation = db.prepare(
    `INSERT INTO reservations (customerId, roomId, checkInDate, checkOutDate, status, totalAmount)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const reservations = [
    [1, 4, "2026-04-10", "2026-04-13", "CONFIRMED", 299.97],
    [2, 8, "2026-04-12", "2026-04-15", "CONFIRMED", 419.97],
    [3, 1, "2026-04-20", "2026-04-22", "PENDING", 179.98],
  ];

  const insertReservations = db.transaction(() => {
    for (const r of reservations) insertReservation.run(...r);
  });
  insertReservations();

  // --- Historical reservations for reports (Jan–Apr 2026) ---
  const moreReservations = [
    [1, 2, "2026-01-05", "2026-01-07", "CONFIRMED", 399.98],
    [2, 3, "2026-01-14", "2026-01-18", "CONFIRMED", 1679.96],
    [3, 5, "2026-01-22", "2026-01-25", "CONFIRMED", 1649.97],
    [1, 7, "2026-02-03", "2026-02-05", "CONFIRMED", 639.98],
    [2, 1, "2026-02-10", "2026-02-13", "CONFIRMED", 869.97],
    [3, 9, "2026-02-18", "2026-02-21", "CONFIRMED", 1799.97],
    [1, 3, "2026-03-01", "2026-03-04", "CONFIRMED", 1259.97],
    [2, 7, "2026-03-12", "2026-03-14", "CONFIRMED", 639.98],
    [3, 2, "2026-03-20", "2026-03-23", "CONFIRMED", 599.97],
    [1, 5, "2026-04-02", "2026-04-05", "CONFIRMED", 1649.97],
    [2, 9, "2026-04-15", "2026-04-17", "CONFIRMED", 1199.98],
    [3, 7, "2026-05-01", "2026-05-03", "CONFIRMED", 639.98],
  ];

  const insertMoreReservations = db.transaction(() => {
    for (const r of moreReservations) insertReservation.run(...r);
  });
  insertMoreReservations();

  // --- Payments (seed + historical) ---
  const insertPayment = db.prepare(
    `INSERT INTO payments (reservationId, amount, paymentDate, method, status)
     VALUES (?, ?, ?, ?, ?)`
  );

  const payments = [
    [1, 299.97,  "2026-04-08", "Credit Card", "COMPLETED"],
    [2, 419.97,  "2026-04-09", "Credit Card", "COMPLETED"],
    [3, 179.98,  "2026-04-09", "Credit Card", "UNPAID"],
    // historical
    [4,  399.98, "2026-01-04", "Credit Card",  "COMPLETED"],
    [5,  1679.96,"2026-01-13", "Bank Transfer","COMPLETED"],
    [6,  1649.97,"2026-01-21", "Credit Card",  "COMPLETED"],
    [7,  639.98, "2026-02-02", "PayPal",        "COMPLETED"],
    [8,  869.97, "2026-02-09", "Credit Card",  "COMPLETED"],
    [9,  1799.97,"2026-02-17", "Bank Transfer","COMPLETED"],
    [10, 1259.97,"2026-02-28", "Credit Card",  "COMPLETED"],
    [11, 639.98, "2026-03-11", "PayPal",        "COMPLETED"],
    [12, 599.97, "2026-03-19", "Credit Card",  "COMPLETED"],
    [13, 1649.97,"2026-04-01", "Credit Card",  "COMPLETED"],
    [14, 1199.98,"2026-04-14", "Bank Transfer","COMPLETED"],
    [15, 639.98, "2026-04-30", "Credit Card",  "COMPLETED"],
  ];

  const insertPayments = db.transaction(() => {
    for (const p of payments) insertPayment.run(...p);
  });
  insertPayments();
}

function seedStaff(db) {
  const insert = db.prepare(
    `INSERT INTO staff (fullName, email, username, password, role) VALUES (?, ?, ?, ?, ?)`
  );
  const staff = [
    ["Anna Kowalska",      "anna@hotel.com",    "admin",      "admin123",      "MANAGER"],
    ["Piotr Nowak",        "piotr@hotel.com",   "reception",  "reception123",  "RECEPTIONIST"],
    ["Marta Wiśniewska",   "marta@hotel.com",   "marketing",  "marketing123",  "MARKETING"],
  ];
  const tx = db.transaction(() => {
    for (const s of staff) insert.run(...s);
  });
  tx();
}

module.exports = { seed, seedStaff };
