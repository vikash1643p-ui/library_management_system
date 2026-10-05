// SearchBookIllustration.jsx
import React from "react";

export function SearchBookIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-xs mx-auto mb-4" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="55" width="90" height="14" rx="2" fill="#7A2E2E" />
      <rect x="35" y="41" width="80" height="14" rx="2" fill="#B98A2E" />
      <rect x="40" y="27" width="70" height="14" rx="2" fill="#4F7A5C" />
      <circle cx="150" cy="45" r="22" fill="none" stroke="#23303D" strokeWidth="4" />
      <line x1="166" y1="61" x2="182" y2="77" stroke="#23303D" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}