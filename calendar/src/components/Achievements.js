"use client";

import { Award } from 'lucide-react';

const achievementTiers = {
  punctual: [
    { name: "Punctual Novice", threshold: 1, icon: "🥉" },
    { name: "Punctual Apprentice", threshold: 5, icon: "🥈" },
    { name: "Punctual Master", threshold: 10, icon: "🥇" },
    { name: "Punctual Grandmaster", threshold: 25, icon: "🌟" },
    { name: "Punctual Legend", threshold: 50, icon: "🏆" },
  ],
  academicWarrior: [
    { name: "Academic Explorer", threshold: 1, icon: "📚" },
    { name: "Academic Scholar", threshold: 5, icon: "🎓" },
    { name: "Academic Legend", threshold: 10, icon: "🌟" },
    { name: "Academic Sage", threshold: 25, icon: "🦉" },
    { name: "Academic Oracle", threshold: 50, icon: "📜" },
  ],
  athleticFreak: [
    { name: "Athletic Starter", threshold: 1, icon: "👟" },
    { name: "Athletic Enthusiast", threshold: 5, icon: "💪" },
    { name: "Athletic Champion", threshold: 10, icon: "🏆" },
    { name: "Athletic Titan", threshold: 25, icon: "🏋️" },
    { name: "Athletic God", threshold: 50, icon: "⚡" },
  ],
};

export default function Achievements({ profile }) {
  const achievementsProgress = [];

  if (profile) {
    for (const category in achievementTiers) {
      const userScore = profile[category] || 0;
      const tiers = achievementTiers[category];

      let nextAchievement = null;
      let currentAchievement = null;

      for (let i = 0; i < tiers.length; i++) {
        if (userScore >= tiers[i].threshold) {
          currentAchievement = { ...tiers[i], category };
        } else {
          nextAchievement = { ...tiers[i], category };
          break;
        }
      }

      achievementsProgress.push({
        category,
        userScore,
        currentAchievement,
        nextAchievement,
      });
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
      <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
        <Award className="text-green-600" size={20} />
        Achievements
      </h3>
      <div className="space-y-4">
        {achievementsProgress.length > 0 ? (
          achievementsProgress.map((progress, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">
                {progress.category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              {progress.currentAchievement && (
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-xl">{progress.currentAchievement.icon}</span>
                  <p className="text-sm">Unlocked: {progress.currentAchievement.name}</p>
                </div>
              )}
              {progress.nextAchievement ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Next: {progress.nextAchievement.name} ({progress.userScore} / {progress.nextAchievement.threshold})
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(progress.userScore / progress.nextAchievement.threshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">All achievements unlocked in this category!</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Complete events to unlock achievements!</p>
        )}
      </div>
    </div>
  );
}
