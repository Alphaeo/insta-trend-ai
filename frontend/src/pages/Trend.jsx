// src/pages/Trend.jsx
import React from "react";
import Feed from "../components/Feed";

export default function Trend() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Trends</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Live reels trends — mobile first</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm shadow-sm hover:bg-indigo-500 transition">Refresh</button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <Feed />
        </div>

        {/* small insights card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-300">Top Hashtag</h3>
            <p className="mt-2 font-medium">#kpop</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h3 className="text-sm text-gray-500 dark:text-gray-300">Recent Spike</h3>
            <p className="mt-2 font-medium">Sample Reel — 1.2M views</p>
          </div>
        </div>
      </section>
    </div>
  );
}
