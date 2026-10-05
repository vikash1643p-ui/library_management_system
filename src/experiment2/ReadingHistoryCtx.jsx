import React from "react";
import { useLibraryStore } from "../store/libraryStore";

export function ReadingHistoryCtx() {
  const readingHistory = useLibraryStore((s) => s.readingHistory);
  return (
    <div className="mb-6">
      <h2 className="font-display text-lg mb-2">Reading History</h2>
      {readingHistory.length === 0 ? (
        <p className="text-ink/50">No reading history available</p>
      ) : (
        <ul className="space-y-1">{readingHistory.map((h) => <li key={h.id}>{h.title} — returned {h.returnedOn}</li>)}</ul>
      )}
    </div>
  );
}