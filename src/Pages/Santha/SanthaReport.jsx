import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FaFilePdf, FaEye } from "react-icons/fa";
import ExpenseFormModal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import { URL } from "../../App";

export const SanthaReport = () => {
  const [data, setData] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [types, setTypes] = useState([]);

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [searchTerm, setSearchTerm] = useState("");


  const [loadingAction, setLoadingAction] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberData, setMemberData] = useState([]);
  const [viewData, setViewData] = useState([]);

  const abortControllerRef = useRef(new AbortController());

  const token = sessionStorage.getItem("token");


  const [grandTotal, setGrandTotal] = useState(0);
  const [dateTotals, setDateTotals] = useState({});

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
      const res = await axios.get(`${URL}/santha/report`, {
        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined,

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




  const fetchMemberReport = async (memberId) => {
    try {
      const res = await axios.get(`${URL}/santha/report/${memberId}`, {
        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
        },
        headers: { Authorization: token },
      });

      setViewData(res.data.data);
      setGrandTotal(res.data.grandTotal);
      setDateTotals(res.data.dateTotals);
      setOpenModal(true);
    } catch (err) {
      console.error(err);
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
  }, [dateRange, searchTerm, CurrentPage, rowsPerPage]);

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



  /* ========================= RESET PAGE ========================= */
  useEffect(() => setCurrentPage(1), [searchTerm, dateRange]);

  return (

    <>
      <div className="relative h-auto bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">

          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between mb-4">


            <h1 className="text-xl font-bold text-lavender--600 whitespace-nowrap">
              Santha Report
            </h1>


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



          </div>

          {/* ================= TABLE ================= */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">

              <thead className="text-base text-gray-700">
                <tr>
                  <th className="p-2 text-center">S.No</th>
                  <th className="p-2 text-left">Member ID</th>
                  <th className="p-2 text-left">Member Name</th>
                  <th className="p-2 text-left">Member Tamil Name</th>
                  <th className="p-2 text-center">Action</th>

                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index} className="border-b">

                      <td className="p-2 text-center">
                        {(CurrentPage - 1) * rowsPerPage + index + 1}
                      </td>



                      <td className="p-2 text-left">
                        {item.member_id ? item.member_id : "-"}
                      </td>

                      <td className="p-2 text-left">
                        {item.member_name ? item.member_name : "-"}
                      </td>


                      <td className="p-2 text-left">
                        {item.member_tamil_name ? item.member_tamil_name : "-"}
                      </td>

                      <td className="p-2">
                        <div className="flex justify-center items-center">
                          <FaEye
                            size={18}
                            className="text-lavender--600 cursor-pointer hover:scale-110 transition"
                            onClick={() => fetchMemberReport(item._id)}
                            title="View Santha Details"
                          />
                        </div>
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





      </div>


      {openModal && (
        <ExpenseFormModal
          isOpen={openModal}
          title="Santha Details"
          onClose={() => setOpenModal(false)}
        >
          <div className="space-y-4">

            {/* ✅ MEMBER DETAILS */}
            {viewData.length > 0 && (
              <div className="grid grid-cols-2 gap-3 text-sm border-b pb-3">

                <div>
                  <strong>Member ID:</strong> {viewData[0].member_id}
                </div>

                <div>
                  <strong>Member Name:</strong> {viewData[0].member_name}
                </div>

                <div>
                  <strong>Family ID:</strong> {viewData[0].family_id}
                </div>

                <div>
                  <strong>Phone:</strong> {viewData[0].primary_contact}
                </div>

              </div>
            )}


            {/* ✅ REPORT HEADER (PERIOD + TOTAL) */}
            <div className="flex items-center justify-between bg-gray-50 border rounded-md px-4 py-3">

              {/* LEFT → DATE RANGE */}
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Period:</span>{" "}
                {moment(dateRange.from).format("DD-MM-YYYY")} →{" "}
                {moment(dateRange.to).format("DD-MM-YYYY")}
              </div>

              {/* RIGHT → TOTAL */}
              <div className="text-lg font-bold text-green-600">
                ₹ {grandTotal}
              </div>

            </div>

            {/* ✅ TABLE */}
            <div className="max-h-[450px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-gray-700 border-collapse">

                {/* HEADER */}
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border text-center font-semibold">S.No</th>
                    <th className="p-3 border text-center font-semibold">Date</th>
                    <th className="p-3 border text-center font-semibold">Trans ID</th>
                    <th className="p-3 border text-center font-semibold">Month</th>
                    <th className="p-3 border text-center font-semibold">Amount</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {viewData.length > 0 ? (() => {

                    // ✅ GROUP BY DATE
                    const grouped = {};

                    viewData.forEach(item => {
                      const d = new Date(item.date).toLocaleDateString("en-GB");
                      if (!grouped[d]) grouped[d] = [];
                      grouped[d].push(item);
                    });

                    let serial = 1;

                    return Object.entries(grouped).map(([date, items]) => {
                      return (
                        <React.Fragment key={date}>

                          {items.map((item, index) => (
                            <tr key={index} className="text-center border-b">

                              <td className="p-2 border">{serial++}</td>

                              {index === 0 && (
                                <td rowSpan={items.length} className="p-2 border bg-gray-50">
                                  {date}
                                </td>
                              )}

                              <td className="p-2 border text-lavender--600">
                                {item.transId}
                              </td>

                              <td className="p-2 border">{item.month}</td>

                              <td className="p-2 border text-green-600">
                                ₹ {item.amount}
                              </td>
                            </tr>
                          ))}



                        </React.Fragment>
                      );
                    });

                  })() : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

          </div>
        </ExpenseFormModal>
      )}

    </>
  );
};