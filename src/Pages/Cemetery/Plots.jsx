




import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import AddPlotsModal from "./AddPlotsModel";
import { URL } from "../../App";
import axios from "axios";
import Pagination from "../../Components/Helpers/Pagination";

export const Plots = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [cemetery, setCemetery] = useState([]);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");
    const [Response, setResponse] = useState({ status: "", message: "" });

    const token = window.sessionStorage.getItem("token");



    const fetchCemetery = async () => {
        try {
            const res = await axios.get(
                `${URL}/cemetery?page=${CurrentPage}&limit=${rowsPerPage}&search=${search || ""}`,
                { headers: { Authorization: token } }
            );
            setCemetery(res.data.cemetery || []);

            const pages = res.data.totalPages || 1;
            setTotalPages(pages);

            if (CurrentPage > pages) {
                setCurrentPage(1);
            }

        } catch (err) {
            console.error("Error fetching cemetery", err);
        }
    };

    useEffect(() => {
        fetchCemetery();
    }, [CurrentPage, rowsPerPage, search]);



    const handleSave = async (data) => {

        // ✅ FRONTEND VALIDATION TOAST
        if (data.error) {
            setResponse({
                status: "Failed",
                message: data.error
            });

            return;
        }

        const {
            cemeteryName,
            location,
            plots,
            totalPlots
        } = data;

        try {

            await axios.post(`${URL}/cemetery/add`, {
                cemeteryName,
                cemeteryLocation: location,
                plots,
                numberOfAvailablePlots: totalPlots,
            }, {
                headers: { Authorization: token }
            });

            setResponse({
                status: "Success",
                message: "Saved successfully"
            });

            setIsModalOpen(false);

            fetchCemetery();

        } catch (err) {

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Save failed";

            setResponse({
                status: "Failed",
                message: errorMessage
            });
        }
    };





    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                <div className="flex items-center justify-between p-4">



                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Cemetery Plots
                    </h1>

                    {/* Search */}
                    <div className="">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search
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
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}

                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                                placeholder="Search"
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Plots
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500 ">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">S No</th>
                                <th className="p-2 text-center">Cemetery Name</th>
                                <th className="p-2 text-center">Location</th>
                                <th className="p-2 text-center">Available Plots</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cemetery.length > 0 ? (
                                cemetery.map((cem, idx) => (
                                    <tr key={cem._id} className="border-t text-center">
                                        <td className="p-2">{(CurrentPage - 1) * rowsPerPage + idx + 1}</td>
                                        <td className="p-2">{cem.cemeteryName}</td>
                                        <td className="p-2">{cem.cemeteryLocation}</td>
                                        <td className="p-2">{cem.numberOfAvailablePlots || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-3 text-center text-gray-400">
                                        No cemetery found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* Modal */}
            <AddPlotsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />


            {Response.status && (
                Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                )
            )}

        </>
    );
};
