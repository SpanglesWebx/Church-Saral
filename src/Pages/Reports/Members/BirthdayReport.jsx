import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import moment from 'moment';


import { URL } from "../../../App";


import { FaFilePdf, FaPrint } from "react-icons/fa";

import { FailedMessage, SuccessMessage } from '../../../Components/ToastMessage';
import Pagination from "../../../Components/Helpers/Pagination";
import { jwtDecode } from "jwt-decode";

// import BirthdayPreviewModal from "./BirthdayPreviewModal";
// import SmallSizedModal from "../Expense/SmallSizedModal";
// import BirthdayIndividualModal from "./BirthdayIndividualModal";



const ReportPage = () => {

    const [Response, setResponse] = useState({ status: null, message: "" });
    const token = window.sessionStorage.getItem("token");


    const [data, setData] = useState([]);


    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");


    const [filteredData, setFilteredData] = useState([]);

    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const componentRef = useRef();

    const [showTamilOnly, setShowTamilOnly] = useState(false);
    const [total, setTotal] = useState(0);

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const [userRole, setUserRole] = useState("");

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState("");

    const [fromSI, setFromSI] = useState("");
    const [toSI, setToSI] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    const [previewData, setPreviewData] = useState([]);
    const [allBirthdayData, setAllBirthdayData] = useState([]);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const [isIndividualPrint, setIsIndividualPrint] = useState(false);


    const [isPrinting, setIsPrinting] = useState(false);


    const [loadingAction, setLoadingAction] = useState(null);
    // "pdf" | "print" | null


    const handleBirthdayPreview = async () => {
        try {
            setIsPreviewOpen(true);
            setIsLoadingPreview(true);

            const response = await axios.get(`${URL}/reports/birthday`, {
                params: {
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    fromdate: dateRange.from,
                    todate: dateRange.to,
                    search: searchTerm || undefined,
                    page: 1,
                    limit: 10000,
                }
            });

            const sorted = sortBirthdayData(response.data.Birthday || []);
            setPreviewData(sorted);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    useEffect(() => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);

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

        const from = startOfWeek.format("YYYY-MM-DD");
        const to = endOfWeek.format("YYYY-MM-DD");

        setDateRange({ from, to });

    }, []);


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

    const fetchTotalByDate = async () => {
        try {
            const res = await axios.get(`${URL}/reports/birthday`, {
                params: {
                    fromdate: dateRange.from,
                    todate: dateRange.to,
                    page: 1,
                    limit: 1
                }
            });

            setTotalCount(res.data.total || 0);

        } catch (err) {
            console.error(err);
        }
    };

    const handleFromChange = (value) => {
        setDateRange((prev) => ({
            ...prev,
            from: value
        }));
    };

    const handleToChange = (value) => {
        setDateRange((prev) => ({
            ...prev,
            to: value
        }));
    };

    const abortControllerRef = useRef(new AbortController());

    const sortBirthdayData = (list = []) => {

        const getPriority = (name = "") => {
            const first = name.trim().charAt(0);
            if (/^[A-Za-z]/.test(first)) return 1;
            if (/^[0-9]/.test(first)) return 2;
            return 3;
        };

        return [...list].sort((a, b) => {

            const da = moment(a.dob).format("MM-DD");
            const db = moment(b.dob).format("MM-DD");

            if (da !== db) return da.localeCompare(db);

            const pa = getPriority(a.member_name);
            const pb = getPriority(b.member_name);

            if (pa !== pb) return pa - pb;

            return (a.member_name || "")
                .trim()
                .localeCompare((b.member_name || "").trim());

        });
    };

    const fetchData = async () => {

        try {

            const response = await axios.get(`${URL}/reports/birthday`, {
                params: {
                    status: statusFilter !== "All" ? statusFilter : undefined,
                    fromdate: dateRange.from || "",
                    todate: dateRange.to || "",
                    search: searchTerm || undefined,
                    page: CurrentPage,
                    limit: rowsPerPage
                },
                headers: { Authorization: token },
                signal: abortControllerRef.current.signal
            });

            const result = response.data.Birthday || [];

            setData(result);
            setFilteredData(result);
            setTotal(response.data.total || 0);
            setTotalPages(response.data.totalPages || 1);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching data:', error);
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

        }, 100);

        return () => {
            clearTimeout(debounceFetchData.current);
        };

    }, [statusFilter, searchTerm, CurrentPage, rowsPerPage]);

    useEffect(() => {

        if (!dateRange.from || !dateRange.to) return;

        clearTimeout(debounceFetchData.current);

        debounceFetchData.current = setTimeout(() => {

            abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            fetchData();

        }, 200);

    }, [dateRange]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange]);
    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const showToast = (status, message) => {
        setResponse({ status: null, message: "" });
        setTimeout(() => setResponse({ status, message }), 10);
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    };

    const downloadBirthdayPDF = async () => {

        try {

            setLoadingAction("pdf");

            const res = await axios.get(
                `${URL}/reports/birthday/pdf`,
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
            link.download = "BirthdayReport.pdf";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {

            showToast("Failed", "Birthday PDF download failed");

        } finally {

            setLoadingAction(null);

        }
    };


    const printBirthdayReport = async () => {
        try {

            const res = await axios.get(
                `${URL}/reports/birthday/pdf`,
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

            const file = new Blob([res.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);

            const printWindow = window.open(fileURL);

            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [rowsPerPage]);


    return (

        <>
            <div className="relative h-auto bg-gray-100">

                <div className="p-4 bg-white rounded-lg shadow-md">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-4">

                        <h2 className="text-2xl font-semibold text-lavender--600">
                            Birthday Reports
                        </h2>



                        <div className="flex gap-x-5">

                            <button
                                onClick={downloadBirthdayPDF}
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

                                    <th className="p-2 text-center">
                                        Member ID
                                    </th>

                                    <th className="p-2 text-left">
                                        Member Name
                                    </th>

                                    <th className="p-2 text-left">
                                        Member Tamil Name
                                    </th>

                                    <th className="p-2 text-center">
                                        DOB
                                    </th>

                                    <th className="p-2 text-center">
                                        AGE
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

                                            <td className="p-2 text-center">
                                                {item.member_id}
                                            </td>

                                            <td className="p-2 text-left">
                                                {item.member_name}
                                            </td>

                                            <td className="p-2 text-left">
                                                {item.member_tamil_name}
                                            </td>

                                            <td className="p-2 text-center">
                                                {moment(item.dob).format("DD-MM-YYYY")}
                                            </td>

                                            <td className="p-2 text-center">
                                                {moment().diff(moment(item.dob), "years")}
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">
                                            No Members Found
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

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
            </div>

            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}

        </>
    );
};

export default ReportPage;