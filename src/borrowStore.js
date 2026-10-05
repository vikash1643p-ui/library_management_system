// borrowStore.js
import { useState, useCallback } from "react";

export function useBorrowedBooksStore() {
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("borrowedBooks")) || [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((updater) => {
    setBorrowedBooks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("borrowedBooks", JSON.stringify(next));
      return next;
    });
  }, []);

  const addBorrowed = useCallback((book) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const entry = { ...book, dueDate: dueDate.toISOString().split("T")[0] };
    persist((prev) => [...prev, entry]);
    return entry;
  }, [persist]);

  const returnBorrowed = useCallback((id) => {
    persist((prev) => prev.filter((b) => b.id !== id));
  }, [persist]);

  const renewBorrowed = useCallback((id) => {
    persist((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newDue = new Date(b.dueDate);
        newDue.setDate(newDue.getDate() + 7);
        return { ...b, dueDate: newDue.toISOString().split("T")[0] };
      })
    );
  }, [persist]);

  return { borrowedBooks, addBorrowed, returnBorrowed, renewBorrowed };
}