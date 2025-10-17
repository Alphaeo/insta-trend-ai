import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Feed() {
  const [hashtags, setHashtags] = useState([]);
  const [reels, setReels] = useState([]);
  const hashtagToScrape = "kpop";

  useEffect(() => {
    async function fetchReels() {
      try {
        await axios.get(`/scrape/${hashtagToScrape}`);
        const res = await axios.get(`/reel`);
        const data = res.data;

        const hashtagsData = data.reduce((acc, reel) => {
          const tag = reel.hashtag || hashtagToScrape;
          const existing = acc.find(h => h.name === tag);
          if (existing) existing.value += reel.views || 0;
          else acc.push({ name: tag, value: reel.views || 0 });
          return acc;
        }, []);

        setHashtags(hashtagsData);
        setReels(data);
      } catch (e) {
        console.error("Error fetching reels:", e);
      }
    }
    fetchReels();
  }, []);

  return (
    <div>
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top Hashtags</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={Array.isArray(hashtags) ? hashtags : []}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.length > 0 ? (
          reels.map((reel, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={reel.media_url}
                alt="thumb"
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {reel.caption || "No caption"} <br />
                  <span className="text-indigo-500 font-medium">
                    #{reel.hashtag || hashtagToScrape}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No Reels available.</p>
        )}
      </div>
    </div>
  );
}

