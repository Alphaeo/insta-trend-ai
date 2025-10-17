// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

function Icon({ children }) {
  return (
    <div className="w-6 h-6">
      {children}
    </div>
  );
}

export default function Navbar() {
  const base = "flex flex-col items-center text-xs";
  const active = "text-indigo-600 dark:text-indigo-400";

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg px-4 py-2 flex justify-between items-center z-50">
      <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`}>
        <Icon>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
          </svg>
        </Icon>
        <span className="mt-1">Trend</span>
      </NavLink>

      <NavLink to="/analyse" className={({ isActive }) => `${base} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`}>
        <Icon>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M11 12h6m-6 4h6M5 8h14M5 16h.01M5 12h.01" />
          </svg>
        </Icon>
        <span className="mt-1">Analyse</span>
      </NavLink>

      <NavLink to="/lessons" className={({ isActive }) => `${base} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`}>
        <Icon>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5zM12 12v8" />
          </svg>
        </Icon>
        <span className="mt-1">Lessons</span>
      </NavLink>
    </nav>
  );
}

