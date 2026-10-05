import React from "react";
import { useLibraryStore } from "../store/libraryStore";

export function BookDetailCtx() {
  const selectedBook = useLibraryStore((s) => s.selectedBook);
  if (!selectedBook) return null;
  return (
    <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
      <h3 className="font-display text-lg">{selectedBook.title}</h3>
      <p>{selectedBook.description}</p>
      {!selectedBook.available && <p className="text-overdue text-sm mt-1">Book currently unavailable</p>}
    </div>
  );
}