// Welcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LIBRARY_PHOTO_URL =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Carnegie_Library_of_Pittsburgh_-_IMG_1162.JPG?width=1600";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(15,42,46,0.55), rgba(15,42,46,0.55)), url(${LIBRARY_PHOTO_URL})`,
      }}
    >
      <div className="text-center px-4">
        <h1 className="font-display text-3xl sm:text-4xl text-white mb-3">
          Welcome to the Library Management System
        </h1>
        <p className="text-white/80 text-sm sm:text-base mb-8">
          Discover, borrow, and manage your books — all in one place.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-spine text-white rounded-full px-8 py-3 text-base font-medium hover:bg-spine/90 transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
}