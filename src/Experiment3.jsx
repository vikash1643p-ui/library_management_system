
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import { Header, Footer } from "./Experiment1";
import { useAuth, ProtectedRoute } from "./AuthContext";
import libraryPhoto from "./assets/library.jpeg";

const API = "http://localhost:3001";

function CatalogHero() {
  return (
    <div className="w-full sm:w-56 md:w-72 flex-shrink-0">
      <img
        src={libraryPhoto}
        alt="Library interior"
        className="w-full h-40 sm:h-48 object-cover"
      />
    </div>
  );
}

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    year: new Date().getFullYear()
  });

  async function loadBooks() {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API}/books`);
      setBooks(res.data);
    } catch {
      setError("Unable to load books. Please start the API server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setEditing(null);
    setForm({
      title: "",
      author: "",
      category: "",
      description: "",
      year: new Date().getFullYear()
    });
  }

  async function saveBook(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const data = {
      ...form,
      year: Number(form.year),
      available: editing
        ? books.find(b => String(b.id) === String(editing))?.available ?? true
        : true
    };

    try {
      if (editing) {
        await axios.put(`${API}/books/${editing}`, data);
        setMessage("Book updated successfully!");
      } else {
        await axios.post(`${API}/books`, data);
        setMessage("New book added successfully!");
      }

      resetForm();
      await loadBooks();
    } catch {
      setError("Unable to save book. Check the API server.");
    }
  }

  function startEdit(book) {
    setEditing(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      description: book.description || "",
      year: book.year || new Date().getFullYear()
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBook(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await axios.delete(`${API}/books/${id}`);
      setMessage("Book deleted successfully!");
      await loadBooks();
    } catch {
      setError("Unable to delete book.");
    }
  }

  return (
    <div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h2 className="font-display text-xl mb-3">
            Library Book CRUD Operations
          </h2>
          <p className="text-sm text-ink/70">
            GET · POST · PUT · DELETE
          </p>
          <p className="text-sm text-ink/70 mt-2">
            Total books: {books.length}
          </p>
        </div>
        <CatalogHero />
      </div>

      <form
        onSubmit={saveBook}
        className="bg-card border border-black/10 p-4 mb-6 space-y-3"
      >
        <h3 className="font-display text-lg">
          {editing ? "Update Book (PUT)" : "Add New Book (POST)"}
        </h3>

        <input
          className="w-full border p-2"
          name="title"
          placeholder="Book title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          className="w-full border p-2"
          name="author"
          placeholder="Author name"
          value={form.author}
          onChange={handleChange}
          required
        />

        <input
          className="w-full border p-2"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          className="w-full border p-2"
          name="description"
          placeholder="Book description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          className="w-full border p-2"
          name="year"
          type="number"
          placeholder="Publication year"
          value={form.year}
          onChange={handleChange}
          required
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="bg-spine text-paper px-4 py-2"
          >
            {editing ? "Update Book" : "Add Book"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && (
        <p className="bg-green-100 text-green-800 p-3 mb-4" role="status">
          {message}
        </p>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4" role="alert">
          {error}
          <button onClick={loadBooks} className="underline ml-3">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="p-4">Loading books...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map(book => (
            <article
              key={book.id}
              className="bg-card border-l-4 border-spine p-4"
            >
              <h3 className="font-display text-lg">{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Category: {book.category}</p>
              <p>Published: {book.year}</p>
              <p className="text-sm mt-1">
                {book.available ? "Available" : "Checked out"}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  to={`/library/book/${book.id}`}
                  className="border px-3 py-1"
                >
                  Details
                </Link>

                <button
                  onClick={() => startEdit(book)}
                  className="bg-gold text-paper px-3 py-1"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteBook(book.id)}
                  className="bg-overdue text-paper px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <p>No books found. Add your first book above.</p>
      )}
    </div>
  );
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const res = await axios.get(`${API}/books/${id}`);
        setBook(res.data);
      } catch {
        setError("Book not found or API unavailable.");
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;
  if (!book) return <p>Book not found.</p>;

  function borrow() {
    if (!isAuthenticated) {
      navigate("/account/login", {
        state: { from: { pathname: `/library/borrow/${book.id}` } }
      });
    } else {
      navigate(`/library/borrow/${book.id}`);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl">{book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Category: {book.category}</p>
      <p>Description: {book.description || "No description"}</p>
      <p>Published year: {book.year}</p>
      <p>Availability: {book.available ? "Available" : "Checked out"}</p>

      <button
        disabled={!book.available}
        onClick={borrow}
        className="mt-3 bg-spine text-paper px-4 py-2 disabled:opacity-50"
      >
        Borrow Book
      </button>
    </div>
  );
}

function BorrowRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [student, setStudent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/books/${id}`)
      .then(res => setBook(res.data))
      .catch(() => setError("Unable to load this book."))
      .finally(() => setLoading(false));
  }, [id]);

  async function confirmBorrow(e) {
    e.preventDefault();
    if (!book || !book.available) {
      setError("This book is not available.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const record = {
        student,
        bookId: book.id,
        bookTitle: book.title,
        dueDate,
        status: "Borrowed"
      };

      await axios.post(`${API}/borrowings`, record);
      await axios.patch(`${API}/books/${book.id}`, {
        available: false
      });

      navigate("/library/borrowed");
    } catch {
      setError("Unable to create borrowing record.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading book...</p>;
  if (!book) return <p role="alert">{error || "Book not found."}</p>;

  return (
    <form onSubmit={confirmBorrow} className="max-w-lg space-y-3">
      <h2 className="font-display text-xl">Borrow: {book.title}</h2>

      {error && <p role="alert" className="text-red-600">{error}</p>}

      <input
        className="w-full border p-2"
        placeholder="Student name"
        value={student}
        onChange={e => setStudent(e.target.value)}
        required
      />

      <label className="block">
        Due date
        <input
          className="w-full border p-2"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        />
      </label>

      <button
        disabled={saving || !book.available}
        className="bg-available text-paper px-4 py-2 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Confirm Borrow (POST)"}
      </button>
    </form>
  );
}

function BorrowedTopPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [student, setStudent] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API}/borrowings`);
      setRecords(res.data);
    } catch {
      setError("Unable to load borrowing records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function startEdit(record) {
    setEditing(record);
    setStudent(record.student);
    setDueDate(record.dueDate);
  }

  async function updateRecord(e) {
    e.preventDefault();
    setError("");

    try {
      await axios.patch(`${API}/borrowings/${editing.id}`, {
        student,
        dueDate
      });

      setEditing(null);
      setStudent("");
      setDueDate("");
      await loadRecords();
    } catch {
      setError("Unable to update borrowing record.");
    }
  }

  async function returnBook(record) {
    setError("");

    try {
      await axios.patch(`${API}/borrowings/${record.id}`, {
        status: "Returned"
      });

      await axios.patch(`${API}/books/${record.bookId}`, {
        available: true
      });

      await loadRecords();
    } catch {
      setError("Unable to return book.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Borrowing Records</h2>

      {editing && (
        <form onSubmit={updateRecord} className="border p-4 mb-5 space-y-3">
          <h3>Update Borrowing Record (PATCH)</h3>

          <input
            className="w-full border p-2"
            value={student}
            onChange={e => setStudent(e.target.value)}
            placeholder="Student name"
            required
          />

          <input
            className="w-full border p-2"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />

          <button className="bg-spine text-paper px-3 py-2">
            Save Changes
          </button>

          <button
            type="button"
            className="border px-3 py-2 ml-2"
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="bg-red-100 text-red-700 p-3 mb-3">
          {error}
          <button onClick={loadRecords} className="underline ml-2">
            Retry
          </button>
        </p>
      )}

      {loading ? (
        <p>Loading borrowing records...</p>
      ) : records.length === 0 ? (
        <p>No borrowing records available.</p>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <article
              key={record.id}
              className="bg-card border-l-4 border-spine p-4"
            >
              <h3 className="font-display text-lg">{record.bookTitle}</h3>
              <p>Student: {record.student}</p>
              <p>Due date: {record.dueDate}</p>
              <p>Status: {record.status}</p>

              {record.status !== "Returned" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startEdit(record)}
                    className="bg-gold text-paper px-3 py-1"
                  >
                    Edit Record
                  </button>

                  <button
                    onClick={() => returnBook(record)}
                    className="bg-overdue text-paper px-3 py-1"
                  >
                    Return Book
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTopPage() {
  return (
    <div>
      <h2 className="font-display text-xl mb-2">Reading History</h2>
      <p>Reading history is not connected to the API in this experiment.</p>
    </div>
  );
}

export default function Navigation() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="p-3 sm:p-4 md:p-6 flex-1">
        <nav className="flex flex-wrap gap-4 mb-5 text-sm">
          <NavLink to="/library/books">Books</NavLink>
          <NavLink to="/library/borrowed">Borrowed</NavLink>
          <NavLink to="/library/history">History</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="book/:id" element={<BookDetailPage />} />
          <Route
            path="borrow/:id"
            element={
              <ProtectedRoute>
                <BorrowRequestPage />
              </ProtectedRoute>
            }
          />
          <Route path="borrowed" element={<BorrowedTopPage />} />
          <Route path="history" element={<HistoryTopPage />} />
          <Route path="*" element={<BooksPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
