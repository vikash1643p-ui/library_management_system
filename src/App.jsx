// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Welcome from "./Welcome";
import Home from "./Experiment1";
import BookSearchAndBorrow from "./Experiment2";
import Navigation from "./Experiment3";
import Account from "./Experiment4";
import { AuthProvider } from "./AuthContext";

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "bg-spine text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
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
            className="w-full md:w-56 flex-shrink-0 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible"
            style={{ backgroundColor: "var(--color-sidebar)" }}
          >
            <h2 className="font-display text-white text-xl mb-0 md:mb-6 px-2 whitespace-nowrap">📚 Library</h2>
            <SidebarLink to="/welcome">Welcome</SidebarLink>
            <SidebarLink to="/">Home</SidebarLink>
            <SidebarLink to="/search">Search & Borrow</SidebarLink>
            <SidebarLink to="/library/books">Catalog</SidebarLink>
            <SidebarLink to="/account/login">Account</SidebarLink>
          </aside>
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<BookSearchAndBorrow />} />
              <Route path="/library/*" element={<Navigation />} />
              <Route path="/account/*" element={<Account />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}