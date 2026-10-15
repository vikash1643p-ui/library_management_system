// App.jsx

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

const Welcome = lazy(() => import("./Welcome"));
const Home = lazy(() => import("./Experiment1"));
const BookSearchAndBorrow = lazy(() => import("./Experiment2"));
const Navigation = lazy(() => import("./Experiment3"));
const Account = lazy(() => import("./Experiment4"));

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      aria-label={children}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
          isActive
            ? "bg-spine text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col md:flex-row">
          <aside
            aria-label="Main navigation"
            className="w-full md:w-56 flex-shrink-0 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible"
            style={{ backgroundColor: "var(--color-sidebar)" }}
          >
            <h2 className="font-display text-white text-xl mb-0 md:mb-6 px-2 whitespace-nowrap">
              📚 Library
            </h2>

            <nav aria-label="Library pages" className="flex gap-2 md:flex-col">
              <SidebarLink to="/welcome">Welcome</SidebarLink>
              <SidebarLink to="/">Home</SidebarLink>
              <SidebarLink to="/search">Search & Borrow</SidebarLink>
              <SidebarLink to="/library/books">Catalog</SidebarLink>
              <SidebarLink to="/account/login">Account</SidebarLink>
            </nav>
          </aside>

          <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="p-6"
                >
                  Loading library page...
                </div>
              }
            >
              <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<BookSearchAndBorrow />} />
                <Route path="/library/*" element={<Navigation />} />
                <Route path="/account/*" element={<Account />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
