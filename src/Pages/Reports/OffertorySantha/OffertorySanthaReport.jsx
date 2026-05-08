import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FaFilePdf } from "react-icons/fa";
import ExpenseFormModal from "../../../Components/Expense/ExpenseFormModal";
import Pagination from "../../../Components/Helpers/Pagination";
import { URL } from "../../../App";

export const OffertorySanthaReport = () => {
  const [data, setData] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [types, setTypes] = useState([]);

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [loadingAction, setLoadingAction] = useState(null);


  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFilters, setPdfFilters] = useState({
    from: "",
    to: "",
    type: "All",
    search: ""
  });

  const abortControllerRef = useRef(new AbortController());

  const token = sessionStorage.getItem("token");

  /* ========================= DEFAULT WEEK ========================= */
  useEffect(() => {
    const today = moment();
    setDateRange({
      from: today.startOf("week").format("YYYY-MM-DD"),
      to: today.endOf("week").format("YYYY-MM-DD"),
    });
  }, []);

  /* ========================= FETCH ========================= */
  const fetchData = async () => {
    try {
      const res = await axios.get(`${URL}/reports/offertory-report`, {
        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined,
          type: typeFilter === "All" ? undefined : typeFilter
        },
        headers: { Authorization: token },
        signal: abortControllerRef.current.signal,
      });

      let result = res.data.data || [];


      setTypes(res.data.types || []);
      setData(result);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    }
  };

  /* ========================= DEBOUNCE ========================= */
  const debounce = useRef(null);

  useEffect(() => {
    clearTimeout(debounce.current);

    debounce.current = setTimeout(() => {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      fetchData();
    }, 150);

    return () => clearTimeout(debounce.current);
  }, [dateRange, searchTerm, CurrentPage, rowsPerPage, typeFilter]);

  /* ========================= DATE NAV ========================= */
  const goPreviousWeek = () => {
    const prev = moment(dateRange.from).subtract(7, "days");
    setDateRange({
      from: prev.startOf("week").format("YYYY-MM-DD"),
      to: prev.endOf("week").format("YYYY-MM-DD"),
    });
  };

  const goNextWeek = () => {
    const next = moment(dateRange.from).add(7, "days");
    setDateRange({
      from: next.startOf("week").format("YYYY-MM-DD"),
      to: next.endOf("week").format("YYYY-MM-DD"),
    });
  };

  /* ========================= PDF ========================= */
  const handlePdfDownload = async () => {
    try {
      setLoadingAction("pdf");

      const res = await axios.get(
        `${URL}/reports/offertory-report/pdf`,
        {
          params: {
            fromdate: dateRange.from,   // ✅ FIX
            todate: dateRange.to,       // ✅ FIX
            type: typeFilter === "All" ? undefined : typeFilter,
            search: searchTerm || undefined
          },
          headers: { Authorization: token },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "OffertoryReport.pdf";
      link.click();

      setIsPdfModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  /* ========================= RESET PAGE ========================= */
  useEffect(() => setCurrentPage(1), [searchTerm, dateRange, typeFilter]);

  return (
    <div className="relative h-auto bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-4">


          <h1 className="text-xl font-bold text-lavender--600 whitespace-nowrap">
            Income Report
          </h1>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className={`mr-4 text-xl ${loadingAction
              ? "opacity-50 cursor-not-allowed"
              : "text-red-600 hover:text-red-800"
              }`}
          >
            {loadingAction === "pdf" ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <FaFilePdf />
            )}
          </button>
        </div>

        {/* ================= SINGLE ROW FILTER ================= */}
        <div className="flex items-end justify-center gap-4 mb-4 flex-nowrap">

          {/* SEARCH (SMALL WIDTH) */}
          <div className="w-[180px] ">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Search
            </label>
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full py-2 text-sm text-gray-900 rounded px-3 bg-gray-50 border border-gray-300"
            />
          </div>

          {/* PREV */}
          <button
            onClick={goPreviousWeek}
            title="Previous Week"
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
          >
            &lt;
          </button>

          {/* FROM */}
          <div className="w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="block w-full py-2 text-sm text-gray-900 rounded px-3 bg-gray-50 border border-gray-300"
            />
          </div>

          {/* TO */}
          <div className="w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="block w-full py-2 text-sm text-gray-900 rounded px-3 bg-gray-50 border border-gray-300"
            />
          </div>

          {/* NEXT */}
          <button
            onClick={goNextWeek}
            title="Next Week"
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
          >
            &gt;
          </button>

          {/* TYPE FILTER */}
          <div className="w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full py-2 text-sm text-gray-900 rounded px-3 bg-gray-50 border border-gray-300"
            >
              <option value="All">All</option>
              {types.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">

            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">S.No</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Trans ID</th>
                <th className="p-2 text-left">Member ID</th>
                <th className="p-2 text-left">Member Name</th>
                <th className="p-2 text-center">Category</th>
                <th className="p-2 text-center">Sub Category</th>
                <th className="p-2 text-center">Month</th>
                <th className="p-2 text-center">Amount</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index} className="border-b">

                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="p-2 text-center">
                      {moment(item.date).format("DD-MM-YYYY")}
                    </td>

                    <td className="p-2 text-center">
                      {item.transId || "-"}
                    </td>
                    <td className="p-2 text-left">
                      {item.member_id ? item.member_id : "-"}
                    </td>

                    <td className="p-2 text-left">
                      {item.member_name ? item.member_name : "-"}
                    </td>

                    <td className="p-2 text-center">
                      {item.type}
                    </td>

                    <td className="p-2 text-center">
                      {item.type === "Bag"
                        ? item.subCategory || "-"
                        : item.type === "Cover"
                          ? item.offertoryType || "-"
                          : "Santha"}
                    </td>

                    <td className="p-2 text-center">
                      {item.month ? item.month : "-"}
                    </td>

                    <td className="p-2 text-center">
                      {item.amount ?? 0}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="items-center justify-center mt-4">
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

      </div>



      <ExpenseFormModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Download Offertory & Santha Report"
      >
        <div className="p-6 text-center space-y-6">

          {/* MESSAGE */}
          <p className="text-gray-700 text-base">
            Are you sure you want to download the report?
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4">


            {/* YES */}
            <button
              onClick={handlePdfDownload}
              disabled={loadingAction === "pdf"}
              className={`px-4 py-2 rounded-md text-white flex items-center justify-center gap-2
    ${loadingAction === "pdf"
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-lavender--600 hover:bg-lavender--700"
                }
  `}
            >
              {loadingAction === "pdf" ? (
                <>
                  {/* 🔄 Spinner */}
                  <span className="w-5 h-5 border-2 border-white border-t-transparent border-r-transparent rounded-full animate-spin"></span>

                  {/* Text */}
                  <span>Downloading...</span>
                </>
              ) : (
                "Yes, Download"
              )}
            </button>

          </div>

        </div>
      </ExpenseFormModal>
    </div>
  );
};