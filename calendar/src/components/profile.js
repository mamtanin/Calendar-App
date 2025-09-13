"use client";

import React from "react";

// Simple SVG Stick Figures for each stage
const StickFigures = {
  basic: (
    <svg viewBox="0 0 100 120" className="w-32 h-32 mx-auto">
      {/* Head */}
      <circle
        cx="50"
        cy="15"
        r="8"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
      {/* Body */}
      <line x1="50" y1="23" x2="50" y2="70" stroke="black" strokeWidth="2" />
      {/* Arms */}
      <line x1="50" y1="35" x2="35" y2="50" stroke="black" strokeWidth="2" />
      <line x1="50" y1="35" x2="65" y2="50" stroke="black" strokeWidth="2" />
      {/* Legs */}
      <line x1="50" y1="70" x2="35" y2="100" stroke="black" strokeWidth="2" />
      <line x1="50" y1="70" x2="65" y2="100" stroke="black" strokeWidth="2" />
    </svg>
  ),
  knife: (
    <svg viewBox="0 0 100 120" className="w-32 h-32 mx-auto">
      {/* Head */}
      <circle
        cx="50"
        cy="15"
        r="8"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
      {/* Body */}
      <line x1="50" y1="23" x2="50" y2="70" stroke="black" strokeWidth="2" />
      {/* Arms */}
      <line x1="50" y1="35" x2="35" y2="50" stroke="black" strokeWidth="2" />
      <line x1="50" y1="35" x2="65" y2="50" stroke="black" strokeWidth="2" />
      {/* Legs */}
      <line x1="50" y1="70" x2="35" y2="100" stroke="black" strokeWidth="2" />
      <line x1="50" y1="70" x2="65" y2="100" stroke="black" strokeWidth="2" />
      {/* Knife in right hand */}
      <line x1="65" y1="50" x2="75" y2="45" stroke="brown" strokeWidth="2" />
      <line x1="75" y1="45" x2="80" y2="35" stroke="silver" strokeWidth="2" />
    </svg>
  ),
  sword: (
    <svg viewBox="0 0 100 120" className="w-32 h-32 mx-auto">
      {/* Head */}
      <circle
        cx="50"
        cy="15"
        r="8"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
      {/* Body */}
      <line x1="50" y1="23" x2="50" y2="70" stroke="black" strokeWidth="2" />
      {/* Arms */}
      <line x1="50" y1="35" x2="35" y2="50" stroke="black" strokeWidth="2" />
      <line x1="50" y1="35" x2="65" y2="50" stroke="black" strokeWidth="2" />
      {/* Legs */}
      <line x1="50" y1="70" x2="35" y2="100" stroke="black" strokeWidth="2" />
      <line x1="50" y1="70" x2="65" y2="100" stroke="black" strokeWidth="2" />
      {/* Sword in right hand */}
      <line x1="65" y1="50" x2="75" y2="40" stroke="brown" strokeWidth="3" />
      <line x1="75" y1="40" x2="85" y2="15" stroke="silver" strokeWidth="3" />
      <line x1="72" y1="40" x2="78" y2="40" stroke="gold" strokeWidth="2" />
    </svg>
  ),
  axe: (
    <svg viewBox="0 0 100 120" className="w-32 h-32 mx-auto">
      {/* Head */}
      <circle
        cx="50"
        cy="15"
        r="8"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
      {/* Body */}
      <line x1="50" y1="23" x2="50" y2="70" stroke="black" strokeWidth="2" />
      {/* Arms */}
      <line x1="50" y1="35" x2="35" y2="50" stroke="black" strokeWidth="2" />
      <line x1="50" y1="35" x2="65" y2="50" stroke="black" strokeWidth="2" />
      {/* Legs */}
      <line x1="50" y1="70" x2="35" y2="100" stroke="black" strokeWidth="2" />
      <line x1="50" y1="70" x2="65" y2="100" stroke="black" strokeWidth="2" />
      {/* Axe in right hand */}
      <line x1="65" y1="50" x2="75" y2="25" stroke="brown" strokeWidth="3" />
      <path
        d="M75 25 L85 20 L85 30 Z"
        fill="silver"
        stroke="black"
        strokeWidth="1"
      />
      <path
        d="M75 25 L70 20 L70 30 Z"
        fill="silver"
        stroke="black"
        strokeWidth="1"
      />
    </svg>
  ),
};

export default function Profile({ profile }) {
  const totalScore = profile?.score || 0;
  const level = totalScore; // 1 point per level

  // Determine current stage based on level
  const getCurrentStage = () => {
    if (level >= 15) return "axe";
    if (level >= 10) return "sword";
    if (level >= 5) return "knife";
    return "basic";
  };

  const getStageTitle = () => {
    const stage = getCurrentStage();
    const titles = {
      basic: "Novice Stick Figure",
      knife: "Knife Wielder",
      sword: "Sword Master",
      axe: "Axe Champion",
    };
    return titles[stage];
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Character</h2>

      {/* Character Display */}
      <div className="mb-6">
        <div className="mb-2">{StickFigures[getCurrentStage()]}</div>
        <h3 className="text-lg font-semibold text-gray-800">
          {getStageTitle()}
        </h3>
        <div className="text-sm text-gray-600 mt-2">
          <p>Level: {level}</p>
          <p>Total Score: {totalScore}</p>
        </div>
      </div>

      {/* Stage Progress Indicator */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Stage Progress:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className={level >= 0 ? "text-green-600 font-medium" : ""}>
            ⚪ Level 0-4: Basic Stick Figure
          </div>
          <div className={level >= 5 ? "text-green-600 font-medium" : ""}>
            🗡️ Level 5-9: Knife Wielder
          </div>
          <div className={level >= 10 ? "text-green-600 font-medium" : ""}>
            ⚔️ Level 10-14: Sword Master
          </div>
          <div className={level >= 15 ? "text-green-600 font-medium" : ""}>
            🪓 Level 15+: Axe Champion
          </div>
        </div>
      </div>
    </div>
  );
}
