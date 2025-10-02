import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Feed() {
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    async function fetchTop() {
      // For MVP, backend endpoint could be /api/top_hashtags (not implemented in backend skeleton)
      try {
        const res = await axios.get("/api/top_hashtags"); // proxy to backend:8000 in production
        setHashtags(res.data);
      } catch (e) {
        // fallback: mock data
        setHashtags([
          { name: "dance", value: 120 },
          { name: "kpop", value: 80 },
          { name: "food", value: 60 }
        ]);
      }
    }
    fetchTop();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Top Hashtags (sample)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hashtags}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Feed (sample)</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded">
            <img src="https://via.placeholder.com/320x180" alt="thumb" />
            <p className="mt-2">Sample Reel — #dance #viral</p>
          </div>
        </div>
      </div>
    </div>
  );
}

