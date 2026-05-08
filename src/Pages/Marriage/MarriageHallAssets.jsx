import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import { URL } from '../../App';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaEye, FaPlus } from 'react-icons/fa'
import { CiEdit } from 'react-icons/ci';
import Pagination from '../../Components/Helpers/Pagination';

export const MarriageHallAssets = () => {

    const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");
    const [Response, setResponse] = useState({ status: null, message: "" });
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [rows, setRows] = useState([]);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    useEffect(() => {
        fetchRows();
    }, [CurrentPage, rowsPerPage, searchTerm]);

    const fetchRows = async () => {
        const res = await axios.get(`${URL}/marriage/hall-assets`, {
            headers: { Authorization: token },
            params: {
                page: CurrentPage,
                limit: rowsPerPage,
                search: searchTerm || undefined,
            },
        });
        setRows(res.data.data || []);
        const pages = res.data.totalPages || 1;
        setTotalPages(pages);


        if (CurrentPage > pages) {
            setCurrentPage(1);
        }
    };



    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                <div className="flex items-center justify-between p-2">

                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Marriage Hall Assets
                    </h1>
                    <div className="relative">
                        <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                            <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="shop-search"
                            className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                            placeholder="Search Assets"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <button onClick={() => navigate('/admin/marriage/hall-assets/add')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
                        <FaPlus />Hall Assets
                    </button>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700 ">
                            <tr>
                                <th className="p-2 text-center">S No</th>
                                <th className="p-2 text-center">Hall Name</th>
                                <th className="p-2 text-center">No of Categories</th>
                                <th className="p-2 text-center">No of Items</th>
                                <th className="p-2 text-center">Total Count</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                rows.map((hall, i) => (
                                    <tr className='border-b' key={hall._id}>
                                        <td className="p-2 text-center">
                                            {(CurrentPage - 1) * rowsPerPage + i + 1}
                                        </td>
                                        <td className="p-2 text-center">{hall.hallName}</td>
                                        <td className="p-2 text-center">{hall.noOfCategories}</td>
                                        <td className="p-2 text-center">{hall.noOfItems}</td>
                                        <td className="p-2 text-center">{hall.totalQuantity}</td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <FaEye
                                                    size={18}
                                                    title='View'
                                                    className="text-lavender--600 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(`/admin/marriage/hall-assets/view/${hall.hallId}`)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
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

            {Response.status &&
                (Response.status === "Success" ?
                    <SuccessMessage Message={Response.message} /> :
                    <FailedMessage Message={Response.message} />)}
        </>
    )
}
