import React from "react";
import { Header, Footer } from "./Experiment1";
import { BookListCtx } from "./experiment2/BookListCtx";
import { BookDetailCtx } from "./experiment2/BookDetailCtx";
import { BorrowedBooksCtx } from "./experiment2/BorrowedBooksCtx";
import { ReadingHistoryCtx } from "./experiment2/ReadingHistoryCtx";
import { ProfileCtx } from "./experiment2/ProfileCtx";

export default function BookSearchAndBorrow() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <BookListCtx />
        <BookDetailCtx />
        <BorrowedBooksCtx />
        <ReadingHistoryCtx />
        <ProfileCtx />
      </main>
      <Footer />
    </div>
  );
}