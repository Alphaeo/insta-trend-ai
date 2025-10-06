import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Trend from "./pages/Trend";
import Analyse from "./pages/Analyse";
import Lessons from "./pages/Lessons";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header / Navigation */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reels Trends</h1>
          <nav className="space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-500 font-semibold" : "text-gray-600 hover:text-blue-500"
              }
            >
              Trend
            </NavLink>
            <NavLink
              to="/analyse"
              className={({ isActive }) =>
                isActive ? "text-blue-500 font-semibold" : "text-gray-600 hover:text-blue-500"
              }
            >
              Analyse
            </NavLink>
            <NavLink
              to="/lessons"
              className={({ isActive }) =>
                isActive ? "text-blue-500 font-semibold" : "text-gray-600 hover:text-blue-500"
              }
            >
              Lessons
            </NavLink>
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Trend />} />
            <Route path="/analyse" element={<Analyse />} />
            <Route path="/lessons" element={<Lessons />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

