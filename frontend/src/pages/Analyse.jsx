// src/pages/Analyse.jsx
import React from "react";

export default function Analyse() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <h1 className="text-xl font-semibold mb-2">Analyse</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Lightweight AI diagnostics and quick insights.</p>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500 dark:text-gray-300">Video Detection</h3>
          <p className="mt-2">Objects detected: person, car, logo (sample)</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500 dark:text-gray-300">Audio</h3>
          <p className="mt-2">Speech: Korean (sample) — Sentiment: Positive</p>
        </div>
      </div>
    </div>
  );
}


