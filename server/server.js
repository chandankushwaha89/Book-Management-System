// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, "books.db"), err => {
  if (err) console.error("DB Error:", err.message);
  else console.log("📚 SQLite DB connected");
});

const runQuery = (sql, params, res, successMsg) => {
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json(successMsg || { b_id: this.lastID, ...params });
  });
};

// Get all books
app.get("/books", (_, res) => {
  db.all("SELECT * FROM books", [], (err, rows) =>
    err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// Add book
app.post("/books", (req, res) => {
  const { title, author, genre, publication_year, price } = req.body;
  if (![title, author, genre].every(Boolean) || isNaN(publication_year) || isNaN(price))
    return res.status(400).json({ error: "All fields must be valid." });

  const sql = `INSERT INTO books (title, author, genre, published_year, price) VALUES (?, ?, ?, ?, ?)`;
  runQuery(sql, [title, author, genre, publication_year, price], res);
});

// Update book
app.put("/books/:id", (req, res) => {
  const { title, author, genre, publication_year, price } = req.body;
  const sql = `UPDATE books SET title=?, author=?, genre=?, published_year=?, price=? WHERE b_id=?`;
  runQuery(sql, [title, author, genre, publication_year, price, req.params.id], res, { message: "Book updated" });
});

// Delete book
app.delete("/books/:id", (req, res) => {
  db.run("DELETE FROM books WHERE b_id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Book deleted" });
  });
});

app.listen(5000, () => console.log("Server: http://localhost:5000"));
