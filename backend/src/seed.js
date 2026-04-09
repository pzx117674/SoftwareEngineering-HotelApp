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

  // --- Payments ---
  const insertPayment = db.prepare(
    `INSERT INTO payments (reservationId, amount, paymentDate, method, status)
     VALUES (?, ?, ?, ?, ?)`
  );

  const payments = [
    [1, 299.97, "2026-04-08", "Credit Card", "COMPLETED"],
    [2, 419.97, "2026-04-09", "Credit Card", "COMPLETED"],
    [3, 179.98, "2026-04-09", "Credit Card", "UNPAID"],
  ];

  const insertPayments = db.transaction(() => {
    for (const p of payments) insertPayment.run(...p);
  });
  insertPayments();
}

module.exports = { seed };
