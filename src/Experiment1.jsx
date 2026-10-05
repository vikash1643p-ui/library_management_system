// Experiment1.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useBorrowedBooksStore } from "./borrowStore";
import { initialBooks, initialMember, initialHistory } from "./data/mockData";
import { fetchBooks, fetchMember, fetchBookById, searchBooks, fetchRecommendations } from "./api/libraryApi";
const LIBRARY_PHOTO_URL =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Carnegie_Library_of_Pittsburgh_-_IMG_1162.JPG?width=1600";

function BookStackIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="42" width="44" height="8" rx="1" fill="#B98A2E" />
      <rect x="10" y="32" width="40" height="8" rx="1" fill="#7A2E2E" />
      <rect x="12" y="22" width="36" height="8" rx="1" fill="#4F7A5C" />
      <rect x="20" y="8" width="14" height="12" rx="1" fill="#F6F1E7" stroke="#23303D" strokeWidth="1.5" />
      <line x1="27" y1="8" x2="27" y2="20" stroke="#23303D" strokeWidth="1" />
    </svg>
  );
}

function LibraryBackground({ children }) {
  return (
    <div
      className="p-3 sm:p-4 md:p-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${LIBRARY_PHOTO_URL})`,
      }}
    >
      {children}
    </div>
  );
}

/* ===================== Reusable, exported components ===================== */

export function Header() {
  return (
    <header className="bg-ink text-paper px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 border-b-4 border-spine">
      <div className="flex items-center gap-2 sm:gap-3">
        <BookStackIcon className="w-8 h-8 sm:w-10 sm:h-10" />
        <h1 className="font-display text-lg sm:text-2xl tracking-tight">Library Management System</h1>
      </div>
      <span className="font-body text-xs sm:text-sm text-paper/70">Reading room, open now</span>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper text-center p-3 mt-6 text-sm">
      &copy; {new Date().getFullYear()} Library Management System
    </footer>
  );
}

export function SearchBar({ keyword, onSearchChange, inputRef }) {
  return (
    <input
      ref={inputRef}
      value={keyword}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search by title..."
      className="border p-2 w-full md:w-1/2"
    />
  );
}

export function FilterPanel({ category, author, categories, authors, onCategoryChange, onAuthorChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 my-3">
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="border p-2 w-full sm:w-auto">
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={author} onChange={(e) => onAuthorChange(e.target.value)} className="border p-2 w-full sm:w-auto">
        <option value="">All Authors</option>
        {authors.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
}

export function BookCard({ book, onSelect, onBorrow }) {
  const categoryIcon =
    book.category === "Programming" ? "" :
    book.category === "Self-Help" ? "" :
    book.category === "History" ? "" : "";

  return (
    <div className="bg-card border-l-4 border-spine pl-4 pr-4 py-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-2xl mb-1">{categoryIcon}</div>
      <h3 className="font-display text-lg text-ink">{book.title}</h3>
      <p className="text-sm text-ink/70">{book.author}</p>
      <p className="text-xs text-ink/50 mt-1">{book.category} · {book.year}</p>
      <p className={`text-sm mt-2 font-medium ${book.available ? "text-available" : "text-overdue"}`}>
        {book.available ? "On the shelf" : "Checked out"}
      </p>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSelect(book)} className="text-sm px-3 py-1.5 border border-ink/20 hover:bg-ink hover:text-paper transition-colors">Details</button>
        <button disabled={!book.available} onClick={() => onBorrow(book.id)} className="text-sm px-3 py-1.5 bg-spine text-paper hover:bg-spine/90 disabled:opacity-40 transition-colors">Borrow</button>
      </div>
    </div>
  );
}

export function BookList({ books, onSelect, onBorrow }) {
  if (books.length === 0) return <p className="text-ink/50 mt-4">No books found</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {books.map((b) => <BookCard key={b.id} book={b} onSelect={onSelect} onBorrow={onBorrow} />)}
    </div>
  );
}

export function BookDetail({ book }) {
  if (!book) return null;
  return (
    <div className="bg-card border-l-4 border-gold p-4 mt-4">
      <h2 className="font-display text-lg">{book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Category: {book.category}</p>
      <p>Published: {book.year}</p>
      <p>Status: {book.available ? "On the shelf" : "Checked out"}</p>
      <p className="mt-2 text-sm text-ink/70">{book.description}</p>
    </div>
  );
}

export function BorrowedBooks({ borrowed, onRenew, onReturn }) {
  return (
    <div className="mt-4">
      <h3 className="font-display font-semibold mb-2">Borrowed Books</h3>
      {borrowed.length === 0 ? (
        <p className="text-ink/50">No borrowed books</p>
      ) : (
        <ul className="space-y-2">
          {borrowed.map((b) => (
            <li key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 border-b py-2">
              <span className="text-sm sm:text-base">{b.title} — Due {b.dueDate}</span>
              {(onRenew || onReturn) && (
                <span className="flex gap-1">
                  {onRenew && <button onClick={() => onRenew(b.id)} className="text-xs bg-gold text-paper px-2 py-1">Renew</button>}
                  {onReturn && <button onClick={() => onReturn(b.id)} className="text-xs bg-overdue text-paper px-2 py-1">Return</button>}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReadingHistory({ history }) {
  return (
    <div className="mt-4">
      <h3 className="font-display font-semibold mb-2">Reading History</h3>
      {history.length === 0 ? (
        <p className="text-ink/50">No reading history available</p>
      ) : (
        <ul className="space-y-1">{history.map((h) => <li key={h.id}>{h.title} — returned {h.returnedOn}</li>)}</ul>
      )}
    </div>
  );
}

export function Profile({ member }) {
  return (
    <div className="mt-4 bg-card border-l-4 border-ink/20 p-3">
      <h3 className="font-display font-semibold mb-1">Member Profile</h3>
      <p>Name: {member.name}</p>
      <p>Email: {member.email}</p>
      <p>Phone: {member.phone}</p>
    </div>
  );
}

export function Recommendations({ books }) {
  return (
    <div className="mt-4">
      <h3 className="font-display font-semibold mb-2">Recommended For You</h3>
      {books.length === 0 ? (
        <p className="text-ink/50">No recommendations yet</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {books.map((b) => <span key={b.id} className="px-3 py-1 bg-gold/20 text-ink text-sm">{b.title}</span>)}
        </div>
      )}
    </div>
  );
}

/*ex19 Apistatus*/
function ApiStatus({ loading, error, onRetry }) {
  if (loading) return <p className="text-sm text-ink/60 my-2">Loading books…</p>;
  if (error) return (
    <div className="my-2 bg-overdue/10 text-overdue text-sm px-3 py-2 flex items-center justify-between">
      <span>Failed to load: {error}</span>
      <button onClick={onRetry} className="underline">Retry</button>
    </div>
  );
  return null;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookLoading, setSelectedBookLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [history] = useState(initialHistory);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { borrowedBooks, addBorrowed, returnBorrowed, renewBorrowed } = useBorrowedBooksStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  /*const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksData, memberData] = await Promise.all([fetchBooks(), fetchMember()]);
      setBooks(booksData);
      setMember(memberData);
    } catch (err) {
      setError(err.message || "Something went wrong while loading the library.");
    } finally {
      setLoading(false);
    }
  }, []);*/
  const loadInitialData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const [booksData, memberData] = await Promise.all([fetchBooks(), fetchMember()]);
    setBooks(booksData);
    setMember(memberData);

    // Guaranteed 2nd and 3rd Fetch API calls — fire automatically on every load,
    // no click needed, so they always appear in the Network tab.
    if (booksData.length > 0) {
      await fetchBookById(booksData[0].id);
    }
    await searchBooks({ keyword: "" });
  } catch (err) {
    setError(err.message || "Something went wrong while loading the library.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadInitialData();
    searchInputRef.current?.focus();
  }, [loadInitialData]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await searchBooks({ keyword, category, author });
        if (!cancelled) setBooks(results);
      } catch (err) {
        if (!cancelled) setError(err.message || "Search request failed.");
      }
    })();
    setSelectedBook(null);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, author]);

  useEffect(() => {
    const borrowedCategories = [...new Set(borrowedBooks.map((b) => b.category))];
    if (borrowedCategories.length === 0) {
      setRecommendations([]);
      return;
    }
    fetchRecommendations(borrowedCategories)
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [borrowedBooks]);

  const availableBooks = useMemo(() => books.filter((b) => b.available), [books]);
  const overdueBooks = useMemo(
    () => borrowedBooks.filter((b) => new Date(b.dueDate) < new Date()),
    [borrowedBooks]
  );
  const categories = useMemo(() => [...new Set(books.map((b) => b.category))], [books]);
  const authors = useMemo(() => [...new Set(books.map((b) => b.author))], [books]);

  const handleSelectBook = useCallback(async (book) => {
    setSelectedBookLoading(true);
    try {
      const fullBook = await fetchBookById(book.id);
      setSelectedBook(fullBook);
    } catch (err) {
      setError(err.message || "Could not load book details.");
    } finally {
      setSelectedBookLoading(false);
    }
  }, []);

  const borrowBook = useCallback((id) => {
    if (!isAuthenticated) {
      navigate("/account/login", { state: { from: { pathname: "/" } } });
      return;
    }
    setBooks((prevBooks) => {
      const target = prevBooks.find((b) => b.id === id);
      if (target && target.available) {
        addBorrowed(target);
        navigate("/library/borrowed");
      }
      return prevBooks.map((b) => (b.id === id ? { ...b, available: false } : b));
    });
  }, [isAuthenticated, navigate, addBorrowed]);

  const returnBook = useCallback((id) => {
    returnBorrowed(id);
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, available: true } : b)));
  }, [returnBorrowed]);

  const renewBook = useCallback((id) => {
    renewBorrowed(id);
  }, [renewBorrowed]);

  const placeHold = useCallback((id) => {
    if (!isAuthenticated) {
      navigate("/account/login", { state: { from: { pathname: "/" } } });
      return;
    }
    alert(`Hold placed on book ID ${id}`);
  }, [isAuthenticated, navigate]);

  return (
    <LibraryBackground>
      <Header />
      <div className="mt-4">
        <SearchBar keyword={keyword} onSearchChange={setKeyword} inputRef={searchInputRef} />
        <FilterPanel
          category={category} author={author}
          categories={categories} authors={authors}
          onCategoryChange={setCategory} onAuthorChange={setAuthor}
        />

        <ApiStatus loading={loading} error={error} onRetry={loadInitialData} />

        {!loading && !error && (
          <>
            <p className="text-sm text-ink/60">Available: {availableBooks.length} | Overdue: {overdueBooks.length}</p>
            <BookList books={books} onSelect={handleSelectBook} onBorrow={borrowBook} />
            {selectedBookLoading && <p className="text-sm text-ink/60 mt-2">Loading book details…</p>}
            <BookDetail book={selectedBook} />
            <BorrowedBooks borrowed={borrowedBooks} onRenew={renewBook} onReturn={returnBook} />
            <button onClick={() => placeHold(999)} className="mt-3 text-xs bg-ink/80 text-white rounded-full px-4 py-1.5">Place Hold (demo)</button>
            <Recommendations books={recommendations} />
            <ReadingHistory history={history} />
            {member && <Profile member={member} />}
          </>
        )}
      </div>
      <Footer />
    </LibraryBackground>
  );
}