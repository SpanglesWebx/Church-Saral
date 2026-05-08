
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaPlus, FaEye } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";

export const SundayAuction = () => {

    /* ================================
       STATES
    ================================== */

    const token = window.sessionStorage.getItem("token");

    const [auctions, setAuctions] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [isSellerMember, setIsSellerMember] = useState(true);
    const [isBuyerMember, setIsBuyerMember] = useState(true);

    const [activeField, setActiveField] = useState(null);

    const [sellerMemberId, setSellerMemberId] = useState("");
    const [buyerMemberId, setBuyerMemberId] = useState("");

    /* MEMBER SEARCH STATES */

    const [sellerSearch, setSellerSearch] = useState("");
    const [buyerSearch, setBuyerSearch] = useState("");

    const [sellerDropdown, setSellerDropdown] = useState([]);
    const [buyerDropdown, setBuyerDropdown] = useState([]);
    const [typeFilter, setTypeFilter] = useState("all");


    const [sameMemberWarning, setSameMemberWarning] = useState(false);


    const [viewAuction, setViewAuction] = useState(null);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-GB");

    const [Response, setResponse] = useState({
        status: null,
        message: ""
    });


    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    const todayDay = days[today.getDay()];

    const [formData, setFormData] = useState({
        date: todayDate,
        day: todayDay,

        sellerName: "",
        sellerPhone: "",
        buyerName: "",
        buyerPhone: "",
        item: "",
        amount: "",
        description: ""
    });




    const fetchAuctions = async () => {

        try {

            const res = await axios.get(
                `${URL}/auctions/sunday-auction`,
                {
                    params: {
                        page: CurrentPage,
                        limit: rowsPerPage,
                        search: searchQuery,
                        type: typeFilter
                    },
                    headers: { Authorization: token }
                }
            );

            setAuctions(res.data.data);
            setTotalPages(res.data.totalPages);

        } catch (error) {

            console.error(error);

        }

    };


    useEffect(() => {

        fetchAuctions();

    }, [CurrentPage, rowsPerPage, searchQuery, typeFilter]);


    useEffect(() => {

        if (
            isSellerMember &&
            isBuyerMember &&
            sellerMemberId &&
            buyerMemberId &&
            sellerMemberId === buyerMemberId
        ) {

            setSameMemberWarning(true);

            const timer = setTimeout(() => {
                setSameMemberWarning(false);
            }, 2500); // hide after 2.5 seconds

            return () => clearTimeout(timer);

        }

    }, [sellerMemberId, buyerMemberId, isSellerMember, isBuyerMember]);

    const handleDateChange = (value) => {

        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const selectedDate = new Date(value);
        const day = days[selectedDate.getDay()];

        setFormData({
            ...formData,
            date: value,
            day: day
        });
    };


    const debounce = (func, delay) => {
        let timer;

        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };



    const debouncedSellerIdSearch = debounce(async (value) => {

        if (!value) {
            setSellerDropdown([]);
            return;
        }

        try {

            const res = await axios.get(
                `${URL}/member-search/by-id?id=${value}`,
                { headers: { Authorization: token } }
            );

            setSellerDropdown(res.data || []);

        } catch (error) {

            setSellerDropdown([]);

        }

    }, 400);




    const debouncedSellerNameSearch = debounce(async (value) => {

        if (!value) {
            setSellerDropdown([]);
            return;
        }

        try {

            const res = await axios.get(
                `${URL}/member-search?name=${value}`,
                { headers: { Authorization: token } }
            );

            setSellerDropdown(res.data || []);

        } catch (error) {

            setSellerDropdown([]);

        }

    }, 400);



    const debouncedBuyerIdSearch = debounce(async (value) => {

        if (!value) {
            setBuyerDropdown([]);
            return;
        }

        try {

            const res = await axios.get(
                `${URL}/member-search/by-id?id=${value}`,
                { headers: { Authorization: token } }
            );

            setBuyerDropdown(res.data || []);

        } catch (error) {

            setBuyerDropdown([]);

        }

    }, 400);



    const debouncedBuyerNameSearch = debounce(async (value) => {

        if (!value) {
            setBuyerDropdown([]);
            return;
        }

        try {

            const res = await axios.get(
                `${URL}/member-search?name=${value}`,
                { headers: { Authorization: token } }
            );

            setBuyerDropdown(res.data || []);

        } catch (error) {

            setBuyerDropdown([]);

        }

    }, 400);



    const resetForm = () => {

        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];

        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const todayDay = days[today.getDay()];

        setSellerMemberId("")
        setSellerSearch("")
        setSellerDropdown([])

        setBuyerMemberId("")
        setBuyerSearch("")
        setBuyerDropdown([])

        setIsSellerMember(true)
        setIsBuyerMember(true)

        setFormData({
            date: todayDate,
            day: todayDay,
            sellerName: "",
            sellerPhone: "",
            buyerName: "",
            buyerPhone: "",
            item: "",
            amount: "",
            description: ""
        });

    };

    /* ================================
       TABLE DATA
    ================================== */


    const columns = [
        { label: "S.No", key: "slNo" },
        { label: "Date", key: "date" },
        { label: "Seller", key: "seller" },
        { label: "Buyer", key: "buyer" },
        // { label: "Type", key: "type" },
        { label: "Action", key: "action" }
    ];

    /* ================================
       CHARACTER LIMIT
    ================================== */

    const validateMaxLength = (name, value, max = 50) => {
        if (value.length > max) {
            return value.slice(0, max);
        }
        return value;
    };

    const CharCounter = ({ value = "", max = 50, show }) => {
        if (!show || !value.length) return null;

        return (
            <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                {value.length}/{max}
            </span>
        );
    };

    /* ================================
       FORM HANDLER
    ================================== */

    const handleChange = (name, value, max = 50) => {
        const fixed = validateMaxLength(name, value, max);

        setFormData({
            ...formData,
            [name]: fixed
        });
    };


    const validateForm = () => {

        if (!formData.date) {
            setResponse({
                status: "Failed",
                message: "Auction date is required"
            });
            return false;
        }

        if (!formData.item.trim()) {
            setResponse({
                status: "Failed",
                message: "Item name is required"
            });
            return false;
        }

        if (!formData.amount) {
            setResponse({
                status: "Failed",
                message: "Amount is required"
            });
            return false;
        }

        /* SELLER VALIDATION */

        if (isSellerMember) {

            if (!sellerMemberId) {
                setResponse({
                    status: "Failed",
                    message: "Seller member must be selected"
                });
                return false;
            }

        } else {

            if (!formData.sellerName.trim()) {
                setResponse({
                    status: "Failed",
                    message: "Seller name is required"
                });
                return false;
            }

            if (formData.sellerPhone.length !== 10) {
                setResponse({
                    status: "Failed",
                    message: "Seller phone must be 10 digits"
                });
                return false;
            }

        }

        /* BUYER VALIDATION */

        if (isBuyerMember) {

            if (!buyerMemberId) {
                setResponse({
                    status: "Failed",
                    message: "Buyer member must be selected"
                });
                return false;
            }

        } else {

            if (!formData.buyerName.trim()) {
                setResponse({
                    status: "Failed",
                    message: "Buyer name is required"
                });
                return false;
            }

            if (formData.buyerPhone.length !== 10) {
                setResponse({
                    status: "Failed",
                    message: "Buyer phone must be 10 digits"
                });
                return false;
            }

        }

        return true;
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validateForm()) return;

        if (saving) return;

        try {

            setSaving(true);

            const payload = {

                date: formData.date,
                day: formData.day,

                seller: {
                    isMember: isSellerMember,
                    member_id: isSellerMember ? sellerMemberId : null,
                    member_name: formData.sellerName,
                    phone_number: formData.sellerPhone
                },

                buyer: {
                    isMember: isBuyerMember,
                    member_id: isBuyerMember ? buyerMemberId : null,
                    member_name: formData.buyerName,
                    phone_number: formData.buyerPhone
                },

                item: formData.item,
                amount: Number(formData.amount),
                description: formData.description

            };

            await axios.post(`${URL}/auctions/sunday-auction`, payload, {
                headers: { Authorization: token }
            });

            await fetchAuctions();

            setResponse({
                status: "Success",
                message: "Auction created successfully"
            });

            setIsModalOpen(false);
            resetForm();

        } catch (error) {



            setResponse({
                status: "Failed",
                message: error.response?.data?.message || "Something went wrong"
            });

        } finally {

            setSaving(false);

        }
    };



    const handlePhoneChange = (name, value) => {

        const cleaned = value.replace(/\D/g, "").slice(0, 10);

        setFormData({
            ...formData,
            [name]: cleaned
        });
    };


    const showMemberError = (msg) => {
        setMemberError(msg);

        setTimeout(() => {
            setMemberError("");
        }, 2500);
    };

    /* ================================
       UI
    ================================== */

    return (
        <div className="p-2 sm:p-4 md:p-6">

            <div className="h-full p-4 mx-1 mt-3 bg-white rounded-xl">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Sunday Auctions
                    </h1>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

                        {/* SEARCH */}

                        <div className="relative">

                            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                                <IoIosSearch className="text-gray-500" />
                            </div>

                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                // className="block py-1 text-sm text-gray-900 rounded w-56 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"

                                className="block py-1 text-sm text-gray-900 rounded w-56 sm:w-64 ps-8 bg-gray-50 border border-gray-300"
                            />

                        </div>

                        {/* TYPE FILTER */}
                        {/* 
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1 text-sm border rounded bg-gray-50 focus:ring-lavender--600"
                        >

                            <option value="all">All</option>
                            <option value="member">Member</option>
                            <option value="non-member">Non Member</option>

                        </select> */}

                    </div>

                    {/* ADD BUTTON */}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        // className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        className="flex items-center justify-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg w-full sm:w-auto"
                    >
                        <FaPlus /> Add Auction
                    </button>

                </div>

                <div className="overflow-x-auto mt-4">

                    {/* <table className="w-full text-sm text-gray-500"> */}
                    <table className="min-w-[650px] w-full text-sm text-gray-500">

                        <thead className="text-base text-gray-700">

                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="p-2 text-center">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>

                        </thead>

                        <tbody>

                            {auctions.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No auctions found
                                    </td>
                                </tr>

                            ) : (


                                auctions.map((row, index) => {

                                    const sellerName = row.seller.isMember
                                        ? `${row.sellerMember?.member_id || ""} (${row.sellerMember?.member_name || ""})`
                                        : row.seller.name;

                                    const buyerName = row.buyer.isMember
                                        ? `${row.buyerMember?.member_id || ""} (${row.buyerMember?.member_name || ""})`
                                        : row.buyer.name;

                                    const isMember = row.seller.isMember || row.buyer.isMember;

                                    return (
                                        <tr key={row._id} className="bg-white border-b hover:bg-gray-50">

                                            <td className="px-4 py-2 text-center">
                                                {(CurrentPage - 1) * rowsPerPage + index + 1}
                                            </td>

                                            <td className="px-4 py-2 text-center">
                                                {formatDate(row.date)}
                                            </td>

                                            <td className="px-4 py-2">
                                                {sellerName || "-"}
                                            </td>

                                            <td className="px-4 py-2">
                                                {buyerName || "-"}
                                            </td>

                                            {/* <td className="px-4 py-2 text-center font-bold">
                                                {isMember ? (
                                                    <span className="text-green-600">Member</span>
                                                ) : (
                                                    <span className="text-yellow-400">Non-Member</span>
                                                )}
                                            </td> */}

                                            <td className="px-4 py-2 text-center flex justify-center items-center">
                                                <FaEye
                                                    size={18}
                                                    className="cursor-pointer text-lavender--600"
                                                    onClick={() => setViewAuction(row)}
                                                />
                                            </td>

                                        </tr>
                                    );
                                })


                            )}

                        </tbody>

                    </table>

                </div>

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

            {/* MODAL */}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    resetForm()
                }}
                title="New Auction"
            >

                <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>


                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">


                        {/* AUCTION INFO */}
                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">


                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                {/* AUCTION DATE */}

                                <div>

                                    <RequiredLabel>Auction Date</RequiredLabel>

                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                    />
                                </div>


                                {/* DAY */}

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Day
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.day}
                                        readOnly
                                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                    />
                                </div>


                                {/* ITEM */}

                                <div>

                                    <RequiredLabel>Item</RequiredLabel>

                                    <div className="relative">

                                        <input
                                            type="text"
                                            value={formData.item}
                                            onFocus={() => setActiveField("item")}
                                            onBlur={() => setActiveField(null)}
                                            onChange={(e) => handleChange("item", e.target.value, 50)}
                                            className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            placeholder="Enter Item name"
                                        />

                                        <CharCounter
                                            value={formData.item}
                                            max={50}
                                            show={activeField === "item"}
                                        />

                                    </div>
                                </div>


                                {/* AMOUNT */}

                                <div>

                                    <RequiredLabel>Amount</RequiredLabel>

                                    <input
                                        type="text"
                                        value={formData.amount}
                                        inputMode="numeric"
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            handleChange("amount", value);
                                        }}
                                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                        placeholder="Enter amount"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* SELLER DETAILS */}

                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">





                            <div className="flex items-center justify-between">

                                <h3 className="text-sm font-semibold text-gray-700">

                                    <RequiredLabel>Seller Details</RequiredLabel>
                                </h3>



                                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">

                                    <div
                                        className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                        style={{
                                            width: "calc(50% - 0.25rem)",
                                            transform: isSellerMember
                                                ? "translateX(0)"
                                                : "translateX(100%)"
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setIsSellerMember(true)

                                            /* reset fields */

                                            setSellerMemberId("")
                                            setSellerSearch("")
                                            setSellerDropdown([])

                                            setFormData(prev => ({
                                                ...prev,
                                                sellerName: "",
                                                sellerPhone: ""
                                            }))

                                        }}
                                        className={`relative flex-1 py-1 text-center rounded-full ${isSellerMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Member
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setIsSellerMember(false)

                                            /* reset fields */

                                            setSellerMemberId("")
                                            setSellerSearch("")
                                            setSellerDropdown([])

                                            setFormData(prev => ({
                                                ...prev,
                                                sellerName: "",
                                                sellerPhone: ""
                                            }))

                                        }}
                                        className={`relative flex-1 py-1 text-center rounded-full ${!isSellerMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Non-Member
                                    </button>

                                </div>



                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

                                {/* MEMBER MODE */}

                                {isSellerMember ? (

                                    <>

                                        {/* MEMBER ID */}

                                        <div className="relative">

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Member ID
                                            </label>

                                            <input
                                                type="text"
                                                value={sellerMemberId}
                                                placeholder="Search ID"
                                                onChange={(e) => {

                                                    const val = e.target.value

                                                    setSellerMemberId(val)

                                                    if (!val) {
                                                        setSellerSearch("")
                                                        setFormData({ ...formData, sellerName: "", sellerPhone: "" })
                                                        setSellerDropdown([])
                                                        return
                                                    }

                                                    debouncedSellerIdSearch(val)

                                                }}
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* MEMBER NAME */}

                                        <div className="relative">

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Member Name
                                            </label>

                                            <input
                                                type="text"
                                                value={sellerSearch}
                                                placeholder="Search Name"
                                                onChange={(e) => {

                                                    const val = e.target.value

                                                    setSellerSearch(val)

                                                    if (!val) {
                                                        setSellerMemberId("")
                                                        setFormData({ ...formData, sellerPhone: "" })
                                                        setSellerDropdown([])
                                                        return
                                                    }

                                                    debouncedSellerNameSearch(val)

                                                }}
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* PHONE */}

                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Phone
                                            </label>

                                            <input
                                                type="text"
                                                value={formData.sellerPhone}
                                                readOnly
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* DROPDOWN */}

                                        {sellerDropdown.length > 0 && (

                                            <ul className="absolute z-50 mt-[72px] w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">

                                                {sellerDropdown.map((m) => (
                                                    <li
                                                        key={m.member_id}
                                                        onClick={() => {




                                                            setSellerMemberId(m.member_id)
                                                            setSellerSearch(m.member_name)

                                                            setFormData({
                                                                ...formData,
                                                                sellerName: m.member_name,
                                                                sellerPhone: m.mobile_number
                                                            })

                                                            setSellerDropdown([])

                                                        }}
                                                        className="px-3 py-2 flex justify-between cursor-pointer hover:bg-gray-100"
                                                    >

                                                        <span>{m.member_id}</span>
                                                        <span>{m.member_name}</span>
                                                        <span>{m.mobile_number}</span>

                                                    </li>
                                                ))}

                                            </ul>

                                        )}

                                    </>

                                ) : (

                                    /* NON MEMBER MODE */

                                    <>

                                        <div >

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Non-Member Name
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.sellerName}
                                                    onFocus={() => setActiveField("sellerName")}
                                                    onBlur={() => setActiveField(null)}
                                                    onChange={(e) => handleChange("sellerName", e.target.value, 50)}
                                                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                                    placeholder="Enter non-member name"
                                                />
                                                <CharCounter
                                                    value={formData.sellerName}
                                                    max={50}
                                                    show={activeField === "sellerName"}
                                                />

                                            </div>
                                        </div>


                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Phone
                                            </label>

                                            <input
                                                type="text"
                                                value={formData.sellerPhone}
                                                onChange={(e) => handlePhoneChange("sellerPhone", e.target.value)}
                                                maxLength={10}
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                                placeholder="Enter phone number"
                                            />

                                        </div>

                                    </>

                                )}

                            </div>

                            {sameMemberWarning && (
                                <p className="text-green-600 text-xs font-semibold mt-2">
                                    Seller and Buyer are the same member
                                </p>
                            )}



                        </div>





                        {/* BUYER DETAILS */}

                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">

                            <div className="flex items-center justify-between">

                                <h3 className="text-sm font-semibold text-gray-700">
                                    <RequiredLabel>Buyer Details</RequiredLabel>
                                </h3>

                                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">

                                    <div
                                        className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                        style={{
                                            width: "calc(50% - 0.25rem)",
                                            transform: isBuyerMember ? "translateX(0)" : "translateX(100%)"
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setIsBuyerMember(true)

                                            /* reset fields */

                                            setBuyerMemberId("")
                                            setBuyerSearch("")
                                            setBuyerDropdown([])

                                            setFormData(prev => ({
                                                ...prev,
                                                buyerName: "",
                                                buyerPhone: ""
                                            }))

                                        }}
                                        className={`relative flex-1 py-1 text-center rounded-full ${isBuyerMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Member
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setIsBuyerMember(false)

                                            /* reset fields */

                                            setBuyerMemberId("")
                                            setBuyerSearch("")
                                            setBuyerDropdown([])

                                            setFormData(prev => ({
                                                ...prev,
                                                buyerName: "",
                                                buyerPhone: ""
                                            }))

                                        }}
                                        className={`relative flex-1 py-1 text-center rounded-full ${!isBuyerMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Non-Member
                                    </button>

                                </div>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

                                {isBuyerMember ? (

                                    <>

                                        {/* MEMBER ID */}

                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Member ID
                                            </label>

                                            <input
                                                type="text"
                                                value={buyerMemberId}
                                                placeholder="Search ID"
                                                onChange={(e) => {

                                                    const val = e.target.value

                                                    setBuyerMemberId(val)

                                                    if (!val) {
                                                        setBuyerSearch("")
                                                        setFormData({ ...formData, buyerName: "", buyerPhone: "" })
                                                        setBuyerDropdown([])
                                                        return
                                                    }

                                                    debouncedBuyerIdSearch(val)

                                                }}
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* MEMBER NAME */}

                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Member Name
                                            </label>

                                            <input
                                                type="text"
                                                value={buyerSearch}
                                                placeholder="Search Name"
                                                onChange={(e) => {

                                                    const val = e.target.value

                                                    setBuyerSearch(val)

                                                    if (!val) {
                                                        setBuyerMemberId("")
                                                        setFormData({ ...formData, buyerPhone: "" })
                                                        setBuyerDropdown([])
                                                        return
                                                    }

                                                    debouncedBuyerNameSearch(val)

                                                }}
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* PHONE */}

                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Phone
                                            </label>

                                            <input
                                                type="text"
                                                value={formData.buyerPhone}
                                                readOnly
                                                className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                            />

                                        </div>


                                        {/* DROPDOWN */}

                                        {buyerDropdown.length > 0 && (

                                            <ul className="absolute z-50 mt-[72px] w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">

                                                {buyerDropdown.map((m) => (
                                                    <li
                                                        key={m.member_id}
                                                        onClick={() => {


                                                            setBuyerMemberId(m.member_id)
                                                            setBuyerSearch(m.member_name)

                                                            setFormData({
                                                                ...formData,
                                                                buyerName: m.member_name,
                                                                buyerPhone: m.mobile_number
                                                            })

                                                            setBuyerDropdown([])

                                                        }}
                                                        className="px-3 py-2 flex justify-between cursor-pointer hover:bg-gray-100"
                                                    >

                                                        <span>{m.member_id}</span>
                                                        <span>{m.member_name}</span>
                                                        <span>{m.mobile_number}</span>

                                                    </li>
                                                ))}

                                            </ul>

                                        )}

                                    </>

                                ) : (

                                    <>
                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Non - Member Name
                                            </label>

                                            <div className="relative">

                                                <input
                                                    type="text"
                                                    value={formData.buyerName}
                                                    onFocus={() => setActiveField("buyerName")}
                                                    onBlur={() => setActiveField(null)}
                                                    onChange={(e) => handleChange("buyerName", e.target.value, 50)}
                                                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                                    placeholder="Enter non-member name"
                                                />

                                                <CharCounter
                                                    value={formData.buyerName}
                                                    max={50}
                                                    show={activeField === "buyerName"}
                                                />

                                            </div>

                                        </div>

                                        <div>

                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Phone
                                            </label>

                                            <div className="relative">

                                                <input
                                                    type="text"
                                                    value={formData.buyerPhone}
                                                    onFocus={() => setActiveField("buyerPhone")}
                                                    onBlur={() => setActiveField(null)}
                                                    onChange={(e) => handlePhoneChange("buyerPhone", e.target.value)}
                                                    maxLength={10}
                                                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                                                    placeholder="Enter phone number"
                                                />


                                            </div>

                                        </div>
                                    </>

                                )}

                            </div>

                            {sameMemberWarning && (
                                <p className="text-green-600 text-xs font-semibold mt-2">
                                    Seller and Buyer are the same member
                                </p>
                            )}



                        </div>


                        {/* DESCRIPTION */}

                        <div className="p-2 border rounded-lg bg-gray-50 space-y-4">


                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Description
                            </label>


                            <div className="relative">

                                <textarea
                                    value={formData.description || ""}
                                    onFocus={() => setActiveField("description")}
                                    onBlur={() => setActiveField(null)}
                                    onChange={(e) => handleChange("description", e.target.value, 200)}
                                    rows={3}
                                    placeholder="Enter description"
                                    className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
                                />

                                <CharCounter
                                    value={formData.description}
                                    max={200}
                                    show={activeField === "description"}
                                />

                            </div>

                        </div>




                        {/* BUTTONS */}

                        <div className="flex justify-end gap-3">



                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-6 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2
                            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
                            >

                                {saving && (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}

                                {saving ? "Saving..." : "Save"}

                            </button>

                        </div>




                    </form>

                </div>

            </Modal>



            {viewAuction && (

                <Modal
                    isOpen={true}
                    onClose={() => setViewAuction(null)}
                    title="Auction Details"
                >

                    <div className="space-y-6">

                        {/* ROW 1 */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            <div>
                                <p className="text-sm text-gray-500">Auction Date</p>
                                <p className="font-semibold">
                                    {new Date(viewAuction.date).toLocaleDateString("en-GB")}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Day</p>
                                <p className="font-semibold">{viewAuction.day}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Item</p>
                                <p className="font-semibold">{viewAuction.item}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="font-semibold">₹ {viewAuction.amount}</p>
                            </div>

                        </div>


                        {/* ROW 2 SELLER */}

                        <div>

                            <p className="font-semibold mb-2">
                                Seller :
                                <span className={`ml-2 font-bold ${viewAuction.seller.isMember ? "text-green-600" : "text-yellow-400"}`}>
                                    {viewAuction.seller.isMember ? "Member" : "Non-Member"}
                                </span>
                            </p>

                            {viewAuction.seller.isMember ? (

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500">Member ID</p>
                                        <p>{viewAuction.sellerMember?.member_id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Member Name</p>
                                        <p>{viewAuction.sellerMember?.member_name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p>{viewAuction.sellerMember?.primary_contact}</p>
                                    </div>

                                </div>

                            ) : (

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500">Non-Member Name</p>
                                        <p>{viewAuction.seller.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p>{viewAuction.seller.phone}</p>
                                    </div>

                                </div>

                            )}

                        </div>


                        {/* BUYER */}

                        <div>

                            <p className="font-semibold mb-2">
                                Buyer :
                                <span className={`ml-2 font-bold ${viewAuction.buyer.isMember ? "text-green-600" : "text-yellow-400"}`}>
                                    {viewAuction.buyer.isMember ? "Member" : "Non-Member"}
                                </span>
                            </p>

                            {viewAuction.buyer.isMember ? (

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500">Member ID</p>
                                        <p>{viewAuction.buyerMember?.member_id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Member Name</p>
                                        <p>{viewAuction.buyerMember?.member_name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p>{viewAuction.buyerMember?.primary_contact}</p>
                                    </div>

                                </div>

                            ) : (

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500">Non-Member Name</p>
                                        <p>{viewAuction.buyer.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p>{viewAuction.buyer.phone}</p>
                                    </div>

                                </div>

                            )}

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <p className="text-sm text-gray-500">Description</p>
                            <p className="border rounded p-3 bg-gray-50">
                                {viewAuction.description || "-"}
                            </p>

                        </div>

                    </div>

                </Modal>

            )}



            {Response.status &&
                (Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                ))}

        </div>

    );
};