CREATE TABLE IF NOT EXISTS books (
  b_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  published_year INTEGER NOT NULL CHECK (published_year <= strftime('%Y', 'now')),
  price REAL NOT NULL CHECK (price >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
