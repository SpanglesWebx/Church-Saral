import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf, FaEye } from "react-icons/fa";
import { URL } from "../../App";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";





export const Bills = () => {

    const token = window.sessionStorage.getItem("token");

    const [activeTab, setActiveTab] = useState("overall");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [search, setSearch] = useState("");

    const [data, setData] = useState([]);


    const [showModal, setShowModal] = useState(false);
    const [familyDetails, setFamilyDetails] = useState([]);
    const [familyTotal, setFamilyTotal] = useState(0);
    const [selectedFamily, setSelectedFamily] = useState("");
    const [headName, setHeadName] = useState("");
    const [headTamil, setHeadTamil] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [pdfModal, setPdfModal] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);


    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString("en-GB") : "-";
    };



    const fetchBills = async () => {

        try {

            const res = await axios.get(`${URL}/bills/overall`, {
                params: {
                    from: fromDate,
                    to: toDate,
                    page: currentPage,        // ✅ ADD
                    limit: rowsPerPage,       // ✅ ADD
                    search
                },
                headers: { Authorization: token }
            });

            setData(res.data.data);
            setTotalPages(res.data.totalPages); // ✅ ADD

        } catch (err) {
            console.error(err);
        }

    };


    const fetchIndividualBills = async () => {

        try {

            const res = await axios.get(`${URL}/bills/individual`, {
                params: {
                    from: fromDate,
                    to: toDate,
                    page: currentPage,
                    limit: rowsPerPage,
                    search: search
                },
                headers: { Authorization: token }
            });

            setData(res.data.data);
            setTotalPages(res.data.totalPages);

        } catch (err) {
            console.error(err);
        }

    };

    useEffect(() => {

        // if date cleared → reset data
        if (!fromDate || !toDate) {

            setData([]);
            setTotalPages(1);
            setCurrentPage(1);

            return;
        }

        if (activeTab === "overall") fetchBills();

        if (activeTab === "individual") fetchIndividualBills();

    }, [fromDate, toDate, activeTab, currentPage, rowsPerPage, search]);



    const openFamilyModal = async (familyId, head_name, head_tamil) => {

        setSelectedFamily(familyId);
        setHeadName(head_name);
        setHeadTamil(head_tamil);

        const res = await axios.get(`${URL}/bills/family-details`, {
            params: {
                familyId,
                from: fromDate,
                to: toDate
            },
            headers: { Authorization: token }
        });

        setFamilyDetails(res.data.data);

        let total = 0;

        res.data.data.forEach(m => {
            m.offerings.forEach(o => {
                total += o.amount;
            });
        });

        setFamilyTotal(total);
        setShowModal(true);

    };


    const downloadPdf = async () => {

        try {

            setPdfLoading(true);

            const res = await axios.get(
                `${URL}/bills/download-pdf`,
                {
                    params: {
                        tab: activeTab,
                        from: fromDate,
                        to: toDate,
                        search: search
                    },
                    headers: { Authorization: token },
                    responseType: "blob"
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });

            const link = document.createElement("a");

            link.href = window.URL.createObjectURL(blob);

            link.download = `${activeTab}-bills-${fromDate}-to-${toDate}.pdf`;

            link.click();

        } catch (error) {

            console.error("PDF download error", error);

        }
        finally {

            setPdfLoading(false);

        }


    };



    const downloadFamilyPdf = async () => {

        try {
            setPdfLoading(true);

            const res = await axios.get(
                `${URL}/bills/family-bill-pdf`,
                {
                    params: {
                        familyId: selectedFamily,
                        from: fromDate,
                        to: toDate
                    },
                    headers: { Authorization: token },
                    responseType: "blob"
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });

            const link = document.createElement("a");

            link.href = window.URL.createObjectURL(blob);

            link.download = `${selectedFamily}-family-bill.pdf`;

            link.click();

        } catch (error) {

            console.error("Family PDF error", error);

        }
        finally {

            setPdfLoading(false);

        }

    };


    const displayRelation = (rel) => {
        if (rel === "Husband") return "Father";
        if (rel === "Wife") return "Mother";
        return rel || "";
    };
    return (

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

            <div className="p-4">

                <h1 className="text-xl font-bold text-lavender--600 mb-6 whitespace-nowrap">
                    Bills
                </h1>

                {/* FILTER BAR */}

                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">

                    {/* Search */}

                    <input
                        type="text"
                        placeholder="Search"
                        className="block py-1 text-sm text-gray-900 rounded w-64 px-3 bg-gray-50 
          border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Date Filters */}

                    <div className="flex items-end gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                From
                            </label>

                            <input
                                type="date"
                                className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50
              border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                To
                            </label>

                            <input
                                type="date"
                                className="block py-1 text-sm text-gray-900 rounded px-3 bg-gray-50
              border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* PDF */}

                    <FaFilePdf
                        className={`text-red-600 text-2xl cursor-pointer ${pdfLoading ? "opacity-40 pointer-events-none" : ""}`}
                        onClick={() => setPdfModal(true)}
                        title="Download PDF"
                    />

                </div>


                {/* TABS */}

                <div className="flex justify-center gap-10 border-b mb-6">

                    <button
                        onClick={() => setActiveTab("overall")}
                        className={`pb-2 font-semibold transition-all duration-300 relative
        ${activeTab === "overall"
                                ? "text-lavender--600 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-lavender--600 after:transition-all after:duration-300"
                                : "text-gray-600 hover:text-lavender--600"
                            }`}
                    >
                        Overall Bill
                    </button>

                    <button
                        onClick={() => setActiveTab("individual")}
                        className={`pb-2 font-semibold transition-all duration-300 relative
        ${activeTab === "individual"
                                ? "text-lavender--600 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-lavender--600 after:transition-all after:duration-300"
                                : "text-gray-600 hover:text-lavender--600"
                            }`}
                    >
                        Individual Bills
                    </button>

                </div>



              
                {/* TABLE */}
                {activeTab === "overall" && (

                    <div className="space-y-8 mt-4">

                        {data.length === 0 && (
                            <div className="text-center text-gray-500 py-10 font-medium">
                                No data found
                            </div>
                        )}

                        {data.map((fam, i) => {

                            const sortedMembers = [...(fam.members || [])].sort((a, b) => {
                                if (a.member_id === fam.head_member_id) return -1;
                                if (b.member_id === fam.head_member_id) return 1;
                                return 0;
                            });

                            const displayRelation = (rel) => {
                                if (rel === "Husband") return "Father";
                                if (rel === "Wife") return "Mother";
                                return rel || "";
                            };

                            return (

                                <div key={i} className="border rounded-md overflow-hidden">

                                    {/* FAMILY HEAD */}
                                    <div className="bg-purple-200 px-3 py-2 font-semibold">
                                        {fam.sno}. Family Head: {fam.head_name} ({fam.head_tamil}) ({fam.family_id})
                                    </div>

                                    <div className="p-3">

                                        {sortedMembers.map((m, idx) => (

                                            <div key={idx} className="mb-4">

                                                {/* MEMBER NAME */}
                                                <div className="bg-blue-100 px-2 py-1 font-medium">
                                                    {String.fromCharCode(65 + idx)}. {m.member_name} ({m.member_tamil_name}) - {m.member_id} ({displayRelation(m.relation)})
                                                </div>

                                                {/* HEADER */}
                                                <div className="grid grid-cols-3 font-semibold text-sm border-b py-1 px-2">
                                                    <span>Date</span>
                                                    <span>Amount (₹)</span>
                                                    <span>Category</span>
                                                </div>

                                                {/* OFFERINGS */}
                                                {m.offerings?.map((o, k) => (

                                                    <div key={k} className="grid grid-cols-3 text-sm py-1 px-2 border-b">

                                                        <span>
                                                            {new Date(o.date).toLocaleDateString("en-GB")}
                                                        </span>

                                                        <span>₹ {o.amount}</span>

                                                        <span>{o.type}</span>

                                                    </div>

                                                ))}

                                            </div>

                                        ))}

                                        {/* FAMILY TOTAL */}
                                        <div className="text-right font-semibold mt-2">
                                            Grand Total for this Family ₹ {fam.total}
                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                        {/* ✅ PAGINATION ADDED HERE (ONLY CHANGE) */}
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
                            defaultRows={10}   // 🔥 ONE FAMILY PER PAGE
                        />

                    </div>

                )}



                {activeTab === "individual" && (

                    <div className=" mt-4">

                        <table className="w-full text-sm text-gray-500">

                            <thead className="text-base text-gray-700 border-b">

                                <tr>
                                    <th className="p-2 text-center font-semibold">S.No</th>
                                    <th className="p-2 text-center font-semibold">Family ID</th>
                                    <th className="p-2 text-center font-semibold">Head Name</th>
                                    <th className="p-2 text-center font-semibold">Head Member ID</th>
                                    <th className="p-2 text-center font-semibold">Total</th>
                                    <th className="p-2 text-center font-semibold">Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {data.length === 0 ? (

                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-500 font-medium">
                                            No data found
                                        </td>
                                    </tr>

                                ) : (

                                    data.map((fam, i) => (
                                        <tr key={i} className="border-b">

                                            <td>
                                                {(currentPage - 1) * rowsPerPage + i + 1}
                                            </td>

                                            <td className="p-2 text-center">
                                                {fam.family_id}
                                            </td>

                                            <td className="p-2 text-left">
                                                {fam.head_name} ({fam.head_tamil})
                                            </td>

                                            <td className="p-2 text-center">
                                                {fam.head_member_id}
                                            </td>

                                            <td className="p-2 text-center font-medium">
                                                ₹ {fam.total}
                                            </td>

                                            <td className="p-2 text-center flex justify-center items-center">

                                                <FaEye
                                                    className="text-lavender--600 cursor-pointer text-lg"
                                                    onClick={() => openFamilyModal(fam.family_id, fam.head_name, fam.head_tamil)}
                                                />

                                            </td>

                                        </tr>
                                    ))

                                )}

                            </tbody>

                        </table>
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

                )}

            </div>


            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Family Bill`}
            >
                <div className="max-h-[580px] overflow-y-auto px-1">
                    <div className="flex justify-between items-center mb-5">

                        <div className="text-lg font-bold text-lavender--600">
                            {selectedFamily} ({headName} - {headTamil})
                        </div>

                        <div className="flex items-center gap-2">

                            {pdfLoading && (
                                <div className="w-4 h-4 border-2 border-lavender--600 border-t-transparent rounded-full animate-spin"></div>
                            )}

                            <FaFilePdf
                                className={`text-red-600 text-xl cursor-pointer ${pdfLoading ? "opacity-40 pointer-events-none" : ""}`}
                                onClick={downloadFamilyPdf}
                                title="Pdf Download"
                            />

                        </div>

                    </div>

                    <div className="text-sm text-gray-600 mt-1 text-center">
                        From {formatDate(fromDate)} To {formatDate(toDate)}
                    </div>
                    {[...(familyDetails || [])]
                        .sort((a, b) => b.is_head - a.is_head)
                        .map((member, index) => {

                            const offerings = (member.offerings || []).sort(
                                (a, b) => new Date(a.date) - new Date(b.date)
                            );

                            let memberTotal = offerings.reduce((sum, o) => sum + (o.amount || 0), 0);

                            return (

                                <div key={index} className="mb-6">

                                    {/* MEMBER HEADER */}

                                    <div className="font-semibold">

                                        {member.member_name} ({member.member_tamil_name}) ({displayRelation(member.relationship)})
                                    </div>

                                    <div className="text-sm mb-2">
                                        {member.member_id}
                                    </div>


                                    {/* MEMBER TABLE */}

                                    <table className="w-full text-sm text-gray-500 mb-3">

                                        <thead className="text-base text-gray-700 border-b">

                                            <tr>
                                                <th className="p-2 text-center font-semibold w-[60px]">Sl.No</th>
                                                <th className="p-2 text-left font-semibold">Category</th>
                                                <th className="p-2 text-center font-semibold w-[150px]">Date of Payment</th>
                                                <th className="p-2 text-right font-semibold w-[120px]">Amount (₹)</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {offerings.length > 0 ? (

                                                offerings.map((o, k) => (

                                                    <tr key={k} className="border-b">

                                                        <td className="p-2 text-center">
                                                            {k + 1}
                                                        </td>

                                                        <td className="p-2 text-left">
                                                            {o.category || o.type}
                                                        </td>

                                                        <td className="p-2 text-center">
                                                            {o.date ? new Date(o.date).toLocaleDateString("en-GB") : "-"}
                                                        </td>

                                                        <td className="p-2 text-right">
                                                            {o.amount || 0}
                                                        </td>

                                                    </tr>

                                                ))

                                            ) : (

                                                <tr>
                                                    <td colSpan="4" className="text-center p-2 text-gray-400">
                                                        No offerings found
                                                    </td>
                                                </tr>

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )

                        })}

                    {/* FAMILY TOTAL */}

                    <div className="text-right font-semibold mt-4">
                        Grand Total (₹) : {familyTotal}
                    </div>
                </div>

            </Modal>




            <Modal
                isOpen={pdfModal}
                onClose={() => setPdfModal(false)}
                title="Download Bills PDF"
            >

                <div className="text-center space-y-4">

                    <p>
                        Are you sure you want to download
                        <b>{activeTab === "overall" ? " Overall Bills " : " Individual Bills "}</b>
                    </p>

                    <p>
                        From {formatDate(fromDate)} To {formatDate(toDate)}
                    </p>

                    <div className="flex justify-center gap-4">


                        <button
                            className="px-4 py-2 bg-lavender--600 text-white rounded flex items-center gap-2"
                            onClick={downloadPdf}
                            disabled={pdfLoading}
                        >

                            {pdfLoading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}

                            {pdfLoading ? "Generating PDF..." : "Yes Download"}

                        </button>

                    </div>

                </div>

            </Modal>



        </div>



    );
};