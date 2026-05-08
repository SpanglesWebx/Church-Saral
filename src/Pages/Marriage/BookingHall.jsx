

import React, { useState } from "react";
import { useEffect, useRef } from "react";
import axios from "axios";
import { URL } from "../../App";
import {
  FaEllipsisV,
  FaEye,
  FaPlus,
  FaFileInvoice,
} from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Pagination from "../../Components/Helpers/Pagination";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useNavigate } from "react-router-dom";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";

export const BookingHall = () => {
  const navigate = useNavigate();

  const inputRefs = useRef([]);
  const [bookings, setBookings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });


  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [Response, setResponse] = useState({ status: null, message: "" });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);


  const [kitchenAssets, setKitchenAssets] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});


  const issueSaving = useSaving();

  useBlockRefresh(issueSaving.saving);


  const fetchBookings = async (page = currentPage) => {
    try {
      const res = await axios.get(`${URL}/marriage/bookings`, {
        headers: { Authorization: token },
        params: {
          page,
          limit: rowsPerPage,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          search: search || undefined,
        }
      });

      setBookings(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error(err);
      setBookings([]);
    }
  };


  const fetchKitchenAssets = async () => {
    try {
      const res = await axios.get(`${URL}/marriage/hall/kitchen-assets`, {
        headers: { Authorization: token }
      });

      const formatted = (res.data.data || []).map(item => ({
        _id: item._id,
        itemName: item.item_name,
        availableQuantity: item.available_quantity,
        totalQuantity: item.total_quantity
      }));

      setKitchenAssets(formatted);

    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, rowsPerPage, fromDate, toDate, search]);

  const toggleMenu = (id, event) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const dropdownHeight = 160; // approx height
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = rect.bottom + 5;

    // 🔥 if no space below → open upward
    if (spaceBelow < dropdownHeight) {
      top = rect.top - dropdownHeight;
    }

    setMenuPosition({
      top,
      left: rect.right - 160, // align right side
    });

    setOpenMenuId(id);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const handleQtyChange = (id, type, max) => {
    setSelectedItems((prev) => {
      const current = prev[id] || 0;

      if (type === "inc" && current < max) {
        return { ...prev, [id]: current + 1 };
      }

      if (type === "dec" && current > 0) {
        return { ...prev, [id]: current - 1 };
      }

      return prev;
    });
  };



  const handleIssueAssets = async () => {
    if (issueSaving.saving) return;
    try {

      issueSaving.startSaving();
      const items = Object.keys(selectedItems)
        .filter((id) => selectedItems[id] > 0)
        .map((id) => {
          const asset = kitchenAssets.find(a => a._id === id);
          return {
            asset_id: id,
            issued_qty: selectedItems[id]
          };
        });

      if (!items.length) {
        setResponse({
          status: "Failed",
          message: "Select at least one item",
        });
        return;
      }

      await axios.post(
        `${URL}/marriage/bookings/${selectedBooking._id}/issue-kitchen`,
        { items },
        { headers: { Authorization: token } }
      );

      // ✅ SUCCESS TOAST
      setResponse({
        status: "Success",
        message: "Assets issued successfully",
      });

      setSelectedItems({});

      setIsIssueModalOpen(false);
      fetchBookings();

    } catch (err) {
      console.error(err);

      // ❌ ERROR TOAST
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to issue assets",
      });
    }
    finally {
      issueSaving.stopSaving();
    }
  };



  useEffect(() => {
    if (isIssueModalOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isIssueModalOpen]);


  return (

    <>   <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">


      {/* Header */}
      <div className="p-4">

        {/* Row 1 → Heading */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-lavender--600 whitespace-nowrap">
            Marriage Booking Hall
          </h1>
        </div>

        {/* Row 2 → Filters Grid */}
        <div className="flex justify-center">
          <div className="flex flex-wrap items-end justify-center gap-4">

            {/* Search */}
            <div className="w-[200px]">
              <input
                type="search"
                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
        border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* From */}
            <div className="w-[200px]">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
        border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            {/* To */}
            <div className="w-[200px]">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50 
        border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            {/* Button */}
            <div className="w-[230px] flex justify-center">
              <button
                onClick={() =>
                  navigate("/admin/marriage/booking-hall/new-booking")
                }
                className="flex items-center justify-center gap-2 px-6 py-2 text-sm text-white 
        bg-lavender--600 rounded-md whitespace-nowrap w-full"
              >
                <FaPlus className="text-xs" />
                New Booking
              </button>
            </div>

          </div>
        </div>

      </div>


      {/* Table */}
      <div className="overflow-x-auto mt-4 relative">
        <table className="w-full text-sm text-gray-500">

          <thead className="text-base text-gray-700">
            <tr>
              <th className="p-2 text-center">S.No</th>
              <th className="p-2 text-center">Booked Date</th>
              <th className="p-2 text-center">Customer Name</th>
              <th className="p-2 text-center">Customer Phone</th>
              <th className="p-2 text-center">Booked Hall</th>
              <th className="p-2 text-center">Booked Area</th>
              <th className="p-2 text-center">Booked Session</th>
              <th className="p-2 text-center">Payment Status</th>
              <th className="p-2 text-center">Booking Status</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              bookings.map((item, index) => (
                <tr key={item._id} className="border-b">

                  {/* S.No */}
                  <td className="p-2 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  {/* Date */}
                  <td className="p-2 text-center">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>

                  {/* Customer */}
                  <td className="p-2 text-center">
                    {item.customerName || "-"}
                  </td>

                  {/* Phone */}
                  <td className="p-2 text-center">
                    {item.customerPhone || "-"}
                  </td>

                  {/* Hall */}
                  <td className="p-2 text-center">
                    {item.hall?.hall_name || "-"}
                  </td>

                  {/* Category */}
                  <td className="p-2 text-center">
                    {item.category?.name || "-"}
                  </td>

                  {/* Session */}
                  <td className="p-2 text-center">
                    {item.sessions?.join(", ") || "-"}
                  </td>

                  {/* Payment */}
                  <td className="p-2 text-center font-medium">
                    <span
                      className={
                        item.payment_status === "Unpaid"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {item.payment_status || "-"}
                    </span>
                  </td>

                  {/* Status */}
                  <td
                    className={`p-2 text-center font-medium
    ${item.booking_status === "Completed"
                        ? "text-green-600"
                        : item.booking_status === "Cancelled"
                          ? "text-red-600"
                          : "text-yellow-500"
                      }`}
                  >
                    {item.booking_status || "-"}
                  </td>
                  {/* ACTION */}
                  <td className="p-2 text-center relative">
                    <div className="flex items-center justify-center gap-3">

                      <button
                        onClick={(e) => toggleMenu(item._id, e)}
                        className="text-lavender--600"
                      >
                        <FaEllipsisV />
                      </button>

                      {openMenuId === item._id && (
                        <div
                          ref={menuRef}
                          style={{
                            position: "fixed",
                            top: menuPosition.top,
                            left: menuPosition.left,

                          }}
                          className="w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"

                        >
                          <div className="flex flex-col py-2 text-sm">

                            {/* VIEW */}
                            <button
                              onClick={() => {
                                setSelectedBooking(item);
                                setIsModalOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              <FaEye size={18} className="text-lavender--600" />
                              View
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={() => {
                                navigate(`/admin/marriage/booking-hall/edit/${item._id}`);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              <CiEdit size={18} className="text-lavender--600" />
                              Edit
                            </button>

                            {/* ISSUE ASSETS */}
                            <button

                              onClick={() => {
                                setSelectedBooking(item);
                                setIsIssueModalOpen(true);
                                setSelectedItems({});
                                fetchKitchenAssets();
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              <FaPlus size={18} className="text-lavender--600" />
                              Issue Assets
                            </button>

                            {/* CLOSE BILL */}
                            <button
                              onClick={() => {
                                navigate(`/admin/marriage/booking-hall/payment/${item._id}`);
                                setOpenMenuId(null);
                              }}


                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              <FaFileInvoice size={18} className="text-lavender--600" />
                              Close Bill
                            </button>

                          </div>
                        </div>
                      )}

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="p-4 md:p-5 space-y-4 max-h-[500px] overflow-y-auto">

            {/* GRID DETAILS */}
            <div className="grid grid-cols-2 gap-y-3 text-left items-center">

              <div className="font-semibold">Hall</div>
              <div>{selectedBooking.hall?.hall_name}</div>

              <div className="font-semibold">Category</div>
              <div>{selectedBooking.category?.name}</div>

              <div className="font-semibold">Date</div>
              <div>{new Date(selectedBooking.date).toLocaleDateString("en-GB")}</div>

              <div className="font-semibold">Session</div>
              <div>{selectedBooking.sessions?.join(", ")}</div>

              <div className="font-semibold">Customer Name</div>
              <div>{selectedBooking.customerName}</div>

              <div className="font-semibold">Customer Phone</div>
              <div>{selectedBooking.customerPhone}</div>

              <div className="font-semibold">Category Amount</div>
              <div>₹{selectedBooking.amount}</div>

              <div className="font-semibold">Advance Amount</div>
              <div>₹{selectedBooking.advanceAmount}</div>

              <div className="font-semibold">Payment Status</div>
              <div className={
                selectedBooking.payment_status === "Unpaid"
                  ? "text-red-600"
                  : "text-green-600"
              }>
                {selectedBooking.payment_status}
              </div>

              <div className="font-semibold">Booking Status</div>
              <div
                className={
                  selectedBooking.booking_status === "Completed"
                    ? "text-green-600 font-medium"
                    : selectedBooking.booking_status === "Cancelled"
                      ? "text-red-600 font-medium"
                      : "text-yellow-600 font-medium"
                }
              >
                {selectedBooking.booking_status}
              </div>

            </div>

            {/* PAYMENT HISTORY */}
            <div className="mt-4 border rounded-lg p-3 ">
              <h3 className="font-semibold mb-2 text-base">Payment History</h3>

              <table className="w-full text-base text-gray-600">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Sl. No</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Amount Paid</th>
                    <th className="p-2 text-left">Balance After</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedBooking.advanceHistory?.length > 0 ? (
                    selectedBooking.advanceHistory.map((item, index) => {
                      const balance =
                        selectedBooking.amount -
                        selectedBooking.advanceHistory
                          .slice(0, index + 1)
                          .reduce((sum, i) => sum + i.amount, 0);

                      return (
                        <tr key={item._id} className="border-b">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">
                            {new Date(item.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="p-2">₹{item.amount}</td>
                          <td className="p-2">₹{balance}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-gray-400">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            {/* KITCHEN ISSUED ASSETS */}
            <div className="mt-4 border rounded-lg p-3">
              <h3 className="font-semibold mb-2 text-base">
                Kitchen Issued Assets
              </h3>

              {selectedBooking?.issued_assets?.kitchen?.length > 0 ? (
                <table className="w-full text-base text-gray-600">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Sl. No</th>
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-left">Issued</th>
                      <th className="p-2 text-left">Returned</th>
                      <th className="p-2 text-left">Damaged</th>
                      <th className="p-2 text-left">Missing</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedBooking.issued_assets.kitchen.map((item, index) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{item.item_name}</td>
                        <td className="p-2">{item.issued_qty}</td>
                        <td className="p-2">{item.returned}</td>
                        <td className="p-2">{item.damaged}</td>
                        <td className="p-2">{item.missing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-gray-400 py-3">
                  No kitchen assets found.
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>



      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedItems({}); // 🔥 RESET DATA
        }}
        title="Issue Assets"
      >
        <div className="p-4">

          {/* 🔥 SCROLL AREA */}
          <div className="max-h-[550px] overflow-y-auto">

            {/* ✅ AVAILABLE ITEMS */}
            <div className="grid grid-cols-3 gap-3">

              {kitchenAssets
                .filter(item => item.availableQuantity > 0)
                .map((item, index) => (

                  <div
                    key={item._id}
                    className="border rounded-lg p-3 shadow-sm text-sm"
                  >

                    <h3 className="font-semibold text-[14px] mb-1">
                      {item.itemName}
                    </h3>

                    <p className="text-xs text-gray-500 mb-2">
                      Available: {item.availableQuantity}
                    </p>

                    <div className="flex items-center justify-center gap-1">

                      {/* MINUS */}
                      <button
                        onClick={() =>
                          handleQtyChange(item._id, "dec", item.availableQuantity)
                        }
                        className="w-7 h-7 bg-gray-200 rounded text-sm"
                      >
                        -
                      </button>

                      {/* INPUT */}
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={selectedItems[item._id] || ""}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          val = Number(val || 0);

                          if (val > item.availableQuantity) {
                            val = item.availableQuantity;
                          }

                          setSelectedItems(prev => ({
                            ...prev,
                            [item._id]: val
                          }));
                        }}

                        // 🔥 KEYBOARD SUPPORT
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            const next = inputRefs.current[index + 1];

                            if (next) {
                              next.focus();
                            } else {
                              handleIssueAssets(); // last input
                            }
                          }

                          if (e.key === "ArrowDown") {
                            inputRefs.current[index + 1]?.focus();
                          }

                          if (e.key === "ArrowUp") {
                            inputRefs.current[index - 1]?.focus();
                          }
                        }}

                        className="w-50 h-7 text-center border border-gray-300 rounded text-sm outline-none"
                      />

                      {/* PLUS */}
                      <button
                        onClick={() =>
                          handleQtyChange(item._id, "inc", item.availableQuantity)
                        }
                        className="w-7 h-7 bg-lavender--600 text-white rounded text-sm"
                      >
                        +
                      </button>

                    </div>
                  </div>

                ))}
            </div>

            {/* 🔥 UNAVAILABLE ITEMS (SMALL STYLE) */}
            <div className="mt-5">
              <h3 className="text-red-600 font-semibold text-base mb-2">
                Unavailable Items
              </h3>

              <div className="space-y-1">
                {kitchenAssets
                  .filter(item => item.availableQuantity === 0)
                  .map(item => (
                    <div
                      key={item._id}
                      className="flex justify-between text-sm border-b py-1"
                    >
                      <span>{item.itemName}</span>
                      <span className="text-red-500">Out of stock</span>
                    </div>
                  ))}
              </div>
            </div>

          </div>

          {/* 🔥 ISSUE BUTTON */}
          <div className="flex justify-end mt-4">
            {/* <button
              onClick={handleIssueAssets}
              className="px-5 py-2 bg-lavender--600 text-white rounded text-sm"
            >
              Issue Assets
            </button> */}


            <Button
              saving={issueSaving.saving}
              type="save"
              buttonType="button"
              onClick={handleIssueAssets}
            />
          </div>

        </div>
      </Modal>



      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}


    </>

  );
};