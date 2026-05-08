


import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { URL } from "../../App";
import BooingSlotModel from "./BooingSlotModel";
import { useForm } from 'react-hook-form';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from '../../Components/Helpers/Pagination';
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";



export const BookSlots = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [cemetery, setCemetery] = useState([]);
  const [search, setSearch] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [selectedCemetery, setSelectedCemetery] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownByName, setDropdownByName] = useState([]);
  const [isMember, setIsMember] = useState(true);
  const [burialType, setBurialType] = useState({});
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [Response, setResponse] = useState({ status: "", message: "" });
  const [burialNames, setBurialNames] = useState({});
  const [burialDates, setBurialDates] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const { saving, startSaving, stopSaving } = useSaving();
  useBlockRefresh(saving);

  const { errors, showError } = useTemporaryError();


  const [buriedPersonIdSearch, setBuriedPersonIdSearch] = useState({});
  const [buriedPersonNameSearch, setBuriedPersonNameSearch] = useState({});
  const [buriedDropdownByName, setBuriedDropdownByName] = useState({});
  const [buriedDropdownById, setBuriedDropdownById] = useState({});
  const [buriedMemberObjectId, setBuriedMemberObjectId] = useState({});

  const [activePopover, setActivePopover] = useState(null);

  const [viewMode, setViewMode] = useState("reservation");

  const popoverRef = useRef(null);



  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const slotPersons = bookedSlots.filter(
    (b) =>
      selectedSlots.includes(b.slotId) &&
      b.cemeteryId?.toString() === selectedCemetery?._id?.toString()
  );



  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownById(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownById([
            { member_id: "none", member_name: "No members found", mobile_number: "" }
          ]);
        } else {
          setDropdownById([]);
        }
      }
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownByName([
            { member_id: "none", member_name: "No members found", mobile_number: "" }
          ]);
        } else {
          setDropdownByName([]);
        }
      }
    }, 300)
  ).current;


  const fetchCemetery = async () => {
    try {
      const res = await axios.get(
        `${URL}/cemetery?page=${CurrentPage}&limit=${rowsPerPage}&search=${search || ""}`,
        { headers: { Authorization: token } }
      );
      setCemetery(res.data.cemetery || []);

      const pages = res.data.totalPages || 1;
      setTotalPages(pages);

      if (CurrentPage > pages) {
        setCurrentPage(1);
      }

    } catch (err) {
      console.error("Error fetching cemetery", err);
    }
  };
  useEffect(() => {
    fetchCemetery();
  }, [CurrentPage, rowsPerPage, search]);


  // buried person search by ID
  const debouncedBuriedSearchById = useRef(
    debounce(async (val, slot) => {
      if (!val) {
        setBuriedDropdownById(prev => ({
          ...prev,
          [slot]: []
        }));
        return;
      }

      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });

        setBuriedDropdownById(prev => ({
          ...prev,
          [slot]: res.data || []
        }));

      } catch {
        setBuriedDropdownById(prev => ({
          ...prev,
          [slot]: []
        }));
      }
    }, 300)
  ).current;


  // buried person search by name
  const debouncedBuriedSearchByName = useRef(
    debounce(async (val, slot) => {
      if (!val) {
        setBuriedDropdownByName(prev => ({
          ...prev,
          [slot]: []
        }));
        return;
      }

      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });

        setBuriedDropdownByName(prev => ({
          ...prev,
          [slot]: res.data || []
        }));

      } catch {
        setBuriedDropdownByName(prev => ({
          ...prev,
          [slot]: []
        }));
      }
    }, 300)
  ).current;




  const handleBooking = async (data) => {
    if (!selectedCemetery || selectedSlots.length === 0) return;

    // if (saving) return;
    try {

      // startSaving();
      const payload = {
        cemeteryId: selectedCemetery._id,
        bookingMode: viewMode,

        bookingPerson: {
          isMember,
          memberId: isMember ? data.memberObjectId : null,

          nonMember: !isMember
            ? {
              name: data.nonMemberName,
              tamilName: data.nonMemberTamilName,
              gender: data.nonMemberGender,
              phone: data.nonMemberPhone,
              aadhar: data.nonMemberAadhar,
              permanentAddress: data.nonMemberPermanentAddress,
              presentAddress: data.nonMemberPresentAddress,
            }
            : null,
        },

   

        // ✅ SLOT-WISE DATA
        bookings: selectedSlots.map((slot) => ({

          slotId: slot,

          // =========================
          // BOOKING PERSON
          // =========================

          isBookingMember: isMember,

          bookingMemberId:
            isMember
              ? data.memberObjectId
              : null,

          bookingNonMember:
            !isMember
              ? {
                name: data.nonMemberName,
                tamilName: data.nonMemberTamilName,
                gender: data.nonMemberGender,
                phone: data.nonMemberPhone,
                aadhar: data.nonMemberAadhar,
                permanentAddress:
                  data.nonMemberPermanentAddress,

                presentAddress:
                  data.nonMemberPresentAddress,
              }
              : null,

          // =========================
          // BURIED PERSON
          // =========================

          buriedPersonName:
            burialNames[slot] || "",

          buriedDate:
            burialDates[slot] || null,

          isBuriedMember:
            burialType[slot] ?? true,

          buriedMemberId:
            (burialType[slot] ?? true)
              ? buriedMemberObjectId[slot] || null
              : null,
        })),
      };

   

      // =========================
      // RESERVATION
      // =========================
      if (viewMode === "reservation") {

        await axios.post(
          `${URL}/cemetery/bookings`,
          payload,
          {
            headers: {
              Authorization: token,
            },
          }
        );

      }

      // =========================
      // BURIAL
      // =========================
      else if (viewMode === "burial") {

        await axios.put(
          `${URL}/cemetery/bookings/burial`,
          payload,
          {
            headers: {
              Authorization: token,
            },
          }
        );
      }

      setResponse({
        status: "Success",
        message: "Booking successful!",
      });

      // ✅ reset
      reset();
      setIsModalOpen(false);
      setBurialNames({});
      setBurialDates({});
      setBuriedPersonIdSearch({});
      setBuriedPersonNameSearch({});
      setBuriedMemberObjectId({});
      setBuriedDropdownById({});
      setBuriedDropdownByName({});
      setSelectedSlots([]);

      await fetchCemetery();
      await fetchBookedSlots(selectedCemetery._id);

    } catch (err) {
      console.error("Booking failed", err);

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Booking failed",
      });
    }
    // finally {
    //   stopSaving();
    // }
  };


  const fetchBookedSlots = async (cemeteryId) => {
    try {
      const res = await axios.get(
        `${URL}/cemetery/bookings?cemeteryId=${cemeteryId}`,
        { headers: { Authorization: token } }
      );

      setBookedSlots(res.data.bookings || []);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setBookedSlots([]);
    }
  };
 


  useEffect(() => {

    // ONLY RESET WHEN MODAL CLOSED
    if (isModalOpen) return;

    reset();

    // member
    setMemberIdSearch("");
    setMemberNameSearch("");
    setDropdownById([]);
    setDropdownByName([]);
    setIsMember(true);

    // burial
    setBurialType({});
    setBurialNames({});
    setBurialDates({});
    setBuriedPersonIdSearch({});
    setBuriedPersonNameSearch({});
    setBuriedMemberObjectId({});
    setBuriedDropdownById({});
    setBuriedDropdownByName({});

    // IMPORTANT
    setSelectedBooking(null);

  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);







  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">


          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Cemetery Book Slots
          </h1>

          {/* Search */}
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}

                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500 ">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">S No</th>
                <th className="p-2 text-center">Cemetery Name</th>
                <th className="p-2 text-center">Location</th>
                <th className="p-2 text-center">Available Plots</th>
              </tr>
            </thead>
            <tbody>
              {cemetery.length > 0 ? (
                cemetery.map((cem, idx) => {

                  const isActive = activeRow === cem._id;

                  const dynamicAvailable = isActive
                    ? (cem.numberOfAvailablePlots || 0) - selectedSlots.length
                    : (cem.numberOfAvailablePlots || 0);


                  return (
                    <React.Fragment key={cem._id}>
                      {/* Normal row */}
                      <tr
                        className="border-t text-center hover:bg-gray-50 cursor-pointer"
                        title='View Plots'
                        onClick={async () => {
                          if (activeRow === cem._id) {
                            setActiveRow(null);
                            setSelectedSlots([]);
                          } else {
                            setActiveRow(cem._id);
                            setSelectedSlots([]);
                            setSelectedCemetery(cem);
                            await fetchBookedSlots(cem._id);
                          }
                        }}
                      >
                        <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                        <td className="p-2">{cem.cemeteryName}</td>
                        <td className="p-2">{cem.cemeteryLocation}</td>
                        {/* <td className="p-2">{cem.numberOfAvailablePlots || 0}</td> */}
                        <td className="p-2">
                          {dynamicAvailable < 0 ? 0 : dynamicAvailable}
                        </td>
                      </tr>

                      {/* Expanded row for View Slots button */}
                      {activeRow === cem._id && (
                        <tr className="">
                          <td colSpan={5} className="p-3 text-center">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();

                                if (activeRow === cem._id) {
                                  // already open → close
                                  setActiveRow(null);
                                  setSelectedCemetery(null);
                                  setSelectedSlots([]);
                                } else {
                                  // open
                                  setActiveRow(cem._id);
                                  setSelectedCemetery(cem);
                                  setSelectedSlots([]);
                                  await fetchBookedSlots(cem._id);
                                }
                              }}

                              className="px-4 py-2 text-white bg-lavender--600 rounded"
                            >
                              {activeRow === cem._id ? "Hide Plots" : "View Plots"}
                            </button>


                            <div className="flex justify-center mt-4">
                              <div className="relative flex bg-gray-200 rounded-full p-0.5 text-xs font-medium w-64 h-9">

                                {/* Active background */}
                                <div
                                  className="absolute top-0.5 bottom-0.5 left-0.5 bg-lavender--600 rounded-full transition-transform duration-300"
                                  style={{
                                    width: "calc(50% - 0.25rem)",
                                    transform:
                                      viewMode === "reservation"
                                        ? "translateX(0)"
                                        : "translateX(100%)",
                                  }}
                                />

                                {/* Reservation */}
                                <button
                                  type="button"
                                  onClick={() => {

                                    setViewMode("reservation");

                                    // reset selected slots
                                    setSelectedSlots([]);

                                    // close popup
                                    setActivePopover(null);

                                    // close modal
                                    setIsModalOpen(false);
                                  }}
                                  className={`relative flex-1 py-1 rounded-full transition
        ${viewMode === "reservation"
                                      ? "text-white"
                                      : "text-gray-700"
                                    }`}
                                >
                                  Reservation
                                </button>

                                {/* Burial */}
                                <button
                                  type="button"
                                  onClick={() => {

                                    setViewMode("burial");

                                    // reset selected slots
                                    setSelectedSlots([]);

                                    // close popup
                                    setActivePopover(null);

                                    // close modal
                                    setIsModalOpen(false);
                                  }}
                                  className={`relative flex-1 py-1 rounded-full transition
        ${viewMode === "burial"
                                      ? "text-white"
                                      : "text-gray-700"
                                    }`}
                                >
                                  Burial
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Row with slots */}
                      {activeRow === cem._id && (
                        <tr>
                          <td colSpan={5} className="p-4 bg-white relative">

                            <div className="space-y-3">
                              {cem.plots?.map((row, rowIdx) => (
                                <div key={rowIdx} className="flex justify-center gap-2">
                                  {row.map((slot, i) => {


                                    const slotPersons = bookedSlots.filter(
                                      (b) => b.slotId === slot && b.cemeteryId === cem._id
                                    );




                                    const slotCount = slotPersons.length;

                                    const latestBooking =
                                      [...slotPersons].sort(
                                        (a, b) =>
                                          new Date(b.bookedAt) -
                                          new Date(a.bookedAt)
                                      )[0];

                                    const isSelected = selectedSlots.includes(slot);

                                    let colorClass = "";

                                    // BURRIED
                                    if (latestBooking?.status === "Buried") {
                                      colorClass = "bg-red-500 text-white";
                                    }

                                    // SELECTED
                                    else if (isSelected) {
                                      colorClass = "bg-lavender--500 text-white";
                                    }

                                    // RESERVED
                                    else if (latestBooking?.status === "Reserved") {
                                      colorClass = "bg-yellow-100 text-black";
                                    }

                                    // AVAILABLE
                                    else {
                                      colorClass = "bg-green-200 hover:bg-green-300";
                                    }

                                    return (
                                      <div key={i} className="relative">

                                        <button

                                          // ✅ DOUBLE CLICK = POPUP
                                          onDoubleClick={() => {

                                            if (slotPersons.length === 0) {
                                              return;
                                            }

                                            setActivePopover(
                                              activePopover === slot
                                                ? null
                                                : slot
                                            );
                                          }}

                                          onClick={() => {

                                            const latestBooking =
                                              [...slotPersons].sort(
                                                (a, b) =>
                                                  new Date(b.bookedAt) -
                                                  new Date(a.bookedAt)
                                              )[0];

                                            // =========================
                                            // RESERVATION MODE
                                            // =========================
                                            if (viewMode === "reservation") {

                                              // ❌ block reserved/buried
                                              if (
                                                latestBooking?.status === "Reserved" ||
                                                latestBooking?.status === "Buried"
                                              ) {
                                                return;
                                              }

                                              // ✅ select available slot
                                              setSelectedSlots((prev) => {

                                                if (prev.includes(slot)) {
                                                  return prev.filter((s) => s !== slot);
                                                }

                                                return [...prev, slot];
                                              });

                                              return;
                                            }

                                            // =========================
                                            // BURIAL MODE
                                            // =========================
                                            if (viewMode === "burial") {

                                              // ❌ only reserved slot selectable
                                              if (latestBooking?.status !== "Reserved") {
                                                return;
                                              }

                                              // ✅ select reserved slot
                                              setSelectedSlots([slot]);

                                              // ✅ load booking data
                                              setSelectedBooking(latestBooking);

                                              // ✅ close popup
                                              setActivePopover(null);

                                              return;
                                            }
                                          }}

                                          title="Double click to view details"

                                          className={`px-3 py-2 rounded text-sm ${colorClass}`}
                                        >
                                          {slot}
                                        </button>


                                        {/* POPUP */}
                                        {activePopover === slot && slotPersons.length > 0 && (
                                          <div
                                            ref={popoverRef}
                                            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white border rounded-xl shadow-xl"
                                          >
                                            {/* Header */}
                                            <div className="px-4 py-2 border-b font-semibold bg-gray-50 rounded-t-xl flex items-center justify-between">
                                              <span>Buried Persons</span>
                                              <span className="text-xs text-gray-400">
                                                {slotPersons.length}
                                              </span>
                                            </div>

                                            {/* Content */}
                                            <div className="px-3 py-2 text-sm max-h-48 overflow-y-auto space-y-2">
                                              {[...slotPersons].reverse().map((p, index) => (
                                                <div
                                                  key={index}
                                                  className="flex items-start justify-between px-2 py-2 rounded-md hover:bg-gray-100 transition"
                                                >
                                                  {/* Left */}
                                                  <div className="flex gap-2">
                                                    <span className="text-xs text-gray-400 w-5">
                                                      {slotPersons.length - index}.
                                                    </span>
                                                    <div className="flex flex-col">

                                                      {/* Name */}
                                                      <span className="font-medium text-gray-800">
                                                        {p.buriedPerson?.name || "-"}
                                                      </span>

                                                      {/* Date */}
                                                      <span className="text-[10px] text-gray-400">

                                                        {p.status === "Reserved"

                                                          ? (
                                                            p.reservedAt
                                                              ? new Date(
                                                                p.reservedAt
                                                              ).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                              })
                                                              : "-"
                                                          )

                                                          : p.status === "Buried"

                                                            ? (
                                                              p.buriedAt
                                                                ? new Date(
                                                                  p.buriedAt
                                                                ).toLocaleDateString("en-IN", {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric",
                                                                })
                                                                : "-"
                                                            )

                                                            : "-"
                                                        }

                                                      </span>
                                                    </div>


                                                  </div>

                                                  {/* Right (status badge) */}
                                                  <span
                                                    className={`text-[10px] px-2 py-[2px] rounded-full ${p.status?.trim().toLowerCase() === "buried"
                                                      ? "bg-red-100 text-red-600"
                                                      : p.status?.trim().toLowerCase() === "cancelled"
                                                        ? "bg-gray-200 text-gray-600"
                                                        : "bg-yellow-100 text-yellow-700"
                                                      }`}
                                                  >
                                                    {p.status || "Reserved"}
                                                  </span>



                                                </div>
                                              ))}
                                            </div>

                                            {/* Empty fallback (extra safety) */}
                                            {slotPersons.length === 0 && (
                                              <div className="px-3 py-3 text-center text-gray-400 text-sm">
                                                No records
                                              </div>
                                            )}

                                            {/* Arrow */}
                                            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-l border-b rotate-45"></div>
                                          </div>
                                        )}

                                      </div>
                                    );
                                  })}

                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-center">
                         


                              <button
                                onClick={() => {

                                  // no slot selected
                                  if (selectedSlots.length === 0) {
                                    return;
                                  }

                                  // reservation mode
                                  if (viewMode === "reservation") {
                                    setIsModalOpen(true);
                                    return;
                                  }

                                  // burial mode
                                  if (
                                    viewMode === "burial" &&
                                    selectedBooking
                                  ) {
                                    setIsModalOpen(true);
                                  }
                                }}
                                disabled={selectedSlots.length === 0}
                                className="px-5 py-2 bg-lavender--600 text-white rounded disabled:opacity-50"
                              >
                                {viewMode === "burial"
                                  ? "Burial Entry"
                                  : `Reservation (${selectedSlots.length})`}
                              </button>
                            </div>
                            {/* ✅ Legend Box (bottom right corner, grid aligned) */}
                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 border rounded-lg p-3 shadow-sm w-fit ml-auto">
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-green-200 border rounded-sm"></span>
                                <span>Available</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-lavender--500 rounded-sm"></span>
                                <span className="text-gray-700">Selected</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-yellow-100 rounded-sm border"></span>
                                <span className="text-gray-700">Reserved</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-red-500 rounded-sm"></span>
                                <span className="text-gray-700">Buried</span>
                              </div>
                            </div>

                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">
                    No cemetery found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={CurrentPage}
          totalPages={TotalPages}
          rowsPerPage={rowsPerPage}
          rowsInput={rowsInput}
          jumpInput={jumpInput}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          setRowsInput={setRowsInput}
          setJumpInput={setJumpInput}
          defaultRows={25}
        />

      </div>

      <BooingSlotModel
        isOpen={isModalOpen}
        onClose={() => {

          setIsModalOpen(false);

          setSelectedSlots([]);

          setSelectedBooking(null);
        }}
        viewMode={viewMode}

        saving={saving}
        errors={errors}
        showError={showError}

        handleSubmit={handleSubmit}
        handleBooking={handleBooking}

        selectedBooking={selectedBooking}

        // 🔥 ADD THESE
        selectedCemetery={selectedCemetery}
        fetchBookedSlots={fetchBookedSlots}
        setSelectedSlots={setSelectedSlots}
        token={token}
        URL={URL}
        setIsModalOpen={setIsModalOpen}

        // existing
        register={register}
        watch={watch}
        setValue={setValue}

        isMember={isMember}
        setIsMember={setIsMember}
        memberIdSearch={memberIdSearch}
        setMemberIdSearch={setMemberIdSearch}
        memberNameSearch={memberNameSearch}
        setMemberNameSearch={setMemberNameSearch}
        dropdownById={dropdownById}
        dropdownByName={dropdownByName}
        debouncedSearchById={debouncedSearchById}
        debouncedSearchByName={debouncedSearchByName}

        selectedSlots={selectedSlots}
        burialType={burialType}
        setBurialType={setBurialType}
        burialNames={burialNames}
        setBurialNames={setBurialNames}
        burialDates={burialDates}
        setBurialDates={setBurialDates}

        buriedPersonIdSearch={buriedPersonIdSearch}
        setBuriedPersonIdSearch={setBuriedPersonIdSearch}
        buriedPersonNameSearch={buriedPersonNameSearch}
        setBuriedPersonNameSearch={setBuriedPersonNameSearch}
        buriedDropdownById={buriedDropdownById}
        buriedDropdownByName={buriedDropdownByName}
        setBuriedDropdownByName={setBuriedDropdownByName}
        debouncedBuriedSearchById={debouncedBuriedSearchById}
        setBuriedDropdownById={setBuriedDropdownById}
        debouncedBuriedSearchByName={debouncedBuriedSearchByName}

        setDropdownByIdFn={setDropdownById}
        setDropdownByNameFn={setDropdownByName}

        buriedMemberObjectId={buriedMemberObjectId}
        setBuriedMemberObjectId={setBuriedMemberObjectId}

        slotPersons={slotPersons}
        reset={reset}
      />


      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  )
}
