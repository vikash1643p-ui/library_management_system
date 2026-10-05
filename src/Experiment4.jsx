// Experiment4.jsx
import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { Header, Footer } from "./Experiment1";
import { useAuth, ProtectedRoute } from "./AuthContext";
import { initialBooks, initialHistory } from "./data/mockData";

const LIBRARY_PHOTO_URL =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Carnegie_Library_of_Pittsburgh_-_IMG_1162.JPG?width=800";

export function Button({ children, className = "", ...props }) {
  return (
    <button {...props} className={`px-3 py-1.5 rounded-none bg-spine text-paper disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div className="mb-3">
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} className="border p-2 w-full" />
      {error && <p className="text-overdue text-xs mt-1">{error}</p>}
    </div>
  );
}

export function BookStatus({ available }) {
  return <span className={available ? "text-available" : "text-overdue"}>{available ? "On the shelf" : "Checked out"}</span>;
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error(err, info); }
  render() {
    if (this.state.hasError) return <div className="p-4 bg-overdue/10 text-overdue">Something went wrong. Please try again later.</div>;
    return this.props.children;
  }
}

const validateRequired = (v, field) => (v ? "" : `${field} is required`);
const validateEmail = (v) => (!v ? "Email is required" : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address");
const validateMemberId = (v) => (!v ? "Member ID is required" : /^M\d{3,}$/.test(v) ? "" : "Member ID must look like M001");
const validatePassword = (v) => (!v ? "Password is required" : v.length < 6 ? "Password must be at least 6 characters" : "");
const validatePhone = (v) => (!v ? "Phone number is required" : /^\d{10}$/.test(v) ? "" : "Phone number must be 10 digits");
const validateIdOrEmail = (v) =>
  (!v ? "Member ID or email is required" : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^M\d{3,}$/.test(v)) ? "" : "Enter a valid email or Member ID");

function Login() {
  const [form, setForm] = useState({ idOrEmail: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/account/profile";

  const handleSubmit = (e) => {
    e.preventDefault();
    const idErr = validateIdOrEmail(form.idOrEmail);
    const pwErr = validatePassword(form.password);
    setErrors({ idOrEmail: idErr, password: pwErr });
    if (!idErr && !pwErr) {
      login(form.idOrEmail);
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-3xl bg-card shadow-md overflow-hidden mx-auto">
      <div className="md:w-1/2 hidden md:block">
        <img
          src={LIBRARY_PHOTO_URL}
          alt="Interior of the Carnegie Library of Pittsburgh"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 sm:p-6 md:w-1/2">
        <form onSubmit={handleSubmit}>
          <h2 className="font-display text-lg mb-3">Member Login</h2>
          <Input
            label="Member ID / Email"
            value={form.idOrEmail}
            onChange={(e) => setForm({ ...form, idOrEmail: e.target.value })}
            error={errors.idOrEmail}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
}

function BorrowRequestForm() {
  const [memberId, setMemberId] = useState("");
  const [days, setDays] = useState("14");
  const [errors, setErrors] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    const idErr = validateMemberId(memberId);
    const daysErr = validateRequired(days, "Borrow duration");
    setErrors({ memberId: idErr, days: daysErr });
    if (!idErr && !daysErr) alert(`Borrow request submitted for ${days} days`);
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mb-6">
      <h3 className="font-display mb-2">Borrow Request</h3>
      <Input label="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} error={errors.memberId} />
      <Input label="Duration (days)" value={days} onChange={(e) => setDays(e.target.value)} error={errors.days} />
      <Button type="submit">Submit Request</Button>
    </form>
  );
}

function RenewalRequestForm() {
  const [bookId, setBookId] = useState("");
  const [errors, setErrors] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateRequired(bookId, "Book ID");
    const bookExists = initialBooks.some((b) => String(b.id) === bookId);
    const renewalErr = err || (!bookExists ? "Book renewal is not available" : "");
    setErrors({ bookId: renewalErr });
    if (!renewalErr) alert(`Renewal requested for book ${bookId}`);
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mb-6">
      <h3 className="font-display mb-2">Renewal Request</h3>
      <Input label="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} error={errors.bookId} />
      <Button type="submit">Renew</Button>
    </form>
  );
}

function ProfileForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      name: validateRequired(form.name, "Name"),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
    };
    setErrors(newErrors);
    if (!newErrors.name && !newErrors.email && !newErrors.phone) alert("Profile updated successfully");
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <h3 className="font-display mb-2">Update Profile</h3>
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
      <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
      <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
      <Button type="submit">Save Profile</Button>
    </form>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const memberBorrowed = [
    { ...initialBooks[0], dueDate: "2026-09-15" },
    { ...initialBooks[3], dueDate: "2026-09-20" },
  ];
  const readingHistory = initialHistory;

  return (
    <div>
      <div className="bg-card border-l-4 border-available p-3 mb-6">
        <h2 className="font-display text-lg">Welcome, {user?.name}</h2>
        <p className="text-sm text-ink/70 mt-1">Logged in as: {user?.id}</p>
        <p className="text-sm text-ink/70">Member ID: M001</p>
        <span className="inline-block mt-2 text-xs bg-available/20 text-available px-2 py-1">Verified Member</span>
      </div>

      <h3 className="font-display mb-2">Currently Borrowed</h3>
      {memberBorrowed.length === 0 ? (
        <p className="text-ink/50 mb-6">No borrowed books</p>
      ) : (
        <ul className="space-y-1 mb-6">
          {memberBorrowed.map((b) => (
            <li key={b.id} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 border-b py-2">
              <span className="text-sm sm:text-base">{b.title} — Due {b.dueDate}</span>
              <BookStatus available={b.available} />
            </li>
          ))}
        </ul>
      )}

      <h3 className="font-display mb-2">Reading History</h3>
      {readingHistory.length === 0 ? (
        <p className="text-ink/50 mb-6">No reading history available</p>
      ) : (
        <ul className="space-y-1 mb-6">
          {readingHistory.map((h) => (
            <li key={h.id}>{h.title} — returned {h.returnedOn}</li>
          ))}
        </ul>
      )}

      <BorrowRequestForm />
      <RenewalRequestForm />
      <ProfileForm />
    </div>
  );
}

export default function Account() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="p-3 sm:p-4 md:p-6 flex-1">
          <nav className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
            <Link to="/account/login">Login</Link>
            <Link to="/account/profile">Profile</Link>
          </nav>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}