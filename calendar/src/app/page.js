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
} from "firebase/firestore";
import Leaderboard from "../components/Leaderboard";

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
    const q = query(eventsRef, where("userId", "==", user.uid), orderBy("date"));

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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = events[dateKey] || [];
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
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelectedDate ? "bg-blue-100 border-blue-300" : ""
          } ${isTodayDate ? "bg-yellow-50 border-yellow-300" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isTodayDate ? "text-yellow-800" : "text-gray-700"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate"
              >
                {event.time && `${event.time} `}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 text-blue-600 animate-spin" size={48} />
          <div className="text-lg font-medium text-gray-900">
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right text-red-700 hover:text-red-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="text-blue-600" size={32} />
              My Calendar
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={signOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0 mb-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-medium text-gray-600 bg-gray-100 border border-gray-200"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Leaderboard />
            <button
              onClick={() => setShowEventModal(true)}
              disabled={!selectedDate}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedDate
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={20} />
              Add Event
            </button>

            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {months[selectedDate.month]} {selectedDate.day}, {selectedDate.year}
                </h3>
                <div className="space-y-2">
                  {events[selectedDate.dateKey]?.length > 0 ? (
                    events[selectedDate.dateKey].map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {event.title}
                          </div>
                          {event.time && (
                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Clock size={14} />
                              {event.time}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No events for this date
                    </p>
                  )}
                </div>
              </div>
            )}

            {!selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-gray-500 text-sm">
                  Select a date to view or add events
                </p>
              </div>
            )}
          </div>
        </div>

        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                    onKeyPress={(e) => e.key === "Enter" && handleAddEvent()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}