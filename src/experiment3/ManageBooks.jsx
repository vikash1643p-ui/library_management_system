// ManageBooks.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  getBooks, addBook, updateBook, patchBook, deleteBook,
  getBorrowings, createBorrowing, updateBorrowing,
} from "../api/crudApi";

const emptyForm = { title: "", author: "", category: "", year: "", description: "" };
const today = () => new Date().toISOString().split("T")[0];
const MAX_RENEWALS = 2;

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.author.trim()) errors.author = "Author is required";
  if (!form.category.trim()) errors.category = "Category is required";
  const year = Number(form.year);
  if (!form.year) errors.year = "Year is required";
  else if (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear()) {
    errors.year = "Enter a valid year";
  }
  return errors;
}

function describe(err) {
  if (err.message === "Network Error" || err.message === "Failed to fetch") {
    return "Cannot reach the API server. Start it with: npm run server";
  }
  return err.message || "Something went wrong";
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} className="border rounded-full px-4 py-2 w-full" />
      {error && <p className="text-overdue text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // a) GET books + borrowing records
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksData, borrowingsData] = await Promise.all([getBooks(), getBorrowings()]);
      setBooks(booksData);
      setBorrowings(borrowingsData);
    } catch (err) {
      setError(describe(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Runs any API action with shared busy / error / success handling (f)
  const run = async (fn, successMessage) => {
    setBusy(true);
    setActionError(null);
    setMessage("");
    try {
      await fn();
      setMessage(successMessage);
    } catch (err) {
      setActionError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingId(null);
  };

  // b) POST and c) PUT
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      year: Number(form.year),
      description: form.description.trim(),
    };

    if (editingId) {
      const existing = books.find((b) => b.id === editingId);
      run(async () => {
        const saved = await updateBook(editingId, { ...payload, available: existing.available });
        setBooks((prev) => prev.map((b) => (b.id === editingId ? saved : b)));
        resetForm();
      }, "Book updated (PUT)");
    } else {
      run(async () => {
        const saved = await addBook({ ...payload, available: true });
        setBooks((prev) => [...prev, saved]);
        resetForm();
      }, "Book added (POST)");
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      year: String(book.year),
      description: book.description || "",
    });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // d) DELETE
  const handleDelete = (book) => {
    if (!book.available) {
      setActionError("Cannot delete a book that is currently borrowed");
      return;
    }
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    run(async () => {
      await deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      if (editingId === book.id) resetForm();
    }, "Book deleted (DELETE)");
  };

  // e) create a borrowing record (POST) + mark book unavailable (PATCH)
  const handleBorrow = (book) => {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    run(async () => {
      const record = await createBorrowing({
        bookId: book.id,
        title: book.title,
        borrowedOn: today(),
        dueDate: due.toISOString().split("T")[0],
        renewals: 0,
        status: "borrowed",
      });
      const updatedBook = await patchBook(book.id, { available: false });
      setBorrowings((prev) => [...prev, record]);
      setBooks((prev) => prev.map((b) => (b.id === book.id ? updatedBook : b)));
    }, `"${book.title}" borrowed (POST + PATCH)`);
  };

  // e) update a borrowing record: renew (PATCH)
  const handleRenew = (record) => {
    if (record.renewals >= MAX_RENEWALS) {
      setActionError("Book renewal is not available (limit reached)");
      return;
    }
    const newDue = new Date(record.dueDate);
    newDue.setDate(newDue.getDate() + 7);
    run(async () => {
      const updated = await updateBorrowing(record.id, {
        dueDate: newDue.toISOString().split("T")[0],
        renewals: record.renewals + 1,
      });
      setBorrowings((prev) => prev.map((r) => (r.id === record.id ? updated : r)));
    }, "Borrowing renewed (PATCH)");
  };

  // e) update a borrowing record: return (PATCH) + mark book available (PATCH)
  const handleReturn = (record) => {
    run(async () => {
      const updated = await updateBorrowing(record.id, { status: "returned", returnedOn: today() });
      setBorrowings((prev) => prev.map((r) => (r.id === record.id ? updated : r)));
      if (books.some((b) => b.id === record.bookId)) {
        const updatedBook = await patchBook(record.bookId, { available: true });
        setBooks((prev) => prev.map((b) => (b.id === record.bookId ? updatedBook : b)));
      }
    }, "Book returned (PATCH)");
  };

  // f) loading and error states
  if (loading) {
    return <p className="text-ink/60">Loading books and borrowing records…</p>;
  }

  if (error) {
    return (
      <div className="bg-overdue/10 text-overdue rounded-xl px-4 py-3 flex items-center justify-between">
        <span>Failed to load: {error}</span>
        <button onClick={loadAll} className="underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-3">Manage Books</h2>

      {busy && <p className="text-sm text-ink/60 mb-2">Saving changes…</p>}
      {message && <p className="text-sm text-available mb-2">{message}</p>}
      {actionError && (
        <div className="bg-overdue/10 text-overdue text-sm rounded-lg px-3 py-2 mb-3 flex justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="underline">Dismiss</button>
        </div>
      )}

      {/* b) POST / c) PUT form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-display mb-3">{editingId ? `Edit Book #${editingId}` : "Add a New Book"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title" value={form.title} error={formErrors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label="Author" value={form.author} error={formErrors.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Field label="Category" value={form.category} error={formErrors.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Field label="Year" value={form.year} error={formErrors.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" disabled={busy}
            className="bg-spine text-white rounded-full px-5 py-2 disabled:opacity-40">
            {editingId ? "Update Book" : "Add Book"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="rounded-full px-5 py-2 border border-ink/20">Cancel</button>
          )}
        </div>
      </form>

      {/* a) GET: book list with PUT / DELETE / borrow actions */}
      <h3 className="font-display mb-2">Books ({books.length})</h3>
      {books.length === 0 ? (
        <p className="text-ink/50 mb-6">No books found</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {books.map((b) => (
            <li key={b.id}
              className="bg-card rounded-lg shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">{b.title} <span className="text-ink/50 text-sm">by {b.author}</span></p>
                <p className="text-xs text-ink/50">
                  {b.category} · {b.year} ·{" "}
                  <span className={b.available ? "text-available" : "text-overdue"}>
                    {b.available ? "On the shelf" : "Checked out"}
                  </span>
                </p>
              </div>
              <div className="flex gap-1">
                <button disabled={!b.available || busy} onClick={() => handleBorrow(b)}
                  className="text-xs bg-spine text-white rounded-full px-3 py-1 disabled:opacity-40">Borrow</button>
                <button disabled={busy} onClick={() => handleEdit(b)}
                  className="text-xs bg-gold text-white rounded-full px-3 py-1 disabled:opacity-40">Edit</button>
                <button disabled={busy} onClick={() => handleDelete(b)}
                  className="text-xs bg-overdue text-white rounded-full px-3 py-1 disabled:opacity-40">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* e) borrowing records */}
      <h3 className="font-display mb-2">Borrowing Records ({borrowings.length})</h3>
      {borrowings.length === 0 ? (
        <p className="text-ink/50">No borrowing records yet</p>
      ) : (
        <ul className="space-y-2">
          {borrowings.map((r) => (
            <li key={r.id}
              className="bg-card rounded-lg shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-ink/50">
                  Borrowed {r.borrowedOn} · Due {r.dueDate} · Renewals {r.renewals} ·{" "}
                  <span className={r.status === "borrowed" ? "text-gold" : "text-available"}>{r.status}</span>
                </p>
              </div>
              {r.status === "borrowed" && (
                <div className="flex gap-1">
                  <button disabled={busy} onClick={() => handleRenew(r)}
                    className="text-xs bg-gold text-white rounded-full px-3 py-1 disabled:opacity-40">Renew</button>
                  <button disabled={busy} onClick={() => handleReturn(r)}
                    className="text-xs bg-overdue text-white rounded-full px-3 py-1 disabled:opacity-40">Return</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}