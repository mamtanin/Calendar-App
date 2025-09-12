"use client";

import React from "react";

// Example leaderboard data
const sampleData = [
  { name: "Alice", score: 120 },
  { name: "Bob", score: 95 },
  { name: "Charlie", score: 80 },
];

export default function Leaderboard({ data = sampleData }) {
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Leaderboard</h2>
      <ul>
        {data
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .map((player, index) => (
            <li
              key={player.name}
              className="flex justify-between p-2 border-b last:border-none"
            >
              <span>
                {index + 1}. {player.name}
              </span>
              <span className="font-semibold">{player.score}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
