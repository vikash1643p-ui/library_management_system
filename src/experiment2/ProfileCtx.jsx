import React from "react";
import { useLibraryStore } from "../store/libraryStore";

export function ProfileCtx() {
  const member = useLibraryStore((s) => s.member);
  const readingHistory = useLibraryStore((s) => s.readingHistory);
  const borrowedBooks = useLibraryStore((s) => s.borrowedBooks);

  return (
    <div className="bg-card rounded-xl shadow-sm p-4">
      <h3 className="font-display font-semibold">{member.name}</h3>
      <p className="text-sm">{member.email}</p>
      <p className="text-sm text-ink/60">Books read: {readingHistory.length} | Currently borrowed: {borrowedBooks.length}</p>
    </div>
  );
}