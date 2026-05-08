import React, { useState, useEffect } from "react";

import dayjs from "dayjs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";


const Calendar = ({
  hallBookings = [],
  selectedHallId,
  onSelect,
  selectedDate,
  editingId,
  selectedSessions,
  setSelectedSessions
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());


  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(dayjs(selectedDate));
    }
  }, [selectedDate]);



  // Calendar structure
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day();



  const toggleSession = (type, available) => {
    if (!available) return;

    setSelectedSessions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSelect = (date) => {
    const bookings = hallBookings.filter(
      (b) =>
        (!selectedHallId || b.hall?._id === selectedHallId) &&
        dayjs(b.date).format("YYYY-MM-DD") ===
        dayjs(date).format("YYYY-MM-DD")
    );

    onSelect(date.toDate(), bookings);
  };

  const renderDay = (day) => {
    const date = startOfMonth.date(day);

    const isSelected =
      selectedDate &&
      date.format("YYYY-MM-DD") === dayjs(selectedDate).format("YYYY-MM-DD");

    // const dayBookings = hallBookings.filter(
    //   (b) =>
    //     (!selectedHallId || b.hall?._id === selectedHallId) &&
    //     dayjs(b.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    // );



    const dayBookings = hallBookings.filter(
      (b) =>
        b._id !== editingId && // 🔥 THIS LINE FIXES YOUR ISSUE
        (!selectedHallId || b.hall?._id === selectedHallId) &&
        dayjs(b.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );


    const currentBooking = hallBookings.find(
      (b) =>
        b._id === editingId &&
        dayjs(b.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );

    const morningAvailable = !dayBookings.some((b) =>
      b.sessions?.includes("morning")
    );

    const eveningAvailable = !dayBookings.some((b) =>
      b.sessions?.includes("evening")
    );

    return (
      <div
        key={day}
        className={`relative aspect-square border rounded-lg overflow-hidden
  ${isSelected ? "ring-2 ring-green-500" : ""}`}
      >

        {/* Morning */}
        <div
          onClick={() => {
            handleSelect(date);
            toggleSession("morning", morningAvailable);
          }}
          className={`absolute top-0 left-0 w-full h-1/2 flex items-center justify-center text-xs font-medium
${isSelected
              ? selectedSessions?.morning
                ? "bg-red-100 text-red-700 cursor-pointer"   // ✅ ONLY ADD THIS
                : currentBooking?.sessions?.includes("morning")
                  ? "bg-red-100 text-red-700 cursor-pointer"
                  : morningAvailable
                    ? "bg-green-100 text-green-700 cursor-pointer"
                    : "bg-red-100 text-red-700 cursor-not-allowed"
              : "bg-green-100 text-green-700 cursor-pointer"
            }
`}
        >
          M
        </div>

        {/* Evening */}
        <div
          onClick={() => {
            handleSelect(date);
            toggleSession("evening", eveningAvailable);
          }}
          className={`absolute bottom-0 left-0 w-full h-1/2 flex items-center justify-center text-xs font-medium
${isSelected
              ? selectedSessions?.evening
                ? "bg-red-100 text-red-700 cursor-pointer"   
                : currentBooking?.sessions?.includes("evening")
                  ? "bg-red-100 text-red-700 cursor-pointer"
                  : eveningAvailable
                    ? "bg-green-100 text-green-700 cursor-pointer"
                    : "bg-red-100 text-red-700 cursor-not-allowed"
              : "bg-green-100 text-green-700 cursor-pointer"
            }
`}
        >
          E
        </div>

        {/* Date */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-semibold pointer-events-none">
          {day}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button
          title="Previous Month"
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <IoIosArrowBack />
        </button>
        <h2 className="font-semibold text-base text-gray-800">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          title="Next Month"
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <IoIosArrowForward />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Blank days before month start */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </div>
    </div>
  );
};

export default Calendar;
