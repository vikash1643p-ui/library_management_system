import React, { useMemo } from "react";
import { useLibraryStore } from "../store/libraryStore";
import { SearchBookIllustration } from "./SearchBookIllustration";
import { initialBooks } from "../data/mockData";

export function BookListCtx() {
  const books = useLibraryStore((s) => s.books);
  const hasHydrated = useLibraryStore((s) => s.hasHydrated);
  const titleSearch = useLibraryStore((s) => s.titleSearch);
  const authorSearch = useLibraryStore((s) => s.authorSearch);
  const category = useLibraryStore((s) => s.category);
  const onlyAvailable = useLibraryStore((s) => s.onlyAvailable);
  const setTitleSearch = useLibraryStore((s) => s.setTitleSearch);
  const setAuthorSearch = useLibraryStore((s) => s.setAuthorSearch);
  const setCategory = useLibraryStore((s) => s.setCategory);
  const setOnlyAvailable = useLibraryStore((s) => s.setOnlyAvailable);
  const setSelectedBook = useLibraryStore((s) => s.setSelectedBook);
  const borrowBook = useLibraryStore((s) => s.borrowBook);
  const placeHold = useLibraryStore((s) => s.placeHold);

  const categories = useMemo(() => [...new Set(initialBooks.map((b) => b.category))], []);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(titleSearch.toLowerCase());
      const matchAuthor = b.author.toLowerCase().includes(authorSearch.toLowerCase());
      const matchCategory = category ? b.category === category : true;
      const matchAvail = onlyAvailable ? b.available : true;
      return matchTitle && matchAuthor && matchCategory && matchAvail;
    });
  }, [books, titleSearch, authorSearch, category, onlyAvailable]);

  // f) loading state while the persisted store rehydrates from localStorage
  if (!hasHydrated) {
    return <p className="text-ink/50 mb-6">Loading library data…</p>;
  }

  return (
    <div className="mb-6">
      <SearchBookIllustration />
      <h2 className="font-display text-lg mb-2">Book Search</h2>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-3">
        <input value={titleSearch} onChange={(e) => setTitleSearch(e.target.value)} placeholder="Title..." className="border rounded-full px-4 py-2 w-full sm:w-auto" />
        <input value={authorSearch} onChange={(e) => setAuthorSearch(e.target.value)} placeholder="Author..." className="border rounded-full px-4 py-2 w-full sm:w-auto" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-full px-4 py-2 w-full sm:w-auto">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Available only
        </label>
      </div>

      {/* f) empty state */}
      {filteredBooks.length === 0 ? (
        <p className="text-ink/50">No books found</p>
      ) : (
        <ul className="space-y-2">
          {filteredBooks.map((b) => (
            <li key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-card rounded-lg shadow-sm px-4 py-3">
              <button onClick={() => setSelectedBook(b)} className="text-left underline decoration-dotted text-sm sm:text-base">{b.title} — {b.author}</button>
              <span className="flex gap-1">
                <button onClick={() => borrowBook(b.id)} disabled={!b.available} className="text-sm bg-spine text-white rounded-full px-3 py-1 disabled:opacity-40">Borrow</button>
                <button onClick={() => placeHold(b.id)} className="text-sm bg-gold text-white rounded-full px-3 py-1">Hold</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}