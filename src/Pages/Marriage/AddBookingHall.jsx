


import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaEye, FaPlus, FaUser, FaPhone, FaRupeeSign, FaBuilding, FaClock } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import Button from "../../Components/Form/Button";
import BackButton from "../../Components/Button/BackButton";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import CharCounter from "../../Components/Form/CharCounter";
import axios from "axios";
import 'react-calendar/dist/Calendar.css';
import Calendar from './Calendar';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export const AddBookingHall = () => {
  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [calendarDate, setCalendarDate] = useState(null);
  const [selected, setSelected] = useState({ morning: false, evening: false });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [bookingStatus, setBookingStatus] = useState("Reserved");
  const [hallBookings, setHallBookings] = useState([]);
  const [advanceError, setAdvanceError] = useState("");
  const [selectedDayBookings, setSelectedDayBookings] = useState([]);
  const token = window.sessionStorage.getItem("token");

  const { saving, startSaving, stopSaving } = useSaving();
  useBlockRefresh(saving);

  const { errors, showError } = useTemporaryError();
  const [Response, setResponse] = useState({ status: null, message: "" });
  const limit = 10;

  // fetch halls on mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${URL}/marriage/halls`, {
          headers: { Authorization: token },
        });
        setHalls(res.data.data || []);
      } catch (err) {
        console.error("Error fetching halls:", err);
      }
    };
    fetchHalls();
  }, [token]);



  useEffect(() => {
  if (calendarDate) {
    setSelected({ morning: false, evening: false });
  }
}, [calendarDate]);

  // when hall changes, load its categories and bookings
  useEffect(() => {
    const hall = halls.find((h) => h._id === selectedHallId);
    if (hall) {
      setCategories(hall.categoryPrices || []);
      setSelectedCategoryId("");
      setAmount("");
    } else {
      setCategories([]);
      setSelectedCategoryId("");
      setAmount("");
    }

    // fetch bookings for selected hall (for availability)
    if (!selectedHallId) {
      setHallBookings([]);
      return;
    }

    const fetchHallBookings = async () => {
      try {
        const res = await axios.get(`${URL}/marriage/bookings?hallId=${selectedHallId}&limit=1000`, {
          headers: { Authorization: token },
        });
        setHallBookings(res.data.data || []);
      } catch (err) {
        console.error("Error fetching hall bookings:", err);
      }
    };

    fetchHallBookings();
  }, [selectedHallId, halls, token]);

  // set amount automatically when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setAmount("");
      return;
    }
    const categoryObj = categories.find((c) => c.category._id === selectedCategoryId);
    if (categoryObj) setAmount(categoryObj.price ?? "");
    else setAmount("");
  }, [selectedCategoryId, categories]);


  const handleSelect = (date) => {
    const bookings = hallBookings.filter(
      (b) =>
        (!selectedHallId || b.hall?._id === selectedHallId) &&
        dayjs(b.date).format("YYYY-MM-DD") ===
        dayjs(date).format("YYYY-MM-DD")
    );

    onSelect(date.toDate(), bookings);
  };

  useEffect(() => {
    if (!calendarDate || !hallBookings.length) return;

    const bookings = hallBookings.filter(
      (b) =>
        (!selectedHallId || b.hall?._id === selectedHallId) &&
        dayjs(b.date).format("YYYY-MM-DD") ===
        dayjs(calendarDate).format("YYYY-MM-DD")
    );

    setSelectedDayBookings(bookings);
  }, [calendarDate, hallBookings, selectedHallId]);


  // helper: normalize to YYYY-MM-DD
  const dayStr = (d) => (d ? new Date(d).toISOString().split("T")[0] : null);

  // compute day-specific bookings (ignore cancelled bookings)
  const dayBookings = calendarDate && hallBookings.length
    ? hallBookings.filter(
      (b) =>
        dayStr(b.date) === dayStr(calendarDate) &&
        b.booking_status !== "Cancelled"
    )
    : [];

  const morningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("morning"));
  const eveningAvailable = !dayBookings.some((b) => (b.sessions || []).includes("evening"));

  // toggle session
  const toggle = (time) => {
    setSelected((prev) => ({ ...prev, [time]: !prev[time] }));
  };

  // reset form
  const resetForm = () => {
    setSelectedHallId("");
    setSelectedCategoryId("");
    setCalendarDate(null);
    setCustomerName("");
    setCustomerPhone("");
    setAmount("");
    setAdvanceAmount("");
    setBookingStatus("");
    setSelected({ morning: false, evening: false });
  };


  const handleBooking = async () => {

    // ✅ basic validation (recommended)
    if (!customerName.trim()) {
      showError("customerName", "Customer name required");
      return;
    }

    if (!customerPhone || customerPhone.length !== 10) {
      showError("customerPhone", "Valid 10-digit phone required");
      return;
    }

    if (!selectedHallId || !selectedCategoryId || !calendarDate) {
      setResponse({
        status: "Failed",
        message: "Please fill all required fields",
      });
      return;
    }

    if (saving) return; // 🚫 prevent double click

    const sessions = ["morning", "evening"].filter((s) => selected[s]);

    const payload = {
      hall: selectedHallId,
      category: selectedCategoryId,
      date: dayjs(calendarDate).format("YYYY-MM-DD"),
      sessions,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      advanceAmount: Number(advanceAmount || 0),
      booking_status: bookingStatus,
      amount: Number(amount || 0),
    };

    try {
      startSaving(); // 🔥 START

      const res = await axios.post(`${URL}/marriage/bookings`, payload, {
        headers: { Authorization: token },
      });

      // ✅ instant UI update (unchanged)
      setHallBookings((prev) => [
        ...prev,
        {
          hall: { _id: selectedHallId },
          date: dayjs(calendarDate).format("YYYY-MM-DD"),
          sessions,
          booking_status: bookingStatus,
        },
      ]);

      setResponse({
        status: "Success",
        message: res.data?.message || "Booking created successfully",
      });

      resetForm();

      setTimeout(() => {
        navigate("/admin/marriage/booking-hall");
      }, 800);

    } catch (err) {
      console.error("Error creating booking:", err);

      let errorMessage = "Something went wrong";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data);
      } else if (err.request) {
        errorMessage = "Server not responding. Please try again.";
      } else {
        errorMessage = err.message;
      }

      setResponse({
        status: "Failed",
        message: errorMessage,
      });

    } finally {
      stopSaving(); // 🔥 STOP
    }
  };

  return (
    <>
      <BackButton />
      <div className="p-4  mt-3 bg-white shadow-md rounded-[10px] mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">



            <h1 className="text-xl font-bold text-lavender--600 whitespace-nowrap">
              Add Hall Booking
            </h1>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>

              <RequiredLabel>Select Hall</RequiredLabel>
              <select
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select a Hall</option>
                {halls.map((hall) => (
                  <option key={hall._id} value={hall._id}>
                    {hall.hall_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>

              <RequiredLabel>Hall Category</RequiredLabel>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled={!categories.length}
              >
                <option value="">Select Category </option>
                {categories.map((c) => (
                  <option key={c.category._id} value={c.category._id}>
                    {c.category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>

              <RequiredLabel>Amount</RequiredLabel>
              <input
                type="text"
                value={amount}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm "
              />
            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-3">


            <div>

              <RequiredLabel>Booking Date</RequiredLabel>
              <input
                type="date"
                value={calendarDate ? dayjs(calendarDate).format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setCalendarDate(dayjs(e.target.value).startOf("day").toDate());
                  } else {
                    setCalendarDate(null);
                  }
                }}
                className="block w-full  mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>


            <div>

              <RequiredLabel>Booking Session</RequiredLabel>
              <div className="flex justify-center w-full">

                <div className="flex justify-start mt-1">
                  <div className="inline-flex bg-gray-100 p-1 rounded-full shadow-sm">

                    <button
                      disabled={!morningAvailable}
                      onClick={() => toggle("morning")}
                      className={`px-12 py-1 text-sm font-medium rounded-full transition-all duration-200
        ${selected.morning
                          ? "bg-lavender--600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-200"}
        ${!morningAvailable && "opacity-40 cursor-not-allowed"}
      `}
                    >
                      Morning
                    </button>

                    <button
                      disabled={!eveningAvailable}
                      onClick={() => toggle("evening")}
                      className={`px-12 py-1 text-sm font-medium rounded-full transition-all duration-200
        ${selected.evening
                          ? "bg-lavender--600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-200"}
        ${!eveningAvailable && "opacity-40 cursor-not-allowed"}
      `}
                    >
                      Evening
                    </button>

                  </div>
                </div>
              </div>
            </div>

          </div>



          <div className="w-full mt-4 flex justify-center">
            <div className="w-full ">
              <Calendar
                hallBookings={hallBookings}
                selectedHallId={selectedHallId}
                selectedDate={calendarDate}
                selectedSessions={selected}              // ✅ ADD
                setSelectedSessions={setSelected}        // ✅ ADD
                onSelect={(date) => {
                  setCalendarDate(date);
                }}
              />
            </div>




          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end mt-4">
            <div className="relative">
              <RequiredLabel>Customer Name</RequiredLabel>

              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  const val = e.target.value;

                  // 🔥 only letters + space (optional strict validation)
                  if (!/^[a-zA-Z\s]*$/.test(val)) {
                    showError("customerName", "Only letters allowed");
                    return;
                  }

                  // 🔥 max length check
                  if (!validateMaxLength("customerName", val, 50, showError)) return;

                  setCustomerName(val);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Enter customer name"
              />

              <CharCounter value={customerName} max={50} show />
              {/* 
              {errors.customerName && (
                <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
              )} */}
            </div>

            <div>

              <RequiredLabel>Customer Phone</RequiredLabel>
              <input
                type="text"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setCustomerPhone(v);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Enter 10-digit"
              />
            </div>

            <input type="hidden" name="payment_status" value="Unpaid" />

            <div>

              <RequiredLabel> Advance Amount</RequiredLabel>
              <input
                type="number"
                min={0}
                value={advanceAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);

                  if (v > Number(amount)) {
                    setAdvanceError("Advance amount cannot exceed total amount.");
                    setAdvanceAmount(amount);
                  } else {
                    setAdvanceError("");
                    setAdvanceAmount(v);
                  }
                }}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm 
      ${advanceError ? "border-red-500" : "border-gray-300"}`}
              />

              {/* {advanceError && (
                <p className="text-red-600 text-xs mt-1">{advanceError}</p>
              )} */}
            </div>


            <input type="hidden" value="Reserved" />

          </div>

          <div className="flex justify-end gap-3 mt-6">


            <Button
              saving={saving}
              type="save"
              onClick={handleBooking}
              buttonType="button"
            />
          </div>
        </div>

        {Response.status && (
          Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          )
        )}
      </div>
    </>
  )
}
