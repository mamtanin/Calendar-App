"use client";

import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Trophy, Medal, Award, Crown, Users, TrendingUp } from "lucide-react";

const sampleData = [
  { id: "1", name: "Alice", score: 1250, avatar: "👩‍💼", streak: 7 },
  { id: "2", name: "Bob", score: 1180, avatar: "👨‍💻", streak: 4 },
  { id: "3", name: "Charlie", score: 1050, avatar: "👨‍🎨", streak: 12 },
  { id: "4", name: "Diana", score: 980, avatar: "👩‍🔬", streak: 3 },
  { id: "5", name: "Eve", score: 920, avatar: "👩‍🎓", streak: 8 },
];

export default function Leaderboard() {
  const [profiles, setProfiles] = useState(sampleData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("score");

  useEffect(() => {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, orderBy(filter, "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setProfiles(sampleData);
        } else {
          const profilesData = [];
          snapshot.forEach((doc) => {
            profilesData.push({ id: doc.id, ...doc.data() });
          });
          setProfiles(profilesData);
        }
        setLoading(false);
        setError("");
      },
      (error) => {
        console.error("Error loading profiles:", error);
        setProfiles(sampleData);
        setError("Using sample data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={18} />;
      case 3:
        return <Award className="text-amber-600" size={16} />;
      default:
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {rank}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-green-800" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={14} className="mr-1" />
            {profiles.length}
          </div>
        </div>
        {error && (
          <div className="text-xs text-blue-600 mt-1">{error}</div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => setFilter("score")} className={`px-2 py-1 text-xs rounded-md ${filter === 'score' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Overall</button>
          <button onClick={() => setFilter("punctual")} className={`px-2 py-1 text-xs rounded-md ${filter === 'punctual' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Punctual</button>
          <button onClick={() => setFilter("academicWarrior")} className={`px-2 py-1 text-xs rounded-md ${filter === 'academicWarrior' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Academic</button>
          <button onClick={() => setFilter("athleticFreak")} className={`px-2 py-1 text-xs rounded-md ${filter === 'athleticFreak' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Athletic</button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 space-y-3">
        {profiles.slice(0, 5).map((player, index) => {
          const rank = index + 1;
          return (
            <div
              key={player.id || player.name}
              className="flex items-center justify-between transition-all duration-200 ease-in-out"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 text-center">{getRankIcon(rank)}</div>
                <div className="text-lg">{player.avatar || "👤"}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {player.name}
                  </h3>
                  {player.streak > 0 && (
                    <div className="flex items-center text-orange-500 text-xs">
                      <TrendingUp size={12} className="mr-0.5" />
                      {player.streak} day streak
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-800 text-md">
                  {player[filter]?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}