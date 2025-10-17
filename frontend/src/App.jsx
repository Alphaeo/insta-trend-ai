// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Trend from "./pages/Trend";
import Analyse from "./pages/Analyse";
import Lessons from "./pages/Lessons";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Content area */}
        <main className="pb-20"> {/* space for bottom nav on mobile */}
          <Routes>
            <Route path="/" element={<Trend />} />
            <Route path="/analyse" element={<Analyse />} />
            <Route path="/lessons" element={<Lessons />} />
          </Routes>
        </main>

        {/* Bottom Navigation (mobile-first) */}
        <Navbar />
      </div>
    </Router>
  );
}
