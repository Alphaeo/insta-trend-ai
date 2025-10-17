import React from "react";
import { NavLink } from "react-router-dom";
import { TrendingUp, BarChart2, BookOpen } from "lucide-react";

export default function Navbar() {
  const navItems = [
    { path: "/", label: "Trend", icon: <TrendingUp size={22} /> },
    { path: "/analyse", label: "Analyse", icon: <BarChart2 size={22} /> },
    { path: "/lessons", label: "Lessons", icon: <BookOpen size={22} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:w-64 md:h-screen md:fixed md:top-0 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 flex md:flex-col justify-around md:justify-start md:py-6 z-50">
      {navItems.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start gap-2 p-3 md:px-6 font-medium transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:text-indigo-500"
            }`
          }
        >
          {icon}
          <span className="hidden md:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

