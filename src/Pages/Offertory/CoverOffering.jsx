
// src/Pages/Offerings/CoverOffering.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaEye } from "react-icons/fa";
import Pagination from "../../Components/Helpers/Pagination";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Spinners from "../../Components/Spinners";
import { URL } from "../../App";


const CoverOffering = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [offertoryType, setOffertoryType] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [coverTypes, setCoverTypes] = useState([]);

  // VIEW MODAL STATES
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [viewFromDate, setViewFromDate] = useState("");
  const [viewToDate, setViewToDate] = useState("");
  const [viewPage, setViewPage] = useState(1);
  const [viewTotalPages, setViewTotalPages] = useState(1);



  const [viewRowsPerPage, setViewRowsPerPage] = useState("10");
  const [viewRowsInput, setViewRowsInput] = useState("");
  const [viewJumpInput, setViewJumpInput] = useState("");




  const abortRef = useRef(null);

  /* ---------------- FETCH MAIN TABLE ---------------- */
  const fetchCoverOfferings = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await axios.get(`${URL}/offerings/cover-list`, {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          memberId: search,
          memberName: search,
          offertoryType,
          unique: true,
        },
        headers: { Authorization: token },
        signal: abortRef.current.signal,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (!axios.isCancel(err)) console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverOfferings();
  }, [currentPage, rowsPerPage, search, offertoryType]);

  /* ---------------- FETCH COVER TYPES ---------------- */
  useEffect(() => {
    const fetchCoverTypes = async () => {
      try {
        const res = await axios.get(`${URL}/offerings/cover/subcategories`, {
          headers: { Authorization: token },
        });
        setCoverTypes(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCoverTypes();
  }, []);

  /* ---------------- VIEW MEMBER OFFERINGS ---------------- */
  const fetchMemberCoverDetails = async (member_id, offertoryType) => {
    try {

      const res = await axios.get(`${URL}/offerings/cover-by-member`, {
        params: { member_id, offertoryType },
        headers: { Authorization: token }
      });

      setViewData(res.data.data || []);

    } catch (err) {
      console.error("Fetch cover details error:", err);
    }
  };
  // useEffect(() => {
  //   if (viewData) {
  //     fetchMemberCoverDetails(
  //       viewData.member_id,
  //       viewData.offertoryType,
  //       viewPage
  //     );
  //   }
  // }, [viewPage, viewFromDate, viewToDate, viewRowsPerPage]);

  const handleView = async ({ member_id, offertoryType }) => {
    setViewFromDate("");
    setViewToDate("");

    setViewPage(1);
    setViewRowsInput("");
    setViewJumpInput("");
    setViewRowsPerPage(2);

    await fetchMemberCoverDetails(member_id, offertoryType);

    setIsViewModalOpen(true);
  };
  useEffect(() => {
    if (viewData) {
      fetchMemberCoverDetails(
        viewData.member_id,
        viewData.offertoryType,
        viewPage
      );
    }
  }, [viewPage, viewFromDate, viewToDate]);




  const getMonthRange = (months = []) => {
    if (!months || months.length === 0) return "-";

    // ✅ remove duplicates
    const uniqueMonths = [
      ...new Map(months.map(m => [m.month, m])).values()
    ];

    // ✅ sort correctly
    const sorted = uniqueMonths.sort(
      (a, b) =>
        moment(a.month, "MMM YY") - moment(b.month, "MMM YY")
    );

    // ✅ JUST TAKE FIRST AND LAST (NO BREAK)
    const start = moment(sorted[0].month, "MMM YY").format("MMM-YY");
    const end = moment(sorted[sorted.length - 1].month, "MMM YY").format("MMM-YY");

    return start === end ? start : `${start} to ${end}`;
  };

  return (
    <div className="p-2">
      {/* HEADER */}
      <div className="flex items-center px-3 py-2">
        <FaArrowLeft
          title="Back"
          onClick={() => navigate("/admin/offertory/add-offerings")}
          className="cursor-pointer text-lavender--600"
          size={18}
        />

      </div>

      {/* FILTER CARD */}
      <div className="p-5 mx-1 mt-3 bg-white shadow-md rounded-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* ⭐ LEFT → PAGE HEADING */}
          <h1 className="text-xl font-bold text-lavender--600">
            Cover Offertory
          </h1>


          {/* ⭐ CENTER → SEARCH + FILTER */}
          <div className="flex flex-wrap items-center justify-center gap-3 flex-1">

            {/* Search */}
            <input
              type="search"
              placeholder="Search by ID or Name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-56 ps-3 bg-gray-50"
            />

            {/* Offertory Dropdown */}
            <select
              value={offertoryType}
              onChange={(e) => {
                setOffertoryType(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-72 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="">All Cover Types</option>

              {coverTypes.map((o, i) => (
                <option key={i} value={o.offeringName}>
                  {o.offeringName}
                </option>
              ))}
            </select>

          </div>


          {/* ⭐ RIGHT → ADD BUTTON */}
          <button
            onClick={() => navigate("/admin/offertory/cover/add")}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg whitespace-nowrap"
          >
            <FaPlus /> Add Cover
          </button>

        </div>


        {/* MAIN TABLE */}
        {loading ? (
          <Spinners />
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">

              {/* TABLE HEADER */}
              <thead className="text-base text-gray-700">
                <tr>
                  {[
                    "Sl No.",
                    "Member ID",
                    "Member Name",
                    "Offertory Type",
                    "Month",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="p-2 text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {data.length > 0 ? (
                  data.map((row, i) => (
                    <tr key={row._id} className="text-center border-b">

                      {/* SERIAL NUMBER */}
                      <td className="p-2">
                        {(currentPage - 1) * rowsPerPage + i + 1}
                      </td>

                      {/* MEMBER ID */}
                      <td className="p-2">
                        {row.member?.member_id || "-"}
                      </td>

                      {/* MEMBER NAME */}
                      <td className="p-2">
                        {row.member?.member_name || "-"}
                      </td>

                      {/* OFFERTORY TYPE */}
                      <td className="p-2">
                        {row.offertoryType}
                      </td>


                      {/* MONTH RANGE */}
                      <td className="p-2">
                        {
                          row.offertoryType === "Monthly Offertory"
                            ? getMonthRange(row.months || [])
                            : "Non-Month"
                        }
                      </td>

                      {/* ACTION */}
                      <td className="p-2 flex justify-center">
                        <FaEye
                          size={18}
                          className="text-lavender--600 cursor-pointer"
                          title="View Cover Offering"
                          onClick={() =>
                            handleView({
                              member_id: row.member?.member_id,
                              offertoryType: row.offertoryType
                            })
                          }
                        />
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}


        {/* PAGINATION */}
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
        />
      </div>

      {/* ---------------- VIEW MODAL ---------------- */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Cover Offertory"
      >
        {viewData && (
          <>
            {/* HEADER */}
            <div className="flex flex-col pt-5 ps-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <span className="text-xs text-gray-500">Member ID</span>
                  <span className="block text-sm font-medium text-gray-800">
                    {viewData[0]?.member_id}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Member Name</span>
                  <span className="block text-sm font-medium text-gray-800">
                    {viewData[0]?.member_name}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Offertory Type</span>
                  <span className="block text-sm font-medium text-gray-800">
                    {viewData[0]?.offertoryType}
                  </span>
                </div>
              </div>
            </div>

            {/* DATE FILTER */}
            {/* <div className="flex gap-3 px-5 mb-4">
              <input
                type="date"
                value={viewFromDate}
                onChange={(e) => {
                  setViewFromDate(e.target.value);
                  setViewPage(1);
                }}
                className="border px-3 py-1 rounded-md"
              />

              <input
                type="date"
                value={viewToDate}
                onChange={(e) => {
                  setViewToDate(e.target.value);
                  setViewPage(1);
                }}
                className="border px-3 py-1 rounded-md"
              />
            </div> */}

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600">

                {/* TABLE HEADER */}
                <thead className="text-gray-700 text-sm">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Date </th>
                    <th className="p-2 text-center">Trans ID</th>
                    <th className="p-2 text-center">Month</th>
                    <th className="p-2 text-center">Amount</th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>

                  {viewData.length > 0 ? (

                    viewData.map((row, i) => (

                      <tr key={i} className="border-b text-center">

                        {/* SL NO */}
                        <td className="p-2">{i + 1}</td>

                        {/* DATE */}
                        <td className="p-2">
                          {moment(row.date).format("DD/MM/YYYY")}
                        </td>

                        {/* TRANS ID */}
                        <td className="p-2">
                          {row.transId || "-"}
                        </td>

                        {/* MONTH */}
                        <td className="p-2">
                          {row.month || "-"}   {/* ✅ Works for both */}
                        </td>

                        {/* AMOUNT */}
                        <td className="p-2 font-medium">
                          ₹ {row.amount}
                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No data found
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>
            </div>




          </>
        )}
      </Modal>
    </div>
  );
};

export default CoverOffering;
