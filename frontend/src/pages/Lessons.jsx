// src/pages/Lessons.jsx
import React from "react";

export default function Lessons() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <h1 className="text-xl font-semibold mb-2">Lessons</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Actionable insights and tips from trending reels.</p>

      <div className="grid gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold">Lesson 1</h4>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Use a strong hook in the first 2 seconds.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold">Lesson 2</h4>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Short captions with 1-2 hashtags perform better.</p>
        </div>
      </div>
    </div>
  );
}

