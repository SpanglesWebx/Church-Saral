import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { URL } from "../../App";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import { FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Ledger = () => {
    const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");

    const [userRole, setUserRole] = useState("");

    const [accountType, setAccountType] = useState("");
    const [incomeType, setIncomeType] = useState("ASSESSABLE");

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [ledgerList, setLedgerList] = useState([]);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingLedger, setLoadingLedger] = useState(false);

    const [confirmModal, setConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [modalText, setModalText] = useState("");


    /* ===============================
       GET USER ROLE
    =============================== */
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

    /* ===============================
       FETCH CATEGORIES
    =============================== */
    const fetchCategories = async () => {
        if (!accountType) return;

        setLoadingCategories(true);

        try {
            const query = encodeURIComponent(accountType);

            const res = await axios.get(
                `${URL}/ledger-category/categories?accountType=${query}${accountType === "Income" ? `&incomeType=${incomeType}` : ""
                }`,
                { headers: { Authorization: token } }
            );

            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
        }

        setLoadingCategories(false);
    };

    // useEffect(() => {
    //     fetchCategories();
    //     setSelectedCategory(null);
    //     setLedgerList([]);
    // }, [accountType, incomeType]);


    useEffect(() => {
        // 🔴 If accountType is empty → reset everything
        if (!accountType) {
            setCategories([]);
            setSelectedCategory(null);
            setLedgerList([]);
            return;
        }

        // ✅ Otherwise fetch normally
        fetchCategories();
        setSelectedCategory(null);
        setLedgerList([]);
    }, [accountType, incomeType]);

    /* ===============================
       FETCH LEDGERS
    =============================== */
    const fetchLedgers = async (id) => {
        if (!id) return;

        setLoadingLedger(true);

        try {
            const res = await axios.get(
                `${URL}/ledger-category/ledgers/${id}`,
                { headers: { Authorization: token } }
            );

            setLedgerList(res.data?.ledgers || []);
        } catch (err) {
            console.error(err);
        }

        setLoadingLedger(false);
    };


    const toggleCategory = async (id) => {
        try {
            const res = await axios.patch(
                `${URL}/ledger-category/category/${id}/status`,
                {},
                { headers: { Authorization: token } }
            );

            const updated = res.data.category;

            setCategories(prev =>
                prev.map(c => (c._id === id ? updated : c))
            );

            if (selectedCategory?._id === id) {
                setSelectedCategory(updated);
                setLedgerList(updated.ledgers || []);
            }

        } catch (err) {
            console.log(err);
        }
    };

    const toggleLedger = async (categoryId, ledgerCode) => {
        try {
            const res = await axios.patch(
                `${URL}/ledger-category/ledger/${categoryId}/${ledgerCode}/status`,
                {},
                { headers: { Authorization: token } }
            );

            const updatedLedger = res.data.ledger;

            setLedgerList(prev =>
                prev.map(l => (l.code === ledgerCode ? updatedLedger : l))
            );

        } catch (err) {
            console.log(err);
        }
    };

    const capitalize = (text) =>
        text.charAt(0).toUpperCase() + text.slice(1);

    const askToggleCategory = (category) => {
        const nextStatus = category.status === "active" ? "inactive" : "active";

        setModalText(
            <>
                Are you sure you want{" "}
                <strong
                    style={{
                        color: nextStatus === "active" ? "green" : "red",
                    }}
                >
                    {capitalize(nextStatus)}
                </strong>{" "}
                this <strong>{category.name}</strong>?
            </>
        );

        setPendingAction(() => () => toggleCategory(category._id));
        setConfirmModal(true);
    };

    const askToggleLedger = (ledger) => {
        if (selectedCategory?.status !== "active") return;

        const nextStatus = ledger.status === "active" ? "inactive" : "active";

        setModalText(
            <>
                Are you sure you want{" "}
                <strong
                    style={{
                        color: nextStatus === "active" ? "green" : "red",
                    }}
                >
                    {capitalize(nextStatus)}
                </strong>{" "}
                this <strong>{ledger.name}</strong>?
            </>
        );

        setPendingAction(() =>
            () => toggleLedger(selectedCategory._id, ledger.code)
        );

        setConfirmModal(true);
    };

    useEffect(() => {
        if (selectedCategory) {
            fetchLedgers(selectedCategory._id);
        }
    }, [selectedCategory]);

    const Switch = ({ checked, onChange, disabled }) => {
        return (
            <div
                onClick={!disabled ? onChange : undefined}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
      ${disabled ? "bg-gray-200 cursor-not-allowed" : checked ? "bg-lavender--600 cursor-pointer" : "bg-gray-300 cursor-pointer"}`}
            >
                <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${checked ? "translate-x-6" : "translate-x-0"
                        }`}
                />
            </div>
        );
    };

    const downloadLedgerPDF = async () => {
        try {
            const res = await axios.get(
                `${URL}/ledger-category/download-ledger-report`,
                { headers: { Authorization: token } }
            );

            const data = res.data?.data || [];

            const doc = new jsPDF("p", "mm", "a4");

            let pageWidth = doc.internal.pageSize.getWidth();

            // 🔹 TITLE
            doc.setFontSize(14);
            doc.text("LEDGER CATEGORY REPORT", pageWidth / 2, 10, { align: "center" });

            let y = 15;

            data.forEach((cat, index) => {
                // 🔸 CATEGORY HEADER BOX
                doc.setFontSize(10);

                doc.text(`Account Type : ${cat.accountType}`, 10, y);
                doc.text(`Income Type : ${cat.incomeType}`, 110, y);
                y += 5;

                doc.text(`Category Name : ${cat.name}`, 10, y);
                doc.text(`Status : ${cat.status}`, 110, y);
                y += 5;

                doc.text(`Depreciation % : ${cat.depreciationPercent}`, 10, y);
                y += 5;

                // 🔸 LEDGER TABLE
                autoTable(doc, {
                    startY: y,
                    head: [["Code", "Ledger Name", "Status"]],
                    body: cat.ledgers.map(l => [
                        l.code,
                        l.name,
                        l.status
                    ]),
                    theme: "grid",
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [200, 200, 200] },
                    margin: { left: 10, right: 10 },
                });

                y = doc.lastAutoTable.finalY + 8;

                // 🔸 PAGE BREAK
                if (y > 260) {
                    doc.addPage();
                    y = 10;
                }
            });

            // 🔹 PAGE NUMBER (CENTER BOTTOM)
            const pageCount = doc.getNumberOfPages();

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);

                doc.setFontSize(9);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    290,
                    { align: "center" }
                );
            }

            doc.save("Ledger_Category_Report.pdf");

        } catch (err) {
            console.error("PDF Error:", err);
        }
    };

    return (
        <>
            <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
                <div className="flex flex-wrap items-center justify-between gap-3 p-2">


                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Ledgers
                    </h1>

                    {/* <FaFilePdf
  size={22}
  className="text-red-500 hover:text-red-600 cursor-pointer transition"
  title="Download PDF"
  onClick={downloadLedgerPDF}
/> */}
                </div>
                <div className="flex items-center justify-end p-4">



                    {["admin", "churchadmin"].includes(userRole) && (
                        <button
                            onClick={() =>
                                navigate("/admin/ledgers/AddTypesofLedger")
                            }
                            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Create Ledgers
                        </button>
                    )}
                </div>



                {/* ACCOUNT TYPE */}
                <div className="px-4 pt-4">

                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >

                        {/* ACCOUNT TYPE */}
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500">
                                Account Type
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <select
                                value={accountType}
                                onChange={(e) => {
                                    setAccountType(e.target.value);

                                    if (e.target.value !== "Income") {
                                        setIncomeType("ASSESSABLE");
                                    }
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            >
                                <option value="">Select Account Type</option>
                                <option value="Capital A/c">Capital A/c</option>
                                <option value="Assets-Fixed Assets">Assets-Fixed Assets</option>
                                <option value="Assets-Current Assets">Assets-Current Assets</option>
                                <option value="Assets-Investments & Deposits">
                                    Assets-Investments & Deposits
                                </option>
                                <option value="Liabilities-Current Liabilities and Provisions">
                                    Liabilities-Current Liabilities and Provisions
                                </option>
                                <option value="Liabilities-Funds">Liabilities-Funds</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>

                        {/* INCOME TYPE */}
                        <div className="w-full">
                            {accountType === "Income" ? (
                                <>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Income Type
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <div className="mt-2 flex justify-center">
                                        <div className="relative flex bg-gray-200 rounded-full text-sm font-medium w-full max-w-xs h-[35px]">

                                            {/* SLIDER */}
                                            <div
                                                className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                                style={{
                                                    width: "calc(50% - 0.25rem)",
                                                    transform:
                                                        incomeType === "ASSESSABLE"
                                                            ? "translateX(0)"
                                                            : "translateX(100%)",
                                                }}
                                            />

                                            {/* BUTTONS */}
                                            <button
                                                type="button"
                                                onClick={() => setIncomeType("ASSESSABLE")}
                                                className={`relative flex-1 h-full flex items-center justify-center rounded-full ${incomeType === "ASSESSABLE"
                                                    ? "text-white font-semibold"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                Assessable Income
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setIncomeType("NON_ASSESSABLE")}
                                                className={`relative flex-1 h-full flex items-center justify-center rounded-full ${incomeType === "NON_ASSESSABLE"
                                                    ? "text-white font-semibold"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                Non-Assessable Income
                                            </button>

                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-[58px]" />
                            )}
                        </div>

                    </div>
                </div>

                {/* MAIN TWO PANEL LAYOUT */}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4">
                    {/* LEFT SIDE */}

                    <div className="bg-white border rounded-xl shadow-sm h-[500px] flex flex-col min-h-0">

                        {/* HEADER */}
                        <div className="px-4 py-3 border-b font-semibold text-gray-700 bg-gray-50 rounded-t-xl">
                            Categories
                        </div>



                        {/* LIST */}
                        <div className="flex-1 flex flex-col p-3 overflow-hidden">

                            {/* SCROLL BOX */}
                            <div className="flex-1 border rounded-lg overflow-hidden min-h-0">

                                <div className="h-full overflow-y-auto min-h-0">

                                    {loadingCategories ? (
                                        <p className="p-4 text-sm text-gray-400">Loading...</p>
                                    ) : categories.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-400">No categories</p>
                                    ) : (
                                        <table className="w-full text-sm">

                                            {/* HEADER */}
                                            <thead className="bg-gray-100 sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-3 text-left">Name</th>
                                                    <th className="p-3 text-left">Dep %</th>
                                                    <th className="p-3 text-left">Status</th>
                                                    <th className="p-3 text-left">Action</th>
                                                </tr>
                                            </thead>

                                            {/* BODY */}
                                            <tbody>
                                                {categories.map((c) => (
                                                    <tr
                                                        key={c._id}
                                                        onClick={() => setSelectedCategory(c)}
                                                        className={`border-b cursor-pointer transition ${selectedCategory?._id === c._id
                                                            ? "bg-lavender--50"
                                                            : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <td className="p-3 font-medium text-gray-800">
                                                            {c.name}
                                                        </td>

                                                        <td className="p-3 text-gray-600">
                                                            {c.depreciationPercent || 0}%
                                                        </td>

                                                        <td className="p-3">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs ${c.status === "active"
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-red-100 text-red-500"
                                                                    }`}
                                                            >
                                                                {c.status}
                                                            </span>
                                                        </td>

                                                        <td
                                                            className="p-3"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Switch
                                                                checked={c.status === "active"}
                                                                onChange={() => askToggleCategory(c)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    )}

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="bg-white border rounded-xl shadow-sm h-[500px] flex flex-col min-h-0">

                        {selectedCategory ? (
                            <>
                                {/* HEADER */}
                                <div className="px-5 py-3 border-b bg-gray-50 rounded-t-xl">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {selectedCategory.name}
                                    </h2>

                                </div>

                                {/* LIST */}
                                <div className="flex-1 flex flex-col p-3 overflow-hidden">

                                    {/* SCROLL CONTAINER */}
                                    <div className="flex-1 border rounded-lg overflow-hidden min-h-0">

                                        <div className="h-full overflow-y-auto">

                                            {loadingLedger ? (
                                                <p className="p-4 text-sm text-gray-400">Loading...</p>
                                            ) : ledgerList.length === 0 ? (
                                                <p className="p-4 text-sm text-gray-400">
                                                    No ledgers found
                                                </p>
                                            ) : (
                                                <table className="w-full text-sm">

                                                    {/* HEADER */}
                                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="p-3 text-left">Code</th>
                                                            <th className="p-3 text-left">Name</th>
                                                            <th className="p-3 text-left">Opening Balance</th>
                                                            <th className="p-3 text-left">Status</th>
                                                            <th className="p-3 text-left">Action</th>
                                                        </tr>
                                                    </thead>

                                                    {/* BODY */}
                                                    <tbody>
                                                        {ledgerList.map((l) => (
                                                            <tr
                                                                key={l.code}
                                                                className="border-b hover:bg-gray-50 transition"
                                                            >
                                                                {/* CODE */}
                                                                <td className="p-3 text-xs font-medium text-gray-500">
                                                                    {l.code}
                                                                </td>

                                                                {/* NAME */}
                                                                <td className="p-3 text-sm font-medium text-gray-800">
                                                                    {l.name}
                                                                </td>

                                                                {/* opening Balance */}
                                                                <td className="p-3 text-xs text-gray-500">
                                                                    {l.openingBalance ? (
                                                                        <div className="flex flex-col">
                                                                            <span className="text-green-600 font-medium">
                                                                                ₹ {l.openingBalance}
                                                                            </span>

                                                                            <span className="text-[10px] text-gray-400">
                                                                                {l.openingBalanceDate
                                                                                    ? new Date(l.openingBalanceDate).toLocaleDateString()
                                                                                    : "-"}
                                                                            </span>
                                                                        </div>
                                                                    ) : "-"}
                                                                </td>

                                                                {/* STATUS */}
                                                                <td className="p-3">
                                                                    <span
                                                                        className={`text-xs px-2 py-1 rounded-full ${l.status === "active"
                                                                            ? "bg-green-100 text-green-600"
                                                                            : "bg-red-100 text-red-500"
                                                                            }`}
                                                                    >
                                                                        {l.status}
                                                                    </span>
                                                                </td>

                                                                {/* SWITCH */}
                                                                <td className="p-3">
                                                                    <Switch
                                                                        checked={l.status === "active"}
                                                                        disabled={selectedCategory?.status !== "active"}
                                                                        onChange={() => askToggleLedger(l)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                </table>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Select a category to view ledgers
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <SmallSizedModal
                isOpen={confirmModal}
                onClose={() => setConfirmModal(false)}
                title="Confirmation"
            >
                <p className="text-sm text-gray-700">{modalText}</p>

                <div className="flex justify-end gap-3 mt-4">
                    {/* <button
      onClick={() => setConfirmModal(false)}
      className="px-4 py-2 bg-gray-300 rounded"
    >
      Cancel
    </button> */}

                    <button
                        onClick={() => {
                            if (pendingAction) pendingAction();
                            setConfirmModal(false);
                        }}
                        className="px-4 py-2 bg-lavender--600 text-white rounded"
                    >
                        Yes
                    </button>
                </div>
            </SmallSizedModal>

        </>
    );
};