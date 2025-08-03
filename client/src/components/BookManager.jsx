import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookManager.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: "", author: "", genre: "", publication_year: "", price: "" });
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/books");
      setBooks(res.data);
    } catch { toast.error("Failed to fetch books"); }
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });


  const validateForm = () => {
  const { title, author, genre, publication_year, price } = formData;
  const year = parseInt(publication_year);
  const priceValue = parseFloat(price);
  const currentYear = new Date().getFullYear();

  const isNonEmptyString = (str) =>
    typeof str === "string" && str.trim().length > 0 && /[a-zA-Z]/.test(str);

  if (!isNonEmptyString(title)) {
    toast.warning("Title is required and must be a valid string.");
    return false;
  }
  if (!isNonEmptyString(author)) {
    toast.warning("Author is required and must be a valid string.");
    return false;
  }
  if (!isNonEmptyString(genre)) {
    toast.warning("Genre is required and must be a valid string.");
    return false;
  }
  if (!publication_year || isNaN(year) || year > currentYear) {
    toast.warning("Publication year must be a valid year not in the future.");
    return false;
  }
  if (price === "" || isNaN(priceValue) || priceValue < 0) {
    toast.warning("Price must be a non-negative number.");
    return false;
  }
  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (isEditing) await axios.put(`http://localhost:5000/books/${editId}`, formData);
      else await axios.post("http://localhost:5000/books", formData);
      toast.success(`Book ${isEditing ? "updated" : "added"} successfully`);
      setModalOpen(false);
      fetchBooks();
      setFormData({ title: "", author: "", genre: "", publication_year: "", price: "" });
      setIsEditing(false); setEditId(null);
    } catch {
      toast.error("Error saving book");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/books/${id}`);
      fetchBooks();
      setDeleteConfirm({ show: false, id: null });
      toast.success("Book deleted successfully");
    } catch {
      toast.error("Error deleting book");
    }
  };

  const filteredBooks = books.filter(b => [b.title, b.author, b.genre].some(f => f.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="container">
        <header>
          <h1>📚 Book Management System</h1>
          <div className="top-controls">
            <input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => setModalOpen(true)}>+ Add Book</button>
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "🌞" : "🌙"}</button>
          </div>
        </header>

        <table>
          <thead>
            <tr><th>Title</th><th>Author</th><th>Genre</th><th>Publication Year</th><th>Age</th><th>Price</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredBooks.map(book => (
              <tr key={book.b_id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.published_year}</td>
                <td>{new Date().getFullYear() - book.published_year} years</td>
                <td>₹{parseFloat(book.price).toFixed(2)}</td>
                <td>
                  <button onClick={() => { setFormData(book); setIsEditing(true); setEditId(book.b_id); setModalOpen(true); }}>Edit</button>
                  <button className="delete-btn" onClick={() => setDeleteConfirm({ show: true, id: book.b_id })}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalOpen && (
          <div className="modal">
            <form onSubmit={handleSubmit} className="modal-content">
              <h2>{isEditing ? "Edit Book" : "Add Book"}</h2>
              {["title", "author", "genre", "publication_year", "price"].map(field => (
                <input
                  key={field}
                  type={field.includes("year") || field === "price" ? "number" : "text"}
                  name={field}
                  placeholder={field.replace("_", " ")}
                  value={formData[field]}
                  onChange={handleChange}
                />
              ))}
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {deleteConfirm.show && (
          <div className="modal">
            <div className="modal-content">
              <h3>Confirm Delete?</h3>
              <p>Are you sure you want to delete this book?</p>
              <div className="modal-actions">
                <button onClick={() => handleDelete(deleteConfirm.id)}>Yes</button>
                <button onClick={() => setDeleteConfirm({ show: false, id: null })}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;