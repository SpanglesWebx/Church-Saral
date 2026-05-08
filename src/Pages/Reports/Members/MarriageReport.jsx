import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';

import moment from 'moment';




import { FaFilePdf } from "react-icons/fa";

import { FailedMessage, SuccessMessage } from '../../../Components/ToastMessage';
import Pagination from "../../../Components/Helpers/Pagination";
import { jwtDecode } from "jwt-decode";

import SmallSizedModal from "../../../Components/Expense/SmallSizedModal";
// import MarriageIndividualModal from "./MarriageIndividualModal";

import { URL } from "../../../App";


const ReportPage = () => {
  const [data, setData] = useState([]);

  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState("");

  const [fromSI, setFromSI] = useState("");
  const [toSI, setToSI] = useState("");


  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [isIndividualPrint, setIsIndividualPrint] = useState(false);

  const [totalCount, setTotalCount] = useState(0);


  const [loadingAction, setLoadingAction] = useState(null);


  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);

      // If multiple roles exist, pick the active/stored one
      const storedRole = sessionStorage.getItem("role");

      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]);

  useEffect(() => {

    const today = moment();

    const startOfWeek = today.clone().startOf("week");
    const endOfWeek = today.clone().endOf("week");

    setDateRange({
      from: startOfWeek.format("YYYY-MM-DD"),
      to: endOfWeek.format("YYYY-MM-DD")
    });

  }, []);

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };


  // AbortController reference
  const abortControllerRef = useRef(new AbortController());


  const sortMarriageData = (list = []) => {

    return [...list].sort((a, b) => {

      const da = moment(a.marriage_date).format("MM-DD");
      const db = moment(b.marriage_date).format("MM-DD");

      if (da !== db) return da.localeCompare(db);

      const nameA = (a.husband_name || a.wife_name || "").trim();
      const nameB = (b.husband_name || b.wife_name || "").trim();

      return nameA.localeCompare(nameB);
    });

  };


  // Fetch data function with AbortController
  const fetchData = async () => {

    try {

      if (!dateRange.from || !dateRange.to) {
        setData([]);
        return;
      }

      const response = await axios.get(`${URL}/reports/marriage`, {

        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
          search: searchTerm || undefined,
          page: CurrentPage,
          limit: rowsPerPage
        },

        headers: {
          Authorization: token
        },

        signal: abortControllerRef.current.signal
      });

      const sorted = sortMarriageData(response.data.Marriage || []);

      setData(sorted);
      setFilteredData(sorted);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);

    } catch (error) {

      if (error.name !== "AbortError") {
        console.error("Marriage fetch error:", error);
      }

    }
  };




  const debounceFetchData = useRef(null);

  useEffect(() => {

    clearTimeout(debounceFetchData.current);

    debounceFetchData.current = setTimeout(() => {

      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      fetchData();

    }, 150);

    return () => clearTimeout(debounceFetchData.current);

  }, [searchTerm, dateRange, CurrentPage, rowsPerPage]);


  useEffect(() => {
    setTotalCount(data.length);
  }, [data]);


  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  const goPreviousWeek = () => {

    const prev = moment(dateRange.from).subtract(7, "days");

    setDateRange({
      from: prev.startOf("week").format("YYYY-MM-DD"),
      to: prev.endOf("week").format("YYYY-MM-DD")
    });

  };

  const goNextWeek = () => {

    const next = moment(dateRange.from).add(7, "days");

    setDateRange({
      from: next.startOf("week").format("YYYY-MM-DD"),
      to: next.endOf("week").format("YYYY-MM-DD")
    });

  };


  const downloadMarriagePDF = async () => {

    try {

      setLoadingAction("pdf");

      const res = await axios.get(
        `${URL}/reports/marriage/pdf`,
        {
          params: {
            fromdate: dateRange.from,
            todate: dateRange.to,
            search: searchTerm || undefined
          },
          headers: { Authorization: token },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(res.data);

      const link = document.createElement("a");
      link.href = url;
      link.download = "MarriageReport.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Success", "Marriage PDF downloaded");

    } catch (err) {

      showToast("Failed", "Marriage PDF download failed");

    } finally {

      setLoadingAction(null);

    }
  };




  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])


  useEffect(() => {
    setCurrentPage(1)
  }, [dateRange])

  return (
    <>

      <div className="relative h-auto bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-lavender--600">
              Marriage Reports
            </h2>



            <div className="flex gap-x-5">

              <button
                onClick={downloadMarriagePDF}
                disabled={loadingAction !== null}
                className={`mr-4 text-xl flex items-center justify-center
    ${loadingAction
                    ? "opacity-50 cursor-not-allowed"
                    : "text-red-600 hover:text-red-800"
                  }
  `}
              >
                {loadingAction === "pdf" ? (
                  <span className="w-5 h-5 border-2 border-lavender--600 border-t-transparent border-r-transparent rounded-full animate-spin"></span>
                ) : (
                  <FaFilePdf />
                )}
              </button>

              {/* <button
                                         onClick={printBirthdayReport}
                                         disabled={loadingAction !== null}
                                         className={`mr-4 text-xl ${loadingAction ? "opacity-50 cursor-not-allowed" : "text-lavender--600"
                                             }`}
                                     >
                                         {loadingAction === "print" ? (
                                             <span className="animate-spin">⏳</span>
                                         ) : (
                                             <FaPrint />
                                         )}
                                     </button> */}

            </div>
          </div>

          {/* WEEK + DATE FILTER */}
          <div className="flex flex-wrap items-end justify-center gap-4 mb-4">

            <button
              onClick={goPreviousWeek}
              title="Previous Week"
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            >
              &lt;
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                From
              </label>

              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleFromChange(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50
border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                To
              </label>

              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleToChange(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-full px-3 bg-gray-50
border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />

            </div>

            <button
              onClick={goNextWeek}
              title="Next Week"
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            >
              &gt;
            </button>

          </div>



          {/* SEARCH */}
          <div className="grid grid-cols-3 gap-2 mb-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

          </div>



          {/* TABLE */}
          <div ref={componentRef} className="overflow-x-auto mt-4">

            <table className="w-full text-sm text-gray-500">

              <thead className="text-base text-gray-700">
                <tr>

                  <th className="p-2 text-center">
                    Sl. no
                  </th>

                  <th className="p-2 text-left">
                    Husband Name
                  </th>

                  <th className="p-2 text-left">
                    Tamil Name
                  </th>

                  <th className="p-2 text-left">
                    Wife Name
                  </th>

                  <th className="p-2 text-left">
                    Tamil Name
                  </th>

                  <th className="p-2 text-center">
                    Marriage Date
                  </th>

                  <th className="p-2 text-center">
                    Years
                  </th>

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
                        {item.husband_name}
                      </td>

                      <td className="p-2 text-left">
                        {item.husband_tamil_name}
                      </td>

                      <td className="p-2 text-left">
                        {item.wife_name}
                      </td>

                      <td className="p-2 text-left">
                        {item.wife_tamil_name}
                      </td>

                      <td className="p-2 text-center">
                        {moment(item.marriage_date).format("DD-MM-YYYY")}
                      </td>

                      <td className="p-2 text-center">
                        {moment().diff(moment(item.marriage_date), "years")}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No Members Found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          <br />

          <div className=" items-center justify-center mt-4">

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



        {/* <MarriageIndividualModal
  isOpen={isIndividualPrint}
  onClose={() => setIsIndividualPrint(false)}
  data={data}
  fromSI={fromSI}
  toSI={toSI}
/> */}


      </div>

      <SmallSizedModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintMode("");
          setFromSI("");
          setToSI("");
        }}
        title="Print Marriage"
      >
        <div className="p-4">

          {!printMode && (
            <>
              <p className="text-center font-medium mb-6">
                Do you want to Print as
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  // onClick={() => setPrintMode("individual")}
                  className="px-4 py-2 bg-lavender--600 text-white rounded"
                >
                  Print Label
                </button>
                <button
                  onClick={() => setPrintMode("individual")}
                  className="px-4 py-2 bg-lavender--600 text-white rounded"
                >
                  Print Individual
                </button>
              </div>
            </>
          )}

          {printMode === "individual" && (
            <>
              <div className="grid grid-cols-2 gap-6 mt-4 justify-items-center">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    From (SI No)
                  </label>
                  <input
                    type="text"
                    value={fromSI}
                    onChange={(e) => setFromSI(e.target.value.replace(/\D/g, ""))}
                    className="border p-1 rounded w-24 text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    To (SI No)
                  </label>
                  <input
                    type="text"
                    value={toSI}
                    onChange={(e) => setToSI(e.target.value.replace(/\D/g, ""))}
                    className="border p-1 rounded w-24 text-center"
                  />
                </div>

              </div>

              <div className="text-center mt-4 font-semibold text-gray-700">
                {fromSI && toSI
                  ? `Total ${Math.max(0, Number(toSI) - Number(fromSI) + 1)} Members`
                  : `Total ${totalCount} Members`
                }
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    if (!fromSI || !toSI) return;
                    setIsIndividualPrint(true);
                  }}
                  className="px-4 py-2 bg-lavender--600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </>
          )}

        </div>
      </SmallSizedModal>



      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}

    </>

  );
};

export default ReportPage;
