// src/Pages/Endevour/EndeavourAddStudent.jsx

import React, { useEffect, useState } from "react";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

const EndeavourAddStudent = () => {
    const token = window.sessionStorage.getItem("token");
    const navigate = useNavigate();

    const [classOptions, setClassOptions] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);

    const [eligibleMembers, setEligibleMembers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");

    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    const [loadingEligible, setLoadingEligible] = useState(false);
    const [loadingSelected, setLoadingSelected] = useState(false);
    const [eligibleSearch, setEligibleSearch] = useState("");
    const [selectedSearch, setSelectedSearch] = useState("");

    /* ================= FETCH CLASSES ================= */
    useEffect(() => {
        const fetchClasses = async () => {
            const res = await axios.get(`${URL}/endeavour-classes`, {
                headers: { Authorization: token },
            });
            setClassOptions(res.data.classes || []);
        };
        fetchClasses();
    }, []);

    /* ================= FETCH ELIGIBLE ================= */
    const fetchEligible = async (classId) => {
        try {
            setLoadingEligible(true);

            const res = await axios.get(
                `${URL}/endeavour-classes/${classId}/eligible-students`,
                {
                    headers: { Authorization: token },
                    params: { search }
                }
            );

            setEligibleMembers(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingEligible(false);
        }
    };

    /* ================= CLASS CHANGE ================= */
    // const handleClassChange = async (e) => {
    //     const classId = e.target.value;

    //     setSelectedClassId(classId);

    //     if (!classId) {
    //         setSelectedClass(null);
    //         setEligibleMembers([]);
    //         setSelectedStudents([]);
    //         return;
    //     }

    //     try {
    //         setLoadingSelected(true);

    //         const headers = { headers: { Authorization: token } };

    //         const clsRes = await axios.get(
    //             `${URL}/endeavour-classes/${classId}/students`,
    //             headers
    //         );

    //         const cls = clsRes.data;

    //         setSelectedClass(cls);
    //         setSelectedStudents(cls.students || []);

    //         setLoadingSelected(false);

    //         await fetchEligible(classId);

    //     } catch (error) {
    //         console.error(error);
    //     }
    // };


    const handleClassChange = (e) => {
        const classId = e.target.value;

        setSelectedClassId(classId);

        if (!classId) {
            setSelectedClass(null);
            setEligibleMembers([]);
            setSelectedStudents([]);
        }
    };


    useEffect(() => {

        if (!selectedClassId) return;

        const loadClassData = async () => {
            try {

                setLoadingSelected(true);
                setLoadingEligible(true);

                const headers = { headers: { Authorization: token } };

                const clsRes = await axios.get(
                    `${URL}/endeavour-classes/${selectedClassId}/students`,
                    headers
                );

                const cls = clsRes.data;

                setSelectedClass(cls);
                setSelectedStudents(cls.students || []);

                setLoadingSelected(false);

                await fetchEligible(selectedClassId);

            } catch (error) {
                console.error(error);
                setLoadingSelected(false);
                setLoadingEligible(false);
            }
        };

        loadClassData();

    }, [selectedClassId]);

    /* ================= PAGE CHANGE ================= */
    useEffect(() => {
        if (!selectedClassId) return;

        const delay = setTimeout(() => {
            fetchEligible(selectedClassId);
        }, 400);

        return () => clearTimeout(delay);

    }, [search, selectedClassId]);

    /* ================= TOGGLE ================= */
    const toggleStudent = (member) => {

        const exists = selectedStudents.some(
            (s) => s.member_id === member.member_id
        );

        if (exists) {
            setSelectedStudents((prev) =>
                prev.filter((s) => s.member_id !== member.member_id)
            );
            return;
        }

        const max = Number(selectedClass.max_students || 0);

        if (selectedStudents.length >= max) {

            // reset toast first
            setToast(null);

            // show again
            setTimeout(() => {
                setToast({
                    type: "error",
                    message: `Maximum ${max} students allowed`,
                });
            }, 10);

            return;
        }

        setSelectedStudents((prev) => [...prev, member]);
    };

    /* ================= SAVE ================= */
    const handleSave = async () => {
        try {
            setSaving(true);

            await axios.post(
                `${URL}/endeavour-classes/${selectedClassId}/students`,
                { students: selectedStudents },
                { headers: { Authorization: token } }
            );

            setToast({
                type: "success",
                message: "Students saved successfully",
            });

            setTimeout(() => navigate(-1), 1200);
        } catch (error) {
            setToast({
                type: "error",
                message: "Something went wrong",
            });
        } finally {
            setSaving(false);
        }
    };


    const filteredEligible = eligibleMembers.filter((m) =>
        m.member_name.toLowerCase().includes(eligibleSearch.toLowerCase()) ||
        m.member_id.toLowerCase().includes(eligibleSearch.toLowerCase())
    );

    const filteredSelected = selectedStudents.filter((s) =>
        s.member_name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
        s.member_id.toLowerCase().includes(selectedSearch.toLowerCase())
    );

    return (
        <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

            {/* BACK BUTTON */}
            <div className="flex items-center px-3 py-2">
                <FaArrowLeft
                    title="Back"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-lavender--600"
                    size={18}
                />
            </div>

            <div className="p-5 bg-white rounded-xl shadow-md">

                {toast?.type === "success" && (
                    <SuccessMessage Message={toast.message} />
                )}
                {toast?.type === "error" && (
                    <FailedMessage Message={toast.message} />
                )}

                <h1 className="text-xl font-bold text-lavender--600 mb-6">
                    Add Students to Endeavour Class
                </h1>

                {/* CLASS SELECT */}
                <div className="mb-6">
                    <select
                        value={selectedClassId}
                        onChange={handleClassChange}
                        className="w-full border rounded-md p-2"
                    >
                        <option value="">Select Class</option>
                        {classOptions.map((cls) => (
                            <option key={cls._id} value={cls._id}>
                                {cls.class_name} - {cls.section_name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedClass && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ELIGIBLE MEMBERS */}
                        <div className="border rounded-md">

                            <div className="p-3 border-b bg-gray-50 text-center">
                                <div className="font-semibold text-gray-800">
                                    Eligible Members
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    Select students to add (Max: {selectedClass.max_students})
                                </p>
                            </div>


                            {/* SEARCH */}
                            <div className="flex justify-center py-2 border-b bg-white">
                                <div className="relative w-60">

                                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-2">
                                        <svg
                                            className="w-3 h-3 text-gray-500"
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
                                        className="block w-full py-1 text-xs text-gray-900 rounded-md ps-7 bg-gray-100 focus:ring-lavender--600 focus:border-lavender--600"
                                        placeholder="Search..."
                                        value={eligibleSearch}
                                        onChange={(e) => setEligibleSearch(e.target.value)}
                                    />

                                </div>
                            </div>

                            {loadingEligible ? (
                                <div className="p-6 text-center text-gray-400">
                                    Loading members...
                                </div>
                            ) : filteredEligible.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">
                                    No members found
                                </div>
                            ) : (
                                filteredEligible.map((m) => (
                                    <div
                                        key={m.member_id}
                                        className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="font-medium">{m.member_name}</div>

                                            <div className="text-xs text-gray-500">
                                                {m.member_id} |{" "}
                                                {m.dob ? moment(m.dob).format("DD-MM-YYYY") : "-"}
                                            </div>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.some(
                                                (s) => s.member_id === m.member_id
                                            )}
                                            onChange={() => toggleStudent(m)}
                                            className="w-4 h-4 accent-lavender--600 cursor-pointer"
                                        />
                                    </div>
                                ))
                            )}

                        </div>

                        {/* SELECTED STUDENTS */}
                        <div className="border rounded-md">

                            <div className="p-3 border-b bg-gray-50 text-center">
                                <div className="font-semibold text-gray-800">
                                    Selected Students
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedStudents.length} / {selectedClass.max_students} selected
                                </p>
                            </div>


                            <div className="flex justify-center py-2 border-b bg-white">
                                <div className="relative w-60">

                                    <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-2">
                                        <svg
                                            className="w-3 h-3 text-gray-500"
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
                                        className="block w-full py-1 text-xs text-gray-900 rounded-md ps-7 bg-gray-100 focus:ring-lavender--600 focus:border-lavender--600"
                                        placeholder="Search selected..."
                                        value={selectedSearch}
                                        onChange={(e) => setSelectedSearch(e.target.value)}
                                    />

                                </div>
                            </div>

                            {loadingSelected ? (
                                <div className="p-6 text-center text-gray-400">
                                    Loading students...
                                </div>
                            ) : filteredSelected.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">
                                    No students selected
                                </div>
                            ) : (
                                filteredSelected.map((m) => (
                                    <div
                                        key={m.member_id}
                                        className="flex justify-between items-center p-3 border-b hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="font-medium">{m.member_name}</div>

                                            <div className="text-xs text-gray-500">
                                                {m.member_id} |{" "}
                                                {m.dob ? moment(m.dob).format("DD-MM-YYYY") : "-"}
                                            </div>
                                        </div>

                                        <FaTrash
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => toggleStudent(m)}
                                        />
                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                )}

                {selectedClass && (
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-5 py-2 rounded-md text-white flex items-center gap-2
                ${saving
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-lavender--600 hover:bg-lavender--700"
                                }
              `}
                        >
                            {saving ? "Saving..." : "Save Students"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EndeavourAddStudent;
