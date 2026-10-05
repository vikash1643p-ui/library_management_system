import React from "react";
import { useLibraryStore } from "../store/libraryStore";

export function BorrowedBooksCtx() {
  const borrowedBooks = useLibraryStore((s) => s.borrowedBooks);
  const returnBook = useLibraryStore((s) => s.returnBook);
  const renewBook = useLibraryStore((s) => s.renewBook);
  const status = useLibraryStore((s) => s.status);

  return (
    <div className="mb-6">
      <h2 className="font-display text-lg mb-2">Borrowing Status</h2>
      {status && <p className="text-sm text-spine mb-2">{status}</p>}
      {/* f) empty state */}
      {borrowedBooks.length === 0 ? (
        <p className="text-ink/50">No borrowed books</p>
      ) : (
        borrowedBooks.map((b) => (
          <div key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-card rounded-lg shadow-sm px-4 py-3 mb-2">
            <span className="text-sm sm:text-base">{b.title} — Due {b.dueDate}</span>
            <span className="flex gap-1">
              <button onClick={() => renewBook(b.id)} className="text-xs bg-gold text-white rounded-full px-3 py-1">Renew</button>
              <button onClick={() => returnBook(b.id)} className="text-xs bg-overdue text-white rounded-full px-3 py-1">Return</button>
            </span>
          </div>
        ))
      )}
    </div>
  );
}