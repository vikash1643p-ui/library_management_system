// useBorrowing.js
import { useState, useEffect, useCallback } from "react";

export function useBorrowing(books, setBooks) {
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("borrowedBooks")) || []; } catch { return []; }
  });
  const [holds, setHolds] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));
  }, [borrowedBooks]);

  const borrowBook = useCallback((id) => {
    const book = books.find((b) => b.id === id);
    if (!book || !book.available) { setStatus("Book currently unavailable"); return; }
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
    setBorrowedBooks((prev) => [...prev, { ...book, dueDate: dueDate.toISOString().split("T")[0] }]);
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, available: false } : b)));
    setStatus("Book borrowed successfully");
  }, [books, setBooks]);

  const returnBook = useCallback((id) => {
    setBorrowedBooks((prev) => prev.filter((b) => b.id !== id));
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, available: true } : b)));
    setStatus("Book returned successfully");
  }, [setBooks]);

  const renewBook = useCallback((id) => {
    const target = borrowedBooks.find((b) => b.id === id);
    if (!target) { setStatus("Book renewal is not available"); return; }
    setBorrowedBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newDue = new Date(b.dueDate); newDue.setDate(newDue.getDate() + 7);
        return { ...b, dueDate: newDue.toISOString().split("T")[0] };
      })
    );
    setStatus("Book renewed successfully");
  }, [borrowedBooks]);

  const placeHold = useCallback((id) => {
    setHolds((prev) => [...prev, id]);
    setStatus(`Hold placed on book ID ${id}`);
  }, []);

  const clearBorrowing = useCallback(() => {
    setBorrowedBooks([]);
    setStatus("Borrowing records cleared");
  }, []);

  return { borrowedBooks, holds, status, borrowBook, returnBook, renewBook, placeHold, clearBorrowing };
}