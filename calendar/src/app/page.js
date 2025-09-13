"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Clock,
  LogOut,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  increment,
} from "firebase/firestore";
import Leaderboard from "../components/Leaderboard";
import CompleteEventModal from "../components/CompleteEventModal";

export default function CalendarApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [eventToComplete, setEventToComplete] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load events from Firestore
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("userId", "==", user.uid),
      orderBy("date")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = {};
        snapshot.forEach((doc) => {
          const event = { id: doc.id, ...doc.data() };
          const dateKey = event.date;
          if (!eventsData[dateKey]) {
            eventsData[dateKey] = [];
          }
          eventsData[dateKey].push(event);
        });
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading events:", error);
        setError("Failed to load events. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    const dateKey = formatDateKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day,
      dateKey,
    });
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !eventTitle.trim() || !user) return;

    try {
      setError("");
      const { dateKey } = selectedDate;

      await addDoc(collection(db, "events"), {
        title: eventTitle.trim(),
        time: eventTime,
        date: dateKey,
        createdAt: new Date(),
        userId: user.uid,
        completed: false,
      });

      setEventTitle("");
      setEventTime("");
      setShowEventModal(false);
    } catch (error) {
      console.error("Error adding event:", error);
      setError("Failed to add event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setError("");
      await deleteDoc(doc(db, "events", eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
    }
  };

  const handleCompleteEvent = async (category) => {
    if (!eventToComplete || !user) return;

    try {
      setError("");
      const eventRef = doc(db, "events", eventToComplete.id);
      await updateDoc(eventRef, {
        completed: true,
      });

      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        [category]: increment(1),
        score: increment(1),
      });

      setShowCompleteModal(false);
      setEventToComplete(null);
    } catch (error) {
      console.error("Error completing event:", error);
      setError("Failed to complete event. Please try again.");
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-28 border border-gray-100 bg-gray-50/30"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = events[dateKey] || [];
      const completedCount = dayEvents.filter((e) => e.completed).length;
      const totalCount = dayEvents.length;
      const isSelectedDate =
        selectedDate &&
        selectedDate.day === day &&
        selectedDate.month === currentDate.getMonth() &&
        selectedDate.year === currentDate.getFullYear();
      const isTodayDate = isToday(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

      days.push(
        <div
          key={day}
          className={`h-28 border border-gray-100 p-2 cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg relative group ${
            isSelectedDate
              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-lg ring-2 ring-green-200"
              : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-green-50"
          } ${
            isTodayDate
              ? "bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md ring-2 ring-green-300"
              : "bg-white"
          }`}
          onClick={() => handleDateClick(day)}
        >
          {/* Sparkle effect for today */}
          {isTodayDate && (
            <Sparkles
              className="absolute top-1 right-1 text-green-600 animate-pulse"
              size={12}
            />
          )}

          <div
            className={`text-sm font-bold mb-2 flex items-center justify-between ${
              isTodayDate
                ? "text-green-800"
                : isSelectedDate
                ? "text-green-800"
                : "text-gray-700"
            }`}
          >
            <span>{day}</span>
            {totalCount > 0 && (
              <div className="flex items-center gap-1">
                {completedCount === totalCount && totalCount > 0 && (
                  <Star className="text-green-500" size={12} />
                )}
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                  {completedCount}/{totalCount}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-2 py-1 rounded-full truncate transition-all duration-200 ${
                  event.completed
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gradient-to-r from-green-800 to-green-700 text-white shadow-sm"
                }`}
              >
                <div className="flex items-center gap-1">
                  {event.completed && <CheckCircle2 size={10} />}
                  <span>
                    {event.time && `${event.time} `}
                    {event.title}
                  </span>
                </div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full text-center">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative">
            <Calendar
              className="mx-auto mb-6 text-white animate-spin"
              size={64}
            />
            <Sparkles
              className="absolute top-0 right-0 text-white animate-pulse"
              size={24}
            />
          </div>
          <div className="text-xl font-medium">
            Loading your magical calendar...
          </div>
          <div className="text-sm text-green-200 mt-2">
            ✨ Preparing something beautiful
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-300 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="text-white hover:text-red-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 mb-8 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/5 to-green-800/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="text-green-800" size={40} />
                  <Sparkles
                    className="absolute -top-1 -right-1 text-green-600 animate-pulse"
                    size={16}
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-green-700 bg-clip-text text-transparent">
                    My Calendar
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Welcome back, {user?.email?.split("@")[0]} ✨
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-3 hover:bg-green-100 rounded-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-md group"
                >
                  <ChevronLeft
                    size={24}
                    className="text-green-800 group-hover:text-green-700"
                  />
                </button>

                <div className="bg-gradient-to-r from-green-800 to-green-700 text-white px-6 py-3 rounded-2xl shadow-lg">
                  <h2 className="text-xl font-bold text-center min-w-[220px]">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-3 hover:bg-green-100 rounded-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-md group"
                >
                  <ChevronRight
                    size={24}
                    className="text-green-800 group-hover:text-green-700"
                  />
                </button>

                <button
                  onClick={signOut}
                  className="p-3 hover:bg-red-100 rounded-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-md group ml-4"
                >
                  <LogOut
                    size={24}
                    className="text-red-500 group-hover:text-red-600"
                  />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-bold text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar Grid */}
          <div className="xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="grid grid-cols-7 gap-2 p-6">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="transform hover:scale-105 transition-all duration-300">
              <Leaderboard />
            </div>

            {/* Add Event Button */}
            <button
              onClick={() => setShowEventModal(true)}
              disabled={!selectedDate}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedDate
                  ? "bg-gradient-to-r from-green-800 to-green-700 text-white hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Plus size={24} />
              Add Event
              {selectedDate && <Sparkles size={20} className="animate-pulse" />}
            </button>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-300">
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="text-green-600" size={20} />
                  {months[selectedDate.month]} {selectedDate.day},{" "}
                  {selectedDate.year}
                </h3>
                <div className="space-y-3">
                  {events[selectedDate.dateKey]?.length > 0 ? (
                    events[selectedDate.dateKey].map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-start justify-between p-4 rounded-2xl transition-all duration-200 hover:shadow-md ${
                          event.completed
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                            : "bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={event.completed || false}
                            onChange={() => {
                              if (!event.completed) {
                                setEventToComplete(event);
                                setShowCompleteModal(true);
                              }
                            }}
                            className="h-6 w-6 rounded-lg text-green-800 focus:ring-green-700 border-2 border-gray-300 transition-all duration-200"
                            disabled={event.completed}
                          />
                          <div>
                            <div
                              className={`font-bold text-lg ${
                                event.completed
                                  ? "text-green-700 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {event.title}
                            </div>
                            {event.time && (
                              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <Clock size={16} />
                                {event.time}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-xl transition-all duration-200"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar
                        className="mx-auto mb-3 text-gray-300"
                        size={48}
                      />
                      <p className="text-gray-500 font-medium">
                        No events for this date
                      </p>
                      <p className="text-sm text-gray-400">
                        Click "Add Event" to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedDate && (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 text-center">
                <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-gray-500 font-medium text-lg">
                  Select a date
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Choose any day to view or add events
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform scale-100 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-800 to-green-700 bg-clip-text text-transparent">
                  ✨ Add New Event
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="What's on your agenda? 🎯"
                    onKeyPress={(e) => e.key === "Enter" && handleAddEvent()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 transition-all duration-200 text-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-800 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  Add Event ✨
                </button>
              </div>
            </div>
          </div>
        )}

        <CompleteEventModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setEventToComplete(null);
          }}
          onComplete={handleCompleteEvent}
        />
      </div>
    </div>
  );
}
