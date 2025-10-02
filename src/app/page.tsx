"use client";

import { useEffect, useState } from "react";

interface Shoutout {
  name: string;
  description: string;
  image?: string;
}

export default function Home() {
  const [shoutout, setShoutout] = useState<Shoutout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyShoutout = async () => {
      try {
        const res = await fetch("/api/dailyShoutout");
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();
        setShoutout(data);
      } catch (error) {
        console.error("Failed to fetch daily shoutout:", error);
        setShoutout({
          name: "Error",
          description: "Could not fetch today's shoutout.",
          image: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailyShoutout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-[#f1f1f1] text-[#242424] dark:bg-[#222] dark:text-[#fff]">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-[#7def9f] dark:text-[#60c87f]">
          Shoutout of the Day
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Celebrate a person each day!
        </p>
      </header>

      {loading && <p className="text-gray-500 dark:text-gray-300">Loading...</p>}

      {shoutout && (
        <div className="bg-[#fff] dark:bg-[#242424] rounded-xl shadow-lg p-6 w-full max-w-sm text-center flex flex-col items-center gap-4">
          {shoutout.image && (
            <img
              src={shoutout.image}
              alt={shoutout.name}
              className="w-auto h-25 rounded-full object-cover border-4 border-[#7def9f] dark:border-[#60c87f]"
            />
          )}
          <h2 className="text-2xl font-bold text-[#222] dark:text-[#fff]">
            {shoutout.name}
          </h2>
          <p className="text-sm text-[#242424] dark:text-gray-300">
            {shoutout.description}
          </p>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(shoutout.name)}`}
            target="_blank"
            className="mt-2 inline-block px-4 py-2 bg-[#7def9f] dark:bg-[#60c87f] text-[#222] dark:text-[#fff] rounded-lg font-medium hover:brightness-90 transition"
          >
            Learn More
          </a>
        </div>
      )}

      <footer className="mt-auto text-center text-xs text-gray-500 dark:text-gray-400 pt-8">
        &copy; {new Date().getFullYear()} Daily shoutout app. All rights reserved. All images from Wikipedia.
      </footer>
    </div>
  );
}
