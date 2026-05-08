



import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaEye, FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import moment from 'moment';
import { CiEdit } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import Pagination from '../../Components/Helpers/Pagination';
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import CharCounter from "../../Components/Form/CharCounter";
import DetailsModal from "../../Components/Expense/detailsModal";

export const Hall = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isViewModalOpen, setViewIsModalOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState(null);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [search, setSearch] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const token = window.sessionStorage.getItem("token");
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState("");
    // Incharge (member) search state
    const [inchargeIdSearch, setInchargeIdSearch] = useState("");
    const [inchargeNameSearch, setInchargeNameSearch] = useState("");
    const [inchargeDropdownById, setInchargeDropdownById] = useState([]);
    const [inchargeDropdownByName, setInchargeDropdownByName] = useState([]);
    const [inchargePhone, setInchargePhone] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const [regNo, setRegNo] = useState("");
    const [hallName, setHallName] = useState("");
    const [address, setAddress] = useState("");
    const [hallCapacity, setHallCapacity] = useState("");
    const [diningCapacity, setDiningCapacity] = useState("");
    const [halls, setHalls] = useState([]);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingHallId, setEditingHallId] = useState(null);

    const [bookedDate, setBookedDate] = useState("");
    const [selectedHallId, setSelectedHallId] = useState("");

    const [categories, setCategories] = useState([]); // current hall’s categories
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryPrice, setCategoryPrice] = useState("");

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [globalCategories, setGlobalCategories] = useState([]);
    const [addedPrices, setAddedPrices] = useState([]);


    const [newlyAddedPrices, setNewlyAddedPrices] = useState([]); // only newly added rows
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHallName, setSelectedHallName] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [selectedRow, setSelectedRow] = useState(null); // store hallId + categoryId

    const [editingRowId, setEditingRowId] = useState(null); // track which row is being edited
    const [editPriceValue, setEditPriceValue] = useState(""); // temporary input value
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false); // modal for confirming edit
    const [rowBeingEdited, setRowBeingEdited] = useState(null); // store the row object for modal
    const [editedRows, setEditedRows] = useState([]); // track rows that were edited
    const [deletedRows, setDeletedRows] = useState([]); // store hallId-categoryId of deleted rows

    // reusable pagination states
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const { saving, startSaving, stopSaving } = useSaving();
    useBlockRefresh(saving);

    const { errors, showError } = useTemporaryError();









    useEffect(() => {
        if (!selectedHallId) {
            setAddedPrices([]);
            setNewlyAddedPrices([]);
            return;
        }

        const hall = halls.find((h) => h._id === selectedHallId);
        if (!hall) return;

        const prices = hall.categoryPrices.map((cp) => ({
            hallId: hall._id,
            hallName: hall.hall_name,
            categoryId: cp.category._id,
            categoryName: cp.category.name,
            price: cp.price,
        }));

        setAddedPrices(prices); // load existing
        setNewlyAddedPrices([]); // reset newly added
    }, [selectedHallId]);





    const fetchHalls = async (page = CurrentPage, term = search) => {
        try {
            const res = await axios.get(`${URL}/marriage/halls`, {
                headers: { Authorization: token },
                params: {
                    page,
                    limit: rowsPerPage,          // ✅ dynamic
                    search: term || undefined,
                },
            });
            setHalls(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error(err);
            setHalls([]);
        }
    };

    useEffect(() => {
        fetchHalls(CurrentPage, search);
    }, [CurrentPage, search, rowsPerPage]);




    const resetForm = () => {
        setRegNo("");
        setHallName("");
        setAddress("");
        setHallCapacity("");
        setDiningCapacity("");
        setTags([]);
        setIsEditMode(false);
        setEditingHallId(null);
    };

    const handleSave = async () => {
        if (!regNo) return showError("regNo", "Register Number required");
        if (!hallName) return showError("hallName", "Hall Name required");
        if (!address) return showError("address", "Address required");

        if (saving) return;

        try {
            startSaving();

            const payload = {
                reg_no: regNo,
                hall_name: hallName,
                address,
                facilities: tags,
                hall_capacity: hallCapacity,
                dining_capacity: diningCapacity,
            };

            const res = await axios.post(`${URL}/marriage/halls`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message });
            setIsModalOpen(false);
            resetForm();
            // ✅ 🔥 INSTANT UI UPDATE
            setHalls(prev => [res.data.data, ...prev]);

            // reset
            setRegNo("");
            setHallName("");
            setAddress("");
            setHallCapacity("");
            setDiningCapacity("");
            setTags([]);

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        } finally {
            stopSaving();
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                reg_no: regNo,
                hall_name: hallName,
                address,
                facilities: tags,
                hall_capacity: hallCapacity,
                dining_capacity: diningCapacity,
            };

            const res = await axios.put(`${URL}/marriage/halls/${editingHallId}`, payload, {
                headers: { Authorization: token },
            });

            setResponse({ status: "Success", message: res.data.message });
            setIsModalOpen(false);
            setIsEditMode(false);
            resetForm();
            setHalls(prev =>
                prev.map(h =>
                    h._id === editingHallId ? res.data.data : h
                )
            );
        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        }
    };





    const handleKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
            e.preventDefault();

            const newTag = input.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // simple debounce utility
    const debounce = (fn, delay = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };



    useEffect(() => {
        if (selectedHallId) {
            const hall = halls.find(h => h._id === selectedHallId);
            setCategories(hall?.categories || []);
        }
    }, [selectedHallId, halls]);



    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${URL}/marriage/hall-categories`, {
                headers: { Authorization: token },
            });
            setGlobalCategories(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
            setGlobalCategories([]);
        }
    };

    // fetch global categories when modal opens or component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {

        if (!newCategory) return showError("category", "Category name required");

        if (saving) return;

        try {
            startSaving();

            const res = await axios.post(
                `${URL}/marriage/hall-categories`,
                { name: newCategory },
                { headers: { Authorization: token } }
            );

            setResponse({
                status: "Success",
                message: "Category added successfully!",
            });

            setIsCategoryModalOpen(false);
            setNewCategory("");
            fetchCategories();

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Something went wrong",
            });
        } finally {
            stopSaving();
        }
    };





    const handleAddRow = () => {
        if (!selectedHallId || !selectedCategory || !categoryPrice) return;

        const hall = halls.find((h) => h._id === selectedHallId);
        const category = globalCategories.find((c) => c._id === selectedCategory);

        const newRow = {
            hallId: hall._id,
            hallName: hall.hall_name,
            categoryId: category._id,
            categoryName: category.name,
            price: Number(categoryPrice),
        };

        setAddedPrices((prev) => [...prev, newRow]);
        setNewlyAddedPrices((prev) => [...prev, newRow]); // track only newly added

        // reset inputs
        setSelectedCategory("");
        setCategoryPrice("");
    };







    const handleSavePrice = async () => {

        // ✅ 1. Prevent empty save
        if (
            newlyAddedPrices.length === 0 &&
            !addedPrices.some(r => r.edited) &&
            deletedRows.length === 0
        ) {
            setResponse({
                status: "Failed",
                message: "No changes to save",
            });
            return;
        }

        try {
            startSaving(); // 🔥 start loading

            // =========================
            // 2️⃣ GROUP NEW
            // =========================
            const newGrouped = newlyAddedPrices.reduce((acc, row) => {
                if (!acc[row.hallId]) acc[row.hallId] = [];
                acc[row.hallId].push({
                    category: row.categoryId,
                    price: row.price,
                });
                return acc;
            }, {});

            // =========================
            // 3️⃣ GROUP EDITED
            // =========================
            const editedGrouped = addedPrices
                .filter(row => row.edited)
                .reduce((acc, row) => {
                    if (!acc[row.hallId]) acc[row.hallId] = [];
                    acc[row.hallId].push({
                        category: row.categoryId,
                        price: row.price,
                    });
                    return acc;
                }, {});

            // =========================
            // 4️⃣ GROUP DELETED
            // =========================
            const deletedGrouped = deletedRows.reduce((acc, row) => {
                if (!acc[row.hallId]) acc[row.hallId] = [];
                acc[row.hallId].push(row.categoryId);
                return acc;
            }, {});

            // =========================
            // 5️⃣ MERGE NEW + EDITED
            // =========================
            const hallsToUpdate = { ...newGrouped };

            for (const hallId in editedGrouped) {
                if (!hallsToUpdate[hallId]) hallsToUpdate[hallId] = [];
                hallsToUpdate[hallId] = [
                    ...hallsToUpdate[hallId],
                    ...editedGrouped[hallId],
                ];
            }

            // =========================
            // 6️⃣ API CALLS (PARALLEL 🔥)
            // =========================
            const updatePromises = Object.keys(hallsToUpdate).map(hallId =>
                axios.put(
                    `${URL}/marriage/halls/${hallId}/add-prices`,
                    { categoryPrices: hallsToUpdate[hallId] },
                    { headers: { Authorization: token } }
                )
            );

            const deletePromises = Object.keys(deletedGrouped).flatMap(hallId =>
                deletedGrouped[hallId].map(categoryId =>
                    axios.delete(
                        `${URL}/marriage/halls/${hallId}/delete-category/${categoryId}`,
                        { headers: { Authorization: token } }
                    )
                )
            );

            // 🔥 run all together
            await Promise.all([...updatePromises, ...deletePromises]);

            // =========================
            // 7️⃣ SUCCESS RESPONSE
            // =========================
            setResponse({
                status: "Success",
                message: "Prices updated successfully",
            });

            // =========================
            // 8️⃣ RESET STATE
            // =========================
            setNewlyAddedPrices([]);
            setDeletedRows([]);
            setAddedPrices(prev => prev.map(r => ({ ...r, edited: false })));

            setIsPriceModalOpen(false);

            // refresh data
            fetchHalls();

        } catch (err) {
            console.error(err);

            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save prices",
            });

        } finally {
            stopSaving(); // 🔥 stop loading
        }
    };



    const handleConfirmDelete = () => {
        // Remove from local addedPrices or newlyAddedPrices
        setAddedPrices(prev => prev.filter(r => r !== selectedRow));
        setNewlyAddedPrices(prev => prev.filter(r => r !== selectedRow));
        setShowDeleteModal(false);
    };




    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">



                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Marriage Halls
                    </h1>
                    <div className="">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search Members
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                                <svg
                                    className="w-3 h-3 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="search"
                                id="default-search"
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    setCurrentPage(1);
                                    fetchHalls(1, value); // 🔥 IMPORTANT
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex items-center justify-between p-4 gap-3'>
                        <button
                            onClick={() => setIsPriceModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Add Hall Price
                        </button>

                        <button
                            onClick={() => {
                                resetForm();       // 🔥 clear old edit data
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                        >
                            <FaPlus /> Add Hall
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">S No</th>
                                <th className="p-2 text-center">Hall Name</th>
                                <th className="p-2 text-center">Reg No</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {halls.length > 0 ? (
                                halls.map((hall, index) => (
                                    <tr key={hall._id} className="border-b">
                                        <td className="p-2 text-center">
                                            {(CurrentPage - 1) * rowsPerPage + index + 1}
                                        </td>
                                        <td className="p-2 text-center">{hall.hall_name}</td>
                                        <td className="p-2 text-center">{hall.reg_no}</td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <CiEdit
                                                    size={20}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setIsEditMode(true);
                                                        setEditingHallId(hall._id);
                                                        setRegNo(hall.reg_no);
                                                        setHallName(hall.hall_name);
                                                        setAddress(hall.address);
                                                        setTags(hall.facilities || []);
                                                        setHallCapacity(hall.hall_capacity);
                                                        setDiningCapacity(hall.dining_capacity);
                                                        setIsModalOpen(true);
                                                    }}
                                                />

                                                <FaEye
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedHall(hall);
                                                        setViewIsModalOpen(true);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No halls found
                                    </td>
                                </tr>
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




            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                resetForm(); // 🔥 reset when closing
            }} title={isEditMode ? "Edit Hall" : "Add New Hall"}>

                <div className={saving ? "pointer-events-none opacity-60" : ""}>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="relative">
                            <RequiredLabel>Register Number</RequiredLabel>
                            <input
                                type="text"
                                placeholder="Enter Hall Reg Number"
                                value={regNo}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (!validateMaxLength("regNo", val, 20, showError)) return;

                                    setRegNo(val);
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter value={regNo} max={20} show />
                            {errors.regNo && (
                                <p className="text-xs text-red-500 mt-1">{errors.regNo}</p>
                            )}
                        </div>

                        <div className="relative">
                            <RequiredLabel>Marrige Hall Name</RequiredLabel>
                            <input
                                type="text"
                                placeholder="Enter Hall Name"
                                value={hallName}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (!validateMaxLength("hallName", val, 50, showError)) return;

                                    setHallName(val);
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter value={hallName} max={50} show />
                            {errors.hallName && (
                                <p className="text-xs text-red-500 mt-1">{errors.hallName}</p>
                            )}
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-3">
                        <div className="relative">
                            <RequiredLabel>Address</RequiredLabel>
                            <textarea
                                rows={4}
                                placeholder="Enter Hall Address"
                                value={address}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (!validateMaxLength("address", val, 200, showError)) return;

                                    setAddress(val);
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter value={address} max={200} show />
                            {errors.address && (
                                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Facilities</label>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                className="ml-2 text-gray-600 hover:text-red-500"
                                                onClick={() => removeTag(tag)}
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    placeholder="+ Add new Facility"
                                    value={input}
                                    onChange={(e) => {
                                        const val = e.target.value;

                                        if (!validateMaxLength("facility", val, 30, showError)) return;

                                        setInput(val);
                                    }}
                                    onKeyDown={handleKeyDown}
                                />

                                <CharCounter value={input} max={30} show />
                                {errors.facility && (
                                    <p className="text-xs text-red-500 mt-1">{errors.facility}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        <div className="relative">
                            <RequiredLabel>Hall Seat Capacity</RequiredLabel>
                            <input
                                type="number"
                                placeholder="Enter Seat Capacity"
                                min={0}
                                value={hallCapacity}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val.length > 6) {
                                        showError("hallCapacity", "Maximum 6 digits allowed");
                                        return;
                                    }

                                    setHallCapacity(val);
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter value={hallCapacity} max={6} show />
                            {errors.hallCapacity && (
                                <p className="text-xs text-red-500 mt-1">{errors.hallCapacity}</p>
                            )}
                        </div>
                        <div className="relative">
                            <RequiredLabel>Dining Seat Capacity</RequiredLabel>
                            <input
                                type="number"
                                placeholder="Enter Dining Seat Capacity"
                                min={0}
                                value={diningCapacity}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val.length > 6) {
                                        showError("diningCapacity", "Maximum 6 digits allowed");
                                        return;
                                    }

                                    setDiningCapacity(val);
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter value={diningCapacity} max={6} show />
                            {errors.diningCapacity && (
                                <p className="text-xs text-red-500 mt-1">{errors.diningCapacity}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">

                        <Button
                            saving={saving}
                            type={isEditMode ? "update" : "save"}
                            onClick={isEditMode ? handleUpdate : handleSave}
                            buttonType="button"
                        />

                    </div>

                </div>

            </Modal>


            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setViewIsModalOpen(false)}
                title="View Hall"
            >
                {selectedHall && (
                    <div className="space-y-4 max-h-[650px] overflow-y-auto p-2">

                        {/* 🔹 MAIN INFO CARD */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border">

                            {[
                                { label: "Register No", value: selectedHall.reg_no },
                                { label: "Hall Name", value: selectedHall.hall_name },
                                { label: "Address", value: selectedHall.address },
                                { label: "Hall Capacity", value: selectedHall.hall_capacity },
                                { label: "Dining Capacity", value: selectedHall.dining_capacity },
                                {
                                    label: "Date Added",
                                    value: selectedHall.createdAt
                                        ? moment(selectedHall.createdAt).format("DD-MM-YYYY")
                                        : "N/A",
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between border-b pb-2 last:border-0">
                                    <span className="text-sm font-medium text-gray-600 w-1/3">
                                        {item.label}
                                    </span>

                                    <span
                                        className={`text-sm text-right w-2/3 ${item.value ? "text-gray-800" : "text-yellow-500 font-medium"
                                            }`}
                                    >
                                        {item.value || "N/A"}
                                    </span>
                                </div>
                            ))}

                            {/* 🔹 FACILITIES TAGS */}
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600 w-1/3">
                                    Facilities
                                </span>

                                <div className="w-2/3 flex flex-wrap gap-2 justify-end">
                                    {selectedHall.facilities?.length ? (
                                        selectedHall.facilities.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs bg-gray-200 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-yellow-500 font-medium text-sm">
                                            N/A
                                        </span>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* 🔹 CATEGORY CARD */}
                        <div className="bg-white border rounded-lg p-4">

                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Category Prices
                            </h3>

                            {selectedHall.categoryPrices?.length ? (
                                <div className="space-y-2">
                                    {selectedHall.categoryPrices.map((cat) => (
                                        <div
                                            key={cat._id}
                                            className="flex justify-between items-center border-b pb-2 last:border-0"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {cat.category?.name}
                                            </span>

                                            <span className="text-sm font-semibold text-lavender--600">
                                                ₹{cat.price?.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-yellow-500 text-sm font-medium">
                                    No categories available
                                </div>
                            )}

                        </div>

                    </div>
                )}
            </Modal>

            <Modal isOpen={isPriceModalOpen} onClose={() => {
                setIsPriceModalOpen(false);
                setSelectedHallId("");   // reset hall selection
                setSelectedCategory("");      // reset category
                setCategoryPrice("");         // reset price
            }} title="Add Hall Price">
                <div className='space-y-3 max-h-[650px] overflow-y-auto'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Hall</label>
                            <select
                                value={selectedHallId} // <-- state to track selected hall
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedHallId(value);

                                    // 🔥 reset dependent fields
                                    setSelectedCategory("");
                                    setCategoryPrice("");
                                }}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            >
                                <option value="">-- Select a Hall --</option>
                                {halls.map((hall) => (
                                    <option key={hall._id} value={hall._id}>
                                        {hall.hall_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <button
                                    className="text-sm text-lavender--600 font-medium"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                >
                                    Add Category
                                </button>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled={!selectedHallId}
                                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
        ${!selectedHallId
                                        ? "bg-gray-100 cursor-not-allowed border-gray-200"
                                        : "border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                                    }`}
                            >
                                <option value="">-- Select Category --</option>
                                {globalCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>


                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Price</label>
                            <input
                                type="number"
                                value={categoryPrice}
                                onChange={(e) => setCategoryPrice(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleAddRow}
                            disabled={!selectedHallId || !selectedCategory || !categoryPrice}
                            className={`px-4 py-2 rounded-md text-white text-sm
        ${(!selectedHallId || !selectedCategory || !categoryPrice)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-lavender--600 hover:bg-lavender--700"
                                }`}
                        >
                            Add
                        </button>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-gray-500">
                            <thead className="text-base text-gray-700">
                                <tr>
                                    <th className="p-2 text-center">Sl No.</th>
                                    <th className="p-2 text-center">Hall Name</th>
                                    <th className="p-2 text-center">Category Name</th>
                                    <th className="p-2 text-center">Category Price</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addedPrices.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (

                                    addedPrices.map((row, idx) => {
                                        const isNew = newlyAddedPrices.some(
                                            (n) => n.hallId === row.hallId && n.categoryId === row.categoryId
                                        );

                                        const isEditing = editingRowId === row.hallId + "-" + row.categoryId;
                                        const isDeleted = deletedRows.some(
                                            (d) => d.hallId === row.hallId && d.categoryId === row.categoryId
                                        );

                                        return (
                                            <tr key={idx} className={`border-b ${isDeleted ? "line-through text-gray-400" : ""}`}>
                                                <td className="p-2 text-center">{idx + 1}</td>
                                                <td className="p-2 text-center">{row.hallName}</td>
                                                <td className="p-2 text-center flex items-center justify-between gap-2">
                                                    {row.categoryName}
                                                    {isNew && !isDeleted && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">New</span>
                                                    )}
                                                    {row.edited && !isDeleted && (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Edited</span>
                                                    )}
                                                    {isDeleted && (
                                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Deleted</span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {isEditing && !isDeleted ? (
                                                        <input
                                                            type="number"
                                                            value={editPriceValue}
                                                            onChange={(e) => setEditPriceValue(e.target.value)}
                                                            className="w-20 border border-gray-300 rounded px-1 py-0.5 text-center"
                                                        />
                                                    ) : (
                                                        <>₹{row.price.toLocaleString()}</>
                                                    )}
                                                </td>

                                                <td className="p-2 text-center flex items-center justify-center gap-2">
                                                    {isEditing ? (
                                                        <FaCheckCircle
                                                            size={20}
                                                            className="text-green-600 cursor-pointer"
                                                            onClick={() => {
                                                                setRowBeingEdited(row);
                                                                setShowEditConfirmModal(true);
                                                            }}
                                                        />
                                                    ) : (
                                                        <CiEdit
                                                            size={20}
                                                            className="text-lavender--600 cursor-pointer"
                                                            onClick={() => {
                                                                setEditingRowId(row.hallId + "-" + row.categoryId);
                                                                setEditPriceValue(row.price);
                                                            }}
                                                        />
                                                    )}

                                                    <MdDelete
                                                        size={20}
                                                        className="text-red-500 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedHallName(row.hallName);
                                                            setSelectedCategoryName(row.categoryName);
                                                            setSelectedRow(row);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    />
                                                </td>

                                            </tr>
                                        );
                                    })   
                                )}


                            </tbody>


                        </table>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSavePrice}
                            disabled={
                                saving ||
                                (newlyAddedPrices.length === 0 &&
                                    editedRows.length === 0 &&
                                    deletedRows.length === 0)
                            }
                            className={`px-5 py-2 rounded-md text-sm text-white flex items-center gap-2
        ${saving ||
                                    (newlyAddedPrices.length === 0 &&
                                        editedRows.length === 0 &&
                                        deletedRows.length === 0)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-lavender--600 hover:bg-lavender--700"
                                }`}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </Modal>

            <DetailsModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setNewCategory(""); // 🔥 reset on close
                }}
                title="Add Category"
            >

                <div className={saving ? "pointer-events-none opacity-60" : ""}>

                    <div className="grid grid-cols-1 gap-4">

                        <div className="relative">
                            <RequiredLabel>Category Name</RequiredLabel>

                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (!validateMaxLength("category", val, 50, showError)) return;

                                    setNewCategory(val);
                                }}
                                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm 
                        ${errors.category ? "border-red-500" : "border-gray-300"}`}
                            />

                            <CharCounter value={newCategory} max={50} show />

                            {errors.category && (
                                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                            )}
                        </div>

                    </div>

                    <div className="flex justify-end mt-4">

                        <Button
                            saving={saving}
                            type="save"
                            onClick={handleAddCategory}
                            buttonType="button"
                        />

                    </div>

                </div>

            </DetailsModal>

            {Response.status && (
                Response.status === "Success"
                    ? <SuccessMessage Message={Response.message} />
                    : <FailedMessage Message={Response.message} />
            )}
            {/* Delete Confirmation Modal */}

            {showEditConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
                    <div className="relative w-full max-w-md max-h-full p-4 z-50">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowEditConfirmModal(false)}
                                className="absolute top-3 end-2.5 text-[#DB7B7B] bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            >
                                ×
                            </button>
                            <div className="p-4 text-center md:p-5">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-[#DB7B7B]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>

                                <h3 className="mb-5 text-lg font-normal text-gray-500">
                                    Do you want to save the updated price ₹{editPriceValue} for category: <strong>{rowBeingEdited.categoryName}</strong> in <strong>{rowBeingEdited.hallName}</strong>?
                                </h3>

                                <button
                                    onClick={() => setShowEditConfirmModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        // Update the price in addedPrices
                                        setAddedPrices(prev =>
                                            prev.map(r =>
                                                r.hallId === rowBeingEdited.hallId &&
                                                    r.categoryId === rowBeingEdited.categoryId
                                                    ? { ...r, price: Number(editPriceValue), edited: true }
                                                    : r
                                            )
                                        );
                                        setEditedRows(prev => [
                                            ...prev,
                                            rowBeingEdited.hallId + "-" + rowBeingEdited.categoryId,
                                        ]);
                                        setEditingRowId(null);
                                        setShowEditConfirmModal(false);
                                    }}
                                    className="text-white ms-3 bg-lavender--600 hover:bg-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DetailsModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Category"
            >

                <div className="text-center space-y-4">

                    {/* ICON */}
                    <div className="flex justify-center">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="w-6 h-6 text-red-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* MESSAGE */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Do you want to delete category{" "}
                        <span className="font-semibold text-gray-800">
                            {selectedCategoryName}
                        </span>{" "}
                        from{" "}
                        <span className="font-semibold text-gray-800">
                            {selectedHallName}
                        </span>
                        ?
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-center gap-3 pt-2">

                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                // 🔥 remove from UI
                                setAddedPrices(prev =>
                                    prev.filter(
                                        (row) =>
                                            !(row.hallId === selectedRow.hallId &&
                                                row.categoryId === selectedRow.categoryId)
                                    )
                                );

                                // 🔥 track deletion
                                setDeletedRows(prev => [
                                    ...prev,
                                    {
                                        hallId: selectedRow.hallId,
                                        categoryId: selectedRow.categoryId,
                                    },
                                ]);

                                setShowDeleteModal(false);
                            }}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </DetailsModal>




        </>
    )
}