// // src/Pages/Offerings/CreateOfferings.jsx
import React, { useEffect, useState } from "react";
import { FaEye, FaPlus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/Pagination";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";



export const CreateOfferings = () => {
    const token = sessionStorage.getItem("token");

    /* ===================== STATE ===================== */
    const [offerings, setOfferings] = useState([]);
    const [search, setSearch] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [offeringTypeFilter, setOfferingTypeFilter] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);


    const [statusModal, setStatusModal] = useState(false);
    const [selectedOffering, setSelectedOffering] = useState(null);

    const [offeringType, setOfferingType] = useState("Bag");
    const [offeringName, setOfferingName] = useState("");

    const [saving, setSaving] = useState(false);
    const [response, setResponse] = useState(null);

    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState(null);




    /* ===================== BLOCK REFRESH ===================== */
    useEffect(() => {
        const blockRefresh = (e) => {
            if (saving) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", blockRefresh);
        return () => window.removeEventListener("beforeunload", blockRefresh);
    }, [saving]);

    /* ===================== FETCH ===================== */
    const fetchOfferings = async (
        page = 1,
        searchVal = "",
        type = "All"
    ) => {
        const res = await axios.get(
            `${URL}/offerings?page=${page}&limit=${rowsPerPage}&search=${searchVal}&offeringType=${type}&fromDate=${fromDate}&toDate=${toDate}`,
            { headers: { Authorization: token } }
        );

        setOfferings(res.data.data || []);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
    };

    useEffect(() => {
        fetchOfferings(CurrentPage, search, offeringTypeFilter);
    }, [
        CurrentPage,
        search,
        offeringTypeFilter,
        rowsPerPage,
        fromDate,
        toDate,
    ]);




    const validateMaxLength = (name, value, max = 50) => {
        if (value.length > max) {
            setErrors((prev) => ({
                ...prev,
                [name]: `Maximum ${max} characters allowed`,
            }));

            setTimeout(() => {
                setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[name];
                    return copy;
                });
            }, 4000);

            return false;
        }

        // clear error when fixed
        setErrors((prev) => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
        });

        return true;
    };


    const CharCounter = ({ value = "", max = 50, show }) => {
        if (!show || !value.length) return null;

        return (
            <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                {value.length}/{max}
            </span>
        );
    };


    /* ===================== SAVE ===================== */
    const handleSave = async () => {
        if (saving || !offeringName.trim()) return;

        try {
            setSaving(true);

            await axios.post(
                `${URL}/offerings`,
                { offeringType, offeringName },
                { headers: { Authorization: token } }
            );

            setResponse({ status: "Success", message: "Offering created" });

            setOfferingName("");
            setIsModalOpen(false);

            setCurrentPage(1);
            fetchOfferings(1, search, offeringTypeFilter);
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Error",
            });
        } finally {
            setSaving(false);
        }
    };


    const toggleStatus = async (item) => {
        const newStatus = item.status === "Active" ? "Inactive" : "Active";

        try {
            await axios.put(
                `${URL}/offerings/status`,
                {
                    offeringType: item.offeringType,
                    offeringName: item.offeringName,
                    status: newStatus,
                },
                { headers: { Authorization: token } }
            );

            fetchOfferings(CurrentPage, search, offeringTypeFilter);
        } catch (err) {
            console.error("Status update failed", err);
        }
    };


    return (
        <>
            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
                <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                    {/* HEADER */}
                    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">

                        <h1 className="text-xl font-bold capitalize text-lavender--600">
                            Offertory
                        </h1>


                        <div className="flex flex-wrap gap-2">
                            <input
                                type="search"
                                placeholder="Search Offertory..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                            />

                            <select
                                value={offeringTypeFilter}
                                onChange={(e) => {
                                    setOfferingTypeFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                            >
                                <option value="All">All Category</option>
                                <option value="Bag">Bag</option>
                                <option value="Cover">Cover</option>
                            </select>

                            {/* <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="py-1 text-sm rounded px-2 bg-gray-50 border"
                            />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="py-1 text-sm rounded px-2 bg-gray-50 border"
                            /> */}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 bg-lavender--600 text-white rounded-lg"
                        >
                            <FaPlus /> Create Offertory
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-500">
                            <thead className="text-base text-gray-700">
                                <tr>
                                    <th className="p-2 text-center">S.No</th>
                                    <th className="p-2 text-center">Offertory Category</th>
                                    <th className="p-2 text-center">Offertory Name</th>
                                    <th className="p-2 text-center">Date & Time</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offerings.length ? (
                                    [...offerings]
                                        .sort((a, b) => {
                                            if (a.status === b.status) return 0;
                                            return a.status === "Inactive" ? 1 : -1;
                                        }).map((item, i) => (
                                            <tr key={`${item.offeringName}-${i}`} className="border-b">
                                                <td className="p-2 text-center">
                                                    {(CurrentPage - 1) * rowsPerPage + i + 1}
                                                </td>
                                                <td className="p-2 text-center">{item.offeringType}</td>
                                                <td className="p-2 text-center">{item.offeringName}</td>
                                                <td className="p-2 text-center">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </td>




                                                {/* <td className="p-2 text-center">
                                                <div className="flex justify-center items-center">
                                                     <FaEye
                                                        size={18}
                                                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                                                       title="View Offerings"
                                                         onClick={() => {
                                                            setViewData(item);
                                                             setViewModal(true);
                                                         }}
                                                     />
                                              </div>
                                           </td> */}

                                                <td className="p-2 text-center">
                                                    <div className="flex justify-center items-center gap-3">

                                                        {/* VIEW */}
                                                        <FaEye
                                                            size={18}
                                                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                                                            title="View"
                                                            onClick={() => {
                                                                setViewData(item);
                                                                setViewModal(true);
                                                            }}
                                                        />


                                                        {/* STATUS (DB BASED) */}
                                                        {item.status === "Active" ? (

                                                            // 🚫 Monthly Offertory cannot be inactive
                                                            item.offeringName === "Monthly Offertory" ? (
                                                                <FaCheckCircle
                                                                    size={18}
                                                                    className="text-green-600 cursor-not-allowed"
                                                                    title="Active (Cannot deactivate)"
                                                                />
                                                            ) : (
                                                                <FaCheckCircle
                                                                    size={18}
                                                                    className="text-green-600 cursor-pointer"
                                                                    title="Click to Inactive"
                                                                    // onClick={() => toggleStatus(item)}
                                                                    onClick={() => {
                                                                        setSelectedOffering(item);
                                                                        setStatusModal(true);
                                                                    }}
                                                                />
                                                            )

                                                        ) : (

                                                            // ❌ If already inactive → no toggle allowed
                                                            <FaTimesCircle
                                                                size={18}
                                                                className="text-red-500 cursor-not-allowed"
                                                                title="Click to Active"

                                                                onClick={() => {
                                                                    setSelectedOffering(item);
                                                                    setStatusModal(true);
                                                                }}
                                                            />

                                                        )}

                                                    </div>
                                                </td>


                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">
                                            No Offerings Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
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
                    />
                </div>
            </div>

            {/* CREATE MODAL */}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Offertory">
                <div className="p-4 space-y-4">

                    {/* Key–Value Layout */}
                    <div className="space-y-4">

                        {/* Offerings Type */}
                        <div className="grid grid-cols-12 items-center gap-3">
                            <label className="col-span-12 sm:col-span-4 text-sm font-medium text-gray-700">
                                Offertory Category
                            </label>

                            <div className="col-span-12 sm:col-span-8 flex justify-start">
                                <div className="relative flex bg-gray-200 rounded-full p-1 w-56">
                                    <div
                                        className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                        style={{
                                            width: "calc(50% - 0.25rem)",
                                            transform:
                                                offeringType === "Bag"
                                                    ? "translateX(0)"
                                                    : "translateX(100%)",
                                        }}
                                    />
                                    {["Bag", "Cover"].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setOfferingType(t)}
                                            className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300
                ${offeringType === t ? "text-white" : "text-gray-700"}
              `}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Offerings Name */}
                        <div className="grid grid-cols-12 items-center gap-3">
                            <label className="col-span-12 sm:col-span-4 text-sm font-medium text-gray-700">
                                Offertory Name
                            </label>

                            <div className="col-span-12 sm:col-span-8 relative">
                                <input
                                    value={offeringName}
                                    // onChange={(e) => setOfferingName(e.target.value)}
                                    // className="w-full border rounded px-3 py-2 text-sm"




                                    onFocus={() => setActiveField("offeringName")}
                                    onBlur={() => setActiveField(null)}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (validateMaxLength("offeringName", val, 50)) {
                                            setOfferingName(val);

                                        }
                                    }}
                                    className={` border  px-3 py-2 text-sm   block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-0
      ${errors.offeringName ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Enter Offertory Name"
                                />


                                <CharCounter
                                    value={offeringName}
                                    max={50}
                                    show={activeField === "offeringName"}
                                />

                                {errors.offeringName && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.offeringName}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Save Button (UNCHANGED) */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${saving ? "bg-gray-400" : "bg-lavender--600"
                                }`}
                        >
                            {saving && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>

                </div>

            </Modal>



            {/* VIEW MODAL */}

            <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="View Offertory">
                <div className="p-4 space-y-3">
                    <div><strong>Offertory Category:</strong> {viewData?.offeringType}</div>
                    <div><strong>Offertory Name:</strong> {viewData?.offeringName}</div>
                    <div><strong>Date & Time :</strong> {new Date(viewData?.createdAt).toLocaleString()}</div>
                </div>
            </Modal>




            {/* STATUS CONFIRM MODAL */}

            <SmallSizedModal
                isOpen={statusModal}
                onClose={() => setStatusModal(false)}
                title={
                    selectedOffering?.status === "Active"
                        ? "Inactive Offertory"
                        : "Active Offertory"
                }
            >
                <div className="p-4 space-y-4">

                    <div className="space-y-3">

                        <p className="text-sm text-gray-700 font-medium">
                            Are You Sure You Want to{" "}
                            <span
                                className={`font-semibold ${selectedOffering?.status === "Active"
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }`}
                            >
                                {selectedOffering?.status === "Active"
                                    ? "Inactive"
                                    : "Active"}
                            </span>{" "}
                            This Offertory?
                        </p>

                        <div>
                            <strong>Offertory Category :</strong>{" "}
                            {selectedOffering?.offeringType}
                        </div>

                        <div>
                            <strong>Offertory Name :</strong>{" "}
                            {selectedOffering?.offeringName}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            onClick={async () => {
                                await toggleStatus(selectedOffering);
                                setStatusModal(false);
                            }}
                            className={`px-4 py-2 rounded-md text-white ${selectedOffering?.status === "Active"
                                    ? "bg-red-500"
                                    : "bg-green-600"
                                }`}
                        >
                            {selectedOffering?.status === "Active"
                                ? "Inactive"
                                : "Active"}
                        </button>

                    </div>
                </div>
            </SmallSizedModal>

            {response?.status === "Success" && (
                <SuccessMessage Message={response.message} />
            )}
            {response?.status === "Failed" && (
                <FailedMessage Message={response.message} />
            )}
        </>
    );
};
