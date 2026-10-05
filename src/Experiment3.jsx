// Experiment3.jsx
import React from "react";
import { Routes, Route, Link, NavLink, useParams, useNavigate } from "react-router-dom";
import { Header, Footer } from "./Experiment1";
import { useAuth, ProtectedRoute } from "./AuthContext";
import { useBorrowedBooksStore } from "./borrowStore";
import { initialBooks } from "./data/mockData";

const LIBRARY_PHOTO_URL =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Carnegie_Library_of_Pittsburgh_-_IMG_1162.JPG?width=800";

function CatalogHero() {
  return (
    <div className="w-full sm:w-56 md:w-72 flex-shrink-0">
      <img
        src={LIBRARY_PHOTO_URL}
        alt="Interior of the Carnegie Library of Pittsburgh"
        className="w-full h-40 sm:h-48 object-cover"
      />
    </div>
  );
}

function BooksPage() {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1">
        <h2 className="font-display text-lg mb-2">Books</h2>
        <ul className="space-y-1">
          {initialBooks.map((b) => (
            <li key={b.id}>
              <Link to={`/library/book/${b.id}`} className="text-spine underline">{b.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <CatalogHero />
    </div>
  );
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const book = initialBooks.find((b) => b.id === Number(id));
  if (!book) return <p>Book not found</p>;

  const handleBorrowClick = () => {
    if (!isAuthenticated) {
      navigate("/account/login", { state: { from: { pathname: `/library/borrow/${book.id}` } } });
    } else {
      navigate(`/library/borrow/${book.id}`);
    }
  };

  return (
    <div>
      <h2 className="font-display text-lg">{book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Category: {book.category}</p>
      <p>Description: {book.description}</p>
      <p>Availability: {book.available ? "Available" : "Unavailable"}</p>
      <p>Published year: {book.year}</p>
      <p>Borrowing status: {book.available ? "Not currently borrowed" : "Currently checked out"}</p>
      <button onClick={handleBorrowClick} className="mt-2 bg-spine text-paper px-3 py-1">
        Borrow / Hold Request
      </button>
    </div>
  );
}

function BorrowRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addBorrowed } = useBorrowedBooksStore();
  const book = initialBooks.find((b) => b.id === Number(id));

  const confirmBorrow = () => {
    if (book) addBorrowed(book);
    navigate("/library/borrowed");
  };

  return (
    <div>
      <h2 className="font-display text-lg">Borrow Request: {book?.title}</h2>
      <div className="flex gap-2 mt-2">
        <button onClick={confirmBorrow} className="bg-available text-paper px-3 py-1">
          Confirm Borrow
        </button>
        <button onClick={confirmBorrow} className="bg-gold text-paper px-3 py-1">
          Place Hold
        </button>
      </div>
    </div>
  );
}

function BorrowedTopPage() {
  const { borrowedBooks, returnBorrowed, renewBorrowed } = useBorrowedBooksStore();

  return (
    <div>
      <h2 className="font-display text-lg mb-4">Borrowed Books</h2>
      {borrowedBooks.length === 0 ? (
        <p className="text-ink/50">No borrowed books</p>
      ) : (
        <div className="space-y-4">
          {borrowedBooks.map((b) => (
            <div key={b.id} className="bg-card border-l-4 border-spine p-4">
              <h3 className="font-display text-lg">{b.title}</h3>
              <p className="text-sm text-ink/70">Author: {b.author}</p>
              <p className="text-sm text-ink/70">Category: {b.category}</p>
              <p className="text-sm text-ink/70">Published: {b.year}</p>
              <p className="text-sm text-ink/70 mb-2">{b.description}</p>
              <p className="text-sm font-medium text-overdue">Due: {b.dueDate}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => renewBorrowed(b.id)} className="text-sm bg-gold text-paper px-3 py-1.5">Renew</button>
                <button onClick={() => returnBorrowed(b.id)} className="text-sm bg-overdue text-paper px-3 py-1.5">Return</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTopPage() {
  return (
    <div>
      <h2 className="font-display text-lg mb-2">Reading History</h2>
      <p className="text-ink/50">No reading history available</p>
    </div>
  );
}

export default function Navigation() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="p-3 sm:p-4 md:p-6 flex-1">
        <nav className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
          <NavLink to="/library/books">Books</NavLink>
          <NavLink to="/library/borrowed">Borrowed</NavLink>
          <NavLink to="/library/history">History</NavLink>
        </nav>
        <Routes>
          <Route path="books" element={<BooksPage />} />
          <Route path="book/:id" element={<BookDetailPage />} />
          <Route path="borrow/:id" element={<ProtectedRoute><BorrowRequestPage /></ProtectedRoute>} />
          <Route path="borrowed" element={<BorrowedTopPage />} />
          <Route path="history" element={<HistoryTopPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}