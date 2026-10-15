/* global test, expect, jest */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  BookCard,
  BookList,
  Profile,
  BorrowedBooks
} from "./Experiment1";

const book = {
  id: 101,
  title: "Clean Code",
  author: "Robert Martin",
  category: "Programming",
  year: 2008,
  available: true,
  description: "A programming book"
};

test("BookCard displays book details", () => {
  render(
    <BookCard
      book={book}
      onSelect={() => {}}
      onBorrow={() => {}}
    />
  );

  expect(screen.getByText("Clean Code")).toBeInTheDocument();
  expect(screen.getByText("Robert Martin")).toBeInTheDocument();
  expect(screen.getByText("On the shelf")).toBeInTheDocument();
});

test("BookList displays books", () => {
  render(
    <BookList
      books={[book]}
      onSelect={() => {}}
      onBorrow={() => {}}
    />
  );

  expect(screen.getByText("Clean Code")).toBeInTheDocument();
});

test("BookList displays empty message", () => {
  render(
    <BookList
      books={[]}
      onSelect={() => {}}
      onBorrow={() => {}}
    />
  );

  expect(screen.getByText("No books found")).toBeInTheDocument();
});

test("Borrow button calls the borrow function", () => {
  const borrowMock = jest.fn();

  render(
    <BookCard
      book={book}
      onSelect={() => {}}
      onBorrow={borrowMock}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Borrow" }));

  expect(borrowMock).toHaveBeenCalledWith(101);
});

test("Unavailable book has disabled Borrow button", () => {
  render(
    <BookCard
      book={{ ...book, available: false }}
      onSelect={() => {}}
      onBorrow={() => {}}
    />
  );

  expect(screen.getByRole("button", { name: "Borrow" })).toBeDisabled();
  expect(screen.getByText("Checked out")).toBeInTheDocument();
});

test("Profile displays member information", () => {
  render(
    <Profile
      member={{
        name: "Arjun Kumar",
        email: "member@library.com",
        phone: "9876543210"
      }}
    />
  );

  expect(screen.getByText("Name: Arjun Kumar")).toBeInTheDocument();
  expect(screen.getByText("Email: member@library.com")).toBeInTheDocument();
});

test("BorrowedBooks displays empty state", () => {
  render(
    <BorrowedBooks
      borrowed={[]}
      onRenew={() => {}}
      onReturn={() => {}}
    />
  );

  expect(screen.getByText("No borrowed books")).toBeInTheDocument();
});
