// LibraryContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";
import { useBooks } from "./useBooks";
import { useBorrowing } from "./useBorrowing";
import { initialMember, initialHistory } from "../data/mockData";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const bookState = useBooks();
  const borrowState = useBorrowing(bookState.books, bookState.setBooks);
  const [member] = useState(initialMember);
  const [readingHistory] = useState(initialHistory);
  const [selectedBook, setSelectedBook] = useState(null);

  const availableBooks = useMemo(() => bookState.books.filter((b) => b.available), [bookState.books]);
  const overdueBooks = useMemo(
    () => borrowState.borrowedBooks.filter((b) => new Date(b.dueDate) < new Date()),
    [borrowState.borrowedBooks]
  );
  const dueSoonBooks = useMemo(() => {
    const soon = new Date(); soon.setDate(soon.getDate() + 3);
    return borrowState.borrowedBooks.filter((b) => new Date(b.dueDate) <= soon && new Date(b.dueDate) >= new Date());
  }, [borrowState.borrowedBooks]);
  const readingStats = useMemo(() => ({
    totalRead: readingHistory.length,
    totalBorrowed: borrowState.borrowedBooks.length,
  }), [readingHistory, borrowState.borrowedBooks]);

  const value = {
    ...bookState, ...borrowState,
    member, readingHistory, selectedBook, setSelectedBook,
    availableBooks, overdueBooks, dueSoonBooks, readingStats,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}