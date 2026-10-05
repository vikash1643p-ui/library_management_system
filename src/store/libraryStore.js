// libraryStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialBooks, initialMember, initialHistory } from "../data/mockData";

// d) Simple middleware-style logger — called explicitly by each action,
// guaranteed to print the correct action name every time.
function logAction(label, state) {
  console.log(`Library Action: ${label}`);
  console.log("Library State:", state);
}

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      books: initialBooks,
      member: initialMember,
      readingHistory: initialHistory,
      borrowedBooks: [],
      holds: [],
      status: "",
      hasHydrated: false,

      titleSearch: "",
      authorSearch: "",
      category: "",
      onlyAvailable: false,
      selectedBook: null,

      setTitleSearch: (v) => set({ titleSearch: v }),
      setAuthorSearch: (v) => set({ authorSearch: v }),
      setCategory: (v) => set({ category: v }),
      setOnlyAvailable: (v) => set({ onlyAvailable: v }),
      setSelectedBook: (book) => set({ selectedBook: book }),

      // c) borrow/return/renew/hold actions, each explicitly logged
      borrowBook: (id) => {
        const alreadyBorrowed = get().borrowedBooks.some((b) => b.id === id);
        if (alreadyBorrowed) {
          set({ status: "You have already borrowed this book" });
          logAction("library/borrowBook", get());
          return;
        }
        const book = get().books.find((b) => b.id === id);
        if (!book || !book.available) {
          set({ status: "Book currently unavailable" });
          logAction("library/borrowBook", get());
          return;
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        set((state) => ({
          borrowedBooks: [...state.borrowedBooks, { ...book, dueDate: dueDate.toISOString().split("T")[0] }],
          books: state.books.map((b) => (b.id === id ? { ...b, available: false } : b)),
          status: "Book borrowed successfully",
        }));
        logAction("library/borrowBook", get());
      },

      returnBook: (id) => {
        set((state) => ({
          borrowedBooks: state.borrowedBooks.filter((b) => b.id !== id),
          books: state.books.map((b) => (b.id === id ? { ...b, available: true } : b)),
          status: "Book returned successfully",
        }));
        logAction("library/returnBook", get());
      },

      renewBook: (id) => {
        const target = get().borrowedBooks.find((b) => b.id === id);
        if (!target) {
          set({ status: "Book renewal is not available" });
          logAction("library/renewBook", get());
          return;
        }
        set((state) => ({
          borrowedBooks: state.borrowedBooks.map((b) => {
            if (b.id !== id) return b;
            const newDue = new Date(b.dueDate);
            newDue.setDate(newDue.getDate() + 7);
            return { ...b, dueDate: newDue.toISOString().split("T")[0] };
          }),
          status: "Book renewed successfully",
        }));
        logAction("library/renewBook", get());
      },

      placeHold: (id) => {
        set((state) => ({
          holds: [...state.holds, id],
          status: `Hold placed on book ID ${id}`,
        }));
        logAction("library/placeHold", get());
      },

      clearBorrowing: () => {
        set({ borrowedBooks: [], status: "Borrowing records cleared" });
        logAction("library/clearBorrowing", get());
      },
    }),
    {
      name: "library-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        books: state.books,
        borrowedBooks: state.borrowedBooks,
        holds: state.holds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);