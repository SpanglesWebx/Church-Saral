import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";

export const AddTypesofLedgers = () => {
    const token = window.sessionStorage.getItem("token");
    const navigate = useNavigate();      

    /* ===============================
       LEFT SIDE (CATEGORY / GROUP)
    =============================== */
    const [categories, setCategories] = useState([]);
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [nextLedgerCode, setNextLedgerCode] = useState("");


    /* ===============================
       ACCOUNT TYPE (ASSESSABLE / NON)
    =============================== */
    const [accountType, setAccountType] = useState("");
    const [incomeType, setIncomeType] = useState("ASSESSABLE");

    /* ===============================
       RIGHT SIDE (LEDGERS)
    =============================== */
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [ledgerList, setLedgerList] = useState([]);
    const [input, setInput] = useState("");
    const [showLedgerInput, setShowLedgerInput] = useState(false);
    const [savingLedger, setSavingLedger] = useState(false);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const isBusy = addingCategory || savingLedger;

    // ⭐ depreciation modal state
    const [showDepModal, setShowDepModal] = useState(false);
    const [depCategory, setDepCategory] = useState("");
    const [depPercent, setDepPercent] = useState("");


    // ⭐ ledger depreciation modal
    const [showLedgerDepModal, setShowLedgerDepModal] = useState(false);
    const [depLedgerCategory, setDepLedgerCategory] = useState("");
    const [depLedger, setDepLedger] = useState("");
    const [depDate, setDepDate] = useState("");
    const [depLedgerPercent, setDepLedgerPercent] = useState("");
    const [categoryLedgers, setCategoryLedgers] = useState([]);


    const [newDepPercent, setNewDepPercent] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");



    useEffect(() => {
        const blockRefresh = (e) => {
            if (isBusy) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", blockRefresh);
        return () => window.removeEventListener("beforeunload", blockRefresh);
    }, [isBusy]);

    useEffect(() => {
        if (!selectedCategory) return;

        axios
            .get(`${URL}/ledger-category/ledgers/${selectedCategory._id}/next-code`, {
                headers: { Authorization: token }
            })
            .then(res => setNextLedgerCode(res.data.next));
    }, [selectedCategory]);

    /* ===============================
       COMMON / UI
    =============================== */
    const [Response, setResponse] = useState({ status: null, message: "" });
    const categoryInputRef = useRef(null);

    /* ===============================
       AUTO FOCUS CATEGORY INPUT
    =============================== */
    useEffect(() => {
        if (showAdd && categoryInputRef.current) {
            categoryInputRef.current.focus();
        }
    }, [showAdd]);

    /* ===============================
       FETCH CATEGORIES (BY ACCOUNT TYPE)
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
            setResponse({
                status: "Failed",
                message: "Failed to load categories",
            });
        } finally {
            setLoadingCategories(false);
        }
    };



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
       ADD CATEGORY (WITH ACCOUNT TYPE)
    =============================== */
    const addCategory = async () => {
        if (!newCategory.trim()) {
            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Failed",
                    message: "Category name required",
                });
            }, 10);

            setTimeout(() => {
                setResponse({ status: null, message: "" });
            }, 3000);
            return;
        }
        if (addingCategory) return;
        setAddingCategory(true);

        try {
            await axios.post(
                `${URL}/ledger-category/categories/add`,
                {
                    name: newCategory.trim(),
                    accountType,
                    incomeType: accountType === "Income" ? incomeType : null,
                    depreciationPercent: newDepPercent || 0
                },
                { headers: { Authorization: token } }
            );

            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Success",
                    message: "Category added",
                });
            }, 10);

            setNewCategory("");
            setNewDepPercent("");
            setShowAdd(true);
            fetchCategories();
        } catch (err) {
            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Failed",
                    message:
                        err.response?.data?.message || "Failed to add category",
                });
            }, 10);
        } finally {
            setAddingCategory(false);
            setTimeout(() => {
                setResponse({ status: null, message: "" });
            }, 3000);
        }
    };

    const handleCategoryKeyDown = (e) => {
        if (e.key === "Enter" && newCategory.trim()) {
            e.preventDefault();


            if (!newDepPercent) {
                setResponse({
                    status: "Failed",
                    message: "Enter Depreciation %",
                });
                return;
            }
            addCategory();
        }
    };

    /* ===============================
       FETCH LEDGERS FOR CATEGORY
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
            setResponse({
                status: "Failed",
                message: "Failed to load ledgers",
            });
        }

        setLoadingLedger(false);
    };

    useEffect(() => {
        if (selectedCategory) {
            fetchLedgers(selectedCategory._id);
        }
    }, [selectedCategory]);

    /* ===============================
       ADD LEDGER (ENTER / TAB)
    =============================== */
    const handleKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
            e.preventDefault();

            setLedgerList(prev => [
                ...prev,
                {
                    name: input.trim(),
                    code: nextLedgerCode,   // 🔥 AUTO APPEND LIKE BAPTISM ID
                    openingBalance: Number(openingBalance) || 0
                }
            ]);

            // increment locally for UI preview only
            const prefix = nextLedgerCode.replace(/\d/g, "");
            const num = Number(nextLedgerCode.replace(/\D/g, "")) + 1;
            setNextLedgerCode(prefix + String(num).padStart(4, "0"));

            setInput("");
            setOpeningBalance("");
        }
    };


    /* ===============================
       SAVE LEDGERS
    =============================== */
    const saveLedgers = async () => {
        if (!selectedCategory) {
            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Failed",
                    message: "Select a category first",
                });
            }, 10);

            setTimeout(() => {
                setResponse({ status: null, message: "" });
            }, 3000);
            return;
        }
        if (savingLedger) return;

        setSavingLedger(true);

        try {
            await axios.post(
                `${URL}/ledger-category/ledgers/${selectedCategory._id}/save`,
                {
                    ledgers: ledgerList // ✅ ONLY NAMES
                },
                { headers: { Authorization: token } }
            );

            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Success",
                    message: "Saved successfully",
                });
            }, 10);
        } catch (err) {
            setResponse({ status: null, message: "" });
            setTimeout(() => {
                setResponse({
                    status: "Failed",
                    message: "Failed to save ledgers",
                });
            }, 10);
        } finally {
            setSavingLedger(false);
            setTimeout(() => {
                setResponse({ status: null, message: "" });
            }, 3000);
        }
    };

    const saveDepreciation = async () => {
        if (!depCategory || !depPercent) {
            setResponse({
                status: "Failed",
                message: "Fill all fields"
            });
            return;
        }

        try {
            await axios.post(`${URL}/ledger-category/set-depreciation`, {
                categoryId: depCategory,
                depreciationPercent: depPercent
            }, {
                headers: { Authorization: token }
            });

            await fetchCategories();

            setResponse({
                status: "Success",
                message: "Depreciation saved"
            });

            setShowDepModal(false);
            setDepCategory("");
            setDepPercent("");

        } catch (err) {
            setResponse({
                status: "Failed",
                message: "Failed to save depreciation"
            });
        }
    };

    const saveLedgerDepreciation = async () => {
        if (!depLedgerCategory || !depLedger || !depDate || !depLedgerPercent) {
            setResponse({ status: "Failed", message: "Fill all fields" });
            return;
        }

        try {
            await axios.post(`${URL}/ledger-category/set-ledger-depreciation`, {
                categoryId: depLedgerCategory,
                ledgerCode: depLedger,
                depreciationValue: depLedgerPercent,
                depreciationDate: depDate
            }, {
                headers: { Authorization: token }
            });

            setResponse({ status: "Success", message: "Saved successfully" });

            setShowLedgerDepModal(false);
            setDepLedgerCategory("");
            setDepLedger("");
            setDepDate("");
            setDepLedgerPercent("");

        } catch (err) {
            setResponse({ status: "Failed", message: "Failed to save" });
        }
    };


    const fetchCategoryLedgers = async (categoryId) => {
        if (!categoryId) return;

        try {
            const res = await axios.get(
                `${URL}/ledger-category/ledgers/${categoryId}`,
                { headers: { Authorization: token } }
            );

            setCategoryLedgers(res.data.ledgers || []);
        } catch (err) {
            console.log(err);
        }
    };



    const toTitleCase = (value) => {
        return value
            .split(" ")
            .map(word => {
                // keep abbreviations as-is (LIC, PF, GST)
                if (word === word.toUpperCase() && word.length > 1) {
                    return word;
                }

                // normal title case
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ");
    };



    return (
        <>
            <div className={`${isBusy ? "pointer-events-none opacity-60" : ""}`}>
                <FaArrowLeft
                    size={18}
                    title='Back'
                    onClick={() => navigate("/admin/ledgers")}
                    className="cursor-pointer mb-4"
                />
                <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
                    <div className="flex items-center justify-between p-4">

                        <h1 className="text-xl font-bold capitalize text-lavender--600">
                            Add Types of Ledgers
                        </h1>
                    </div>
                    <div className="px-4 pt-4">

                        {/* ✅ ONE GRID FOR TOP + BOTTOM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* ========================= */}
                            {/* 🔹 ACCOUNT TYPE */}
                            {/* ========================= */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Type <span className='text-red-500 font-bold text-[17px]'>*</span>
                                </label>

                                <select
                                    value={accountType}
                                    onChange={(e) => {
                                        setAccountType(e.target.value);

                                        if (e.target.value !== "Income") {
                                            setIncomeType("ASSESSABLE");
                                        }
                                    }}
                                    className="block w-full mt-1 h-[42px] px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">Select Account Type</option>
                                    <option value="Capital A/c">Capital A/c</option>
                                    <option value="Assets-Fixed Assets">Assets-Fixed Assets</option>
                                    <option value="Assets-Current Assets">Assets-Current Assets</option>
                                    <option value="Assets-Investments & Deposits">Assets-Investments & Deposits</option>
                                    <option value="Liabilities-Current Liabilities and Provisions">Liabilities-Current Liabilities and Provisions</option>
                                    <option value="Liabilities-Funds">Liabilities-Funds</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>

                            {/* ========================= */}
                            {/* 🔹 INCOME TYPE */}
                            {/* ========================= */}
                            <div className="w-full">
                                {accountType === "Income" ? (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Income Type
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <div className="mt-2 flex justify-center">
                                            {/* <div className="relative flex bg-gray-200 rounded-full text-sm font-medium w-full h-[42px]"> */}
                                            <div className="relative flex bg-gray-200 rounded-full text-sm font-medium w-full max-w-xs h-[35px]">

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

                                                <button
                                                    type="button"
                                                    onClick={() => setIncomeType("ASSESSABLE")}
                                                    className={`relative flex-1 h-full flex items-center justify-center ${incomeType === "ASSESSABLE"
                                                        ? "text-white font-semibold"
                                                        : "text-gray-700"
                                                        }`}
                                                >
                                                    Assessable Income
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setIncomeType("NON_ASSESSABLE")}
                                                    className={`relative flex-1 h-full flex items-center justify-center ${incomeType === "NON_ASSESSABLE"
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
                                    <div className="h-[42px]" />
                                )}
                            </div>




                            {/* LEFT PANEL - CATEGORY SIDEBAR */}
                            <div className="bg-white border rounded-xl shadow-sm h-[520px] flex flex-col min-h-0">

                                {/* TOP ACTION */}
                                <div className="flex items-center gap-2 p-3 border-b bg-gray-50 rounded-t-xl">

                                    <div className="flex-1">
                                        {showAdd ? (
                                            <div className="flex gap-2">

                                                {/* CATEGORY INPUT */}
                                                <input
                                                    ref={categoryInputRef}
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(toTitleCase(e.target.value))}
                                                    onKeyDown={handleCategoryKeyDown}
                                                    placeholder="Category name"
                                                    type="text"
                                                    className="w-1/2 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-lavender--400"
                                                />

                                                {/* DEP % INPUT */}
                                                <input
                                                    value={newDepPercent}
                                                    onChange={(e) => {
                                                        if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                                                            setNewDepPercent(e.target.value);
                                                        }
                                                    }}
                                                    placeholder="Dep %"
                                                    type="text"
                                                    className="w-1/2 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400"
                                                />

                                            </div>
                                        ) : null}
                                    </div>

                                    {!showAdd ? (
                                        <>
                                            <button
                                                onClick={() => setShowAdd(true)}
                                                disabled={!accountType}
                                                className={`px-3 py-2 text-xs rounded-md flex items-center gap-2
            ${!accountType
                                                        ? "bg-gray-200 text-gray-400"
                                                        : "bg-lavender--600 text-white hover:bg-lavender--700"
                                                    }`}
                                            >
                                                <FaPlus /> Category
                                            </button>


                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={addCategory}
                                                className="w-8 h-8 flex items-center justify-center border-2 border-lavender--600 text-lavender--600 rounded hover:bg-lavender--600 hover:text-white"
                                            >
                                                <FaPlus size={14} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowAdd(false);
                                                    setNewCategory("");
                                                    setNewDepPercent("");
                                                }}
                                                className="w-8 h-8 flex items-center justify-center border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* CATEGORY LIST */}
                                <div className="flex-1 flex flex-col p-3 overflow-hidden">

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
                                                           <th className="p-3 text-left">Opening</th>
                                                            <th className="p-3 text-left">Status</th>
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
                                                                {/* NAME */}
                                                                <td className="p-3">
                                                                    <p className="text-sm font-semibold text-gray-800">
                                                                        {c.name}
                                                                    </p>
                                                                </td>

                                                                {/* DEP */}
                                                                <td className="p-3">
                                                                    <p className="text-xs text-gray-500">
                                                                        {c.depreciationPercent ?? 0}%
                                                                    </p>
                                                                </td>

                                                                {/* STATUS */}
                                                                <td className="p-3">
                                                                    <span
                                                                        className={`text-xs px-2 py-1 rounded-full ${c.status === "active"
                                                                                ? "bg-green-100 text-green-600"
                                                                                : "bg-red-100 text-red-500"
                                                                            }`}
                                                                    >
                                                                        {c.status === "active" ? "Active" : "Inactive"}
                                                                    </span>
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

                            {/* RIGHT PANEL - LEDGER DETAILS */}
                            <div className="bg-white border rounded-xl shadow-sm h-[520px] flex flex-col min-h-0">

                                {/* TOP BAR */}
                                <div className="flex items-center gap-2 p-3 border-b bg-gray-50 rounded-t-xl">

                                    <div className="flex-1">
                                        {selectedCategory && showLedgerInput ? (
                                            <div className="flex gap-2">

                                                {/* 🔹 Ledger Name */}
                                                <input
                                                    value={input}
                                                    type="text"
                                                    onChange={(e) => setInput(toTitleCase(e.target.value))}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Ledger name"
                                                    className="w-1/2 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-lavender--400"
                                                />

                                                {/* 🔹 Opening Balance */}
                                                <input
                                                    value={openingBalance}
                                                    type="text"
                                                    onChange={(e) => {
                                                        if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                                                            setOpeningBalance(e.target.value);
                                                        }
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Opening Balance"
                                                    className="w-1/2 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-lavender--400"
                                                />

                                            </div>
                                        ) : null}
                                    </div>

                                    {selectedCategory && !showLedgerInput && (
                                        <>
                                            <button
                                                onClick={() => setShowLedgerInput(true)}
                                                className="px-3 py-2 text-xs bg-lavender--600 text-white rounded-md hover:bg-lavender--700 flex gap-2"
                                            >
                                                <FaPlus /> Ledger
                                            </button>


                                        </>
                                    )}

                                    {showLedgerInput && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (!input.trim()) return;

                                                    setLedgerList(prev => [
                                                        ...prev,
                                                        {
                                                            name: input.trim(),
                                                            code: nextLedgerCode,
                                                            openingBalance: Number(openingBalance) || 0
                                                        }
                                                    ]);

                                                    const prefix = nextLedgerCode.replace(/\d/g, "");
                                                    const num = Number(nextLedgerCode.replace(/\D/g, "")) + 1;
                                                    setNextLedgerCode(prefix + String(num).padStart(4, "0"));

                                                    setInput("");
                                                    setOpeningBalance("");
                                                }}
                                                className="w-8 h-8 flex items-center justify-center border-2 border-lavender--600 text-lavender--600 rounded hover:bg-lavender--600 hover:text-white"
                                            >
                                                <FaPlus size={14} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowLedgerInput(false);
                                                    setInput("");
                                                    setOpeningBalance("");
                                                }}
                                                className="w-8 h-8 flex items-center justify-center border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* LEDGER LIST */}
                                <div className="flex-1 flex flex-col p-3 overflow-hidden">

                                    <div className="flex-1 border rounded-lg overflow-hidden min-h-0">

                                        <div className="h-full overflow-y-auto min-h-0">

                                            {selectedCategory ? (
                                                <>
                                                    <div className="px-4 py-3 border-b">
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {selectedCategory.name}
                                                        </h3>
                                                    </div>

                                                    {ledgerList.length === 0 ? (
                                                        <p className="p-4 text-sm text-gray-400">No ledgers added</p>
                                                    ) : (
                                                        ledgerList.map((l, i) => (
                                                            <div
                                                                key={l.code || i}
                                                                className="flex items-center px-4 py-3 border-b hover:bg-gray-50 transition"
                                                            >
                                                                <span className="w-20 text-xs text-gray-500 font-semibold">
                                                                    {l.code}
                                                                </span>

                                                                <span className="flex-1 text-sm text-gray-800">
                                                                    {l.name}
                                                                </span>

                                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">
                                                                    ₹ {l.openingBalance || 0}
                                                                    <br />
                                                                    <span className="text-[10px] text-gray-500">
                                                                        {l.openingBalanceDate
                                                                            ? new Date(l.openingBalanceDate).toLocaleDateString()
                                                                            : ""}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}

                                                    {showLedgerInput && (
                                                        <div className="flex justify-end p-4">
                                                            <button
                                                                onClick={saveLedgers}
                                                                disabled={savingLedger}
                                                                className={`px-5 py-2 text-sm text-white rounded-md ${savingLedger ? "bg-gray-400" : "bg-lavender--600"
                                                                    }`}
                                                            >
                                                                {savingLedger ? "Saving..." : "Save"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    Select a category
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>


                    </div>


                </div>

                {Response.status &&
                    (Response.status === "Success" ? (
                        <SuccessMessage Message={Response.message} />
                    ) : (
                        <FailedMessage Message={Response.message} />
                    ))}
                {/* ⭐ DEPRECIATION MODAL */}
                {showDepModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[400px]">

                            <h2 className="text-lg font-semibold mb-4">
                                Add Depreciation
                            </h2>

                            {/* row 1 */}
                            <div className="grid grid-cols-2 gap-4 mb-4">

                                {/* select category */}
                                <select
                                    value={depCategory}
                                    onChange={(e) => setDepCategory(e.target.value)}
                                    className="border rounded p-2"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {/* depreciation */}
                                <input
                                    type="text"
                                    placeholder="Depreciation %"
                                    value={depPercent}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // allow only numbers + one dot + max 2 decimals
                                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                                            setDepPercent(value);
                                        }
                                    }}
                                    className="border rounded p-2"
                                />

                            </div>

                            {/* row 2 */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDepModal(false)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={saveDepreciation}
                                    className="px-4 py-2 bg-lavender--600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                )}


                {/* ⭐ LEDGER DEPRECIATION MODAL */}
                {showLedgerDepModal && (
                    <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">

                            {/* TITLE */}
                            <h2 className="text-lg font-semibold text-gray-800 mb-5">
                                Depreciation Value
                            </h2>

                            {/* ROW 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                {/* CATEGORY */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                                    <select
                                        value={depLedgerCategory}
                                        onChange={(e) => {
                                            setDepLedgerCategory(e.target.value);
                                            fetchCategoryLedgers(e.target.value);
                                        }}
                                        className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lavender--400"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* LEDGER */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Ledger</label>
                                    <select
                                        value={depLedger}
                                        onChange={(e) => setDepLedger(e.target.value)}
                                        className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lavender--400"
                                    >
                                        <option value="">Select Ledger</option>
                                        {categoryLedgers.map(l => (
                                            <option key={l.code} value={l.code}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            {/* ROW 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                {/* DATE */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={depDate}
                                        onChange={(e) => setDepDate(e.target.value)}
                                        className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lavender--400"
                                    />
                                </div>

                                {/* VALUE */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                                    <input
                                        type="text"
                                        placeholder="Enter value"
                                        value={depLedgerPercent}
                                        onChange={(e) => {
                                            if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                                                setDepLedgerPercent(e.target.value);
                                            }
                                        }}
                                        className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lavender--400"
                                    />
                                </div>

                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowLedgerDepModal(false)}
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={saveLedgerDepreciation}
                                    className="px-4 py-2 text-sm bg-lavender--600 text-white rounded-md hover:bg-lavender--700"
                                >
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>

        </>
    );
};
