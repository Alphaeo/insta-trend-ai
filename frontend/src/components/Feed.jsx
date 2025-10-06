import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Feed() {
  const [hashtags, setHashtags] = useState([]);
  const [reels, setReels] = useState([]);
  const hashtagToScrape = "kpop"; // tu peux changer ça dynamiquement si tu veux

  useEffect(() => {
    async function fetchReels() {
      try {
        // 1️⃣ Appeler l'endpoint de scraping
        await axios.get(`/scrape/${hashtagToScrape}`);

        // 2️⃣ Récupérer les Reels depuis MongoDB via ton endpoint existant
        const res = await axios.get(`/reel`); // si tu veux récupérer tous les Reels, sinon adapte l'endpoint
        const data = res.data;

        // 3️⃣ Préparer les hashtags pour le graphique
        const hashtagsData = data.reduce((acc, reel) => {
          const tag = reel.hashtag || hashtagToScrape;
          const existing = acc.find(h => h.name === tag);
          if (existing) {
            existing.value += reel.views || 0;
          } else {
            acc.push({ name: tag, value: reel.views || 0 });
          }
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Top Hashtags</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={Array.isArray(hashtags) ? hashtags : []}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Feed</h2>
        <div className="grid grid-cols-1 gap-4">
          {reels.length > 0 ? (
            reels.map((reel, idx) => (
              <div key={idx} className="p-4 border rounded">
                <img src={reel.media_url} alt="thumb" />
                <p className="mt-2">
                  {reel.caption || "No caption"} — #{reel.hashtag || hashtagToScrape}
                </p>
              </div>
            ))
          ) : (
            <p>No Reels available.</p>
          )}
        </div>
      </div>
    </div>
  );
}


