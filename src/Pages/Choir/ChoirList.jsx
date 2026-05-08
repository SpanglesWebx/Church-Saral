import React, { useEffect, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useForm } from "react-hook-form";
import axios from "axios";
import Pagination from "../../Components/Helpers/Pagination";
import { URL } from "../../App";
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";

export const ChoirList = () => {
    
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [memberIdSearch, setmemberIdSearch] = useState("");
    const [memberNameSearch, setmemberNameSearch] = useState("");
    const [memberDropdownById, setmemberDropdownById] = useState([]);
    const [memberDropdownByName, setmemberDropdownByName] = useState([]);
    const [search, setSearch] = useState("");


    const [choirMembers, setChoirMembers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);


    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rowsInput, setRowsInput] = useState("");
    const [jumpInput, setJumpInput] = useState("");


    const [Response, setResponse] = useState({ status: null, message: "" });

    const { saving, startSaving, stopSaving } = useSaving();

    useBlockRefresh(saving);

      const token = window.sessionStorage.getItem("token");

    // const { register, handleSubmit, setValue, reset } = useForm({
    //     defaultValues: {
    //         memberId: "",
    //         memberName: "",
    //         memberPhone: ""
    //     }
    // });

    const { register, handleSubmit, setValue, reset } = useForm({
        defaultValues: {
            memberObjectId: "",
            memberPhone: ""
        }
    });


    const showToast = (status, message) => {
        setResponse({ status: null, message: "" });
        setTimeout(() => setResponse({ status, message }), 10);
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    };

    const fetchChoirMembers = async (
        page = 1,
        searchVal = ""
    ) => {
        try {
            const res = await axios.get(`${URL}/choir-members`, {
                params: {
                    page,
                    limit: rowsPerPage,
                    search: searchVal
                },
                headers: { Authorization: token }
            });

            setChoirMembers(res.data.members || []);
            setCurrentPage(res.data.currentPage || page);
            setTotalPages(res.data.totalPages || Math.ceil(res.data.total / rowsPerPage));
        } catch (err) {
            showToast("Error", "Failed to fetch choir members");
        }
    };


    // Fetch members on component mount & page change
    useEffect(() => {
        fetchChoirMembers(CurrentPage, search);
    }, [CurrentPage, search, rowsPerPage]);


    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    // member search by ID
    const debouncedSearchmemberById = useRef(
        debounce(async (val) => {
            if (!val) return setmemberDropdownById([]);
            try {
                const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
                    headers: { Authorization: token }
                });
                setmemberDropdownById(res.data || []);
            } catch (err) {
                setmemberDropdownById([{ member_id: "none", member_name: "No member found" }]);
            }
        }, 300)
    ).current;

    // member search by Name
    const debouncedSearchmemberByName = useRef(
        debounce(async (val) => {
            if (!val) return setmemberDropdownByName([]);
            try {
                const res = await axios.get(`${URL}/member-search?name=${val}`, {
                    headers: { Authorization: token }
                });
                setmemberDropdownByName(res.data || []);
            } catch (err) {
                setmemberDropdownByName([{ member_id: "none", member_name: "No member found" }]);
            }
        }, 300)
    ).current;




    const onSubmit = async (data) => {

        if (!data.memberObjectId) {
            showToast("Error", "Please select a member");
            return;
        }
        if (saving) return;

        try {
            startSaving();

            const res = await axios.post(
                `${URL}/choir-members/add`,
                {
                    member: data.memberObjectId
                },
                { headers: { Authorization: token } }
            );

            showToast("Success", res.data.message);

            await fetchChoirMembers(CurrentPage, search);

            reset();
            setmemberIdSearch("");
            setmemberNameSearch("");
            setmemberDropdownById([]);
            setmemberDropdownByName([]);

        } catch (err) {
            showToast(
                "Error",
                err.response?.data?.message || "Failed to add member"
            );
        }
        finally {

            stopSaving();

        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);

        // 🔥 reset react-hook-form
        reset({
            memberObjectId: "",
            memberPhone: ""
        });

        // 🔥 reset local states
        setmemberIdSearch("");
        setmemberNameSearch("");
        setmemberDropdownById([]);
        setmemberDropdownByName([]);
    };




    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">


                {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
                <div className="flex items-center justify-between p-4">


                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Choir Members
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
                                id="default-search"
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                                placeholder="Search Members..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
                    >
                        <FaPlus /> Add Members
                    </button>

                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Name</th>
                                <th className="p-2 text-center">Member ID</th>
                                <th className="p-2 text-center">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {choirMembers.length > 0 ? (
                                choirMembers.map((item, index) => (
                                    <tr key={item._id} className="text-center border-b">
                                        <td className="p-2">
                                            {(CurrentPage - 1) * rowsPerPage + index + 1}
                                        </td>

                                        <td className="p-2">
                                            {item.member?.member_name || "-"}
                                        </td>

                                        <td className="p-2">
                                            {item.member?.member_id || "-"}
                                        </td>

                                        <td className="p-2">
                                            {item.member?.primary_contact || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">
                                        No data found
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
                />

            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Choir Member">
                <div className={saving ? "pointer-events-none opacity-60" : ""}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                            {/* member ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member ID</label>
                                <input
                                    type="text"
                                    placeholder="Search by ID"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    value={memberIdSearch}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setmemberIdSearch(val);
                                        debouncedSearchmemberById(val);
                                    }}
                                />
                            </div>

                            {/* member Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member Name</label>
                                <input
                                    type="text"
                                    placeholder="Search by Name"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    value={memberNameSearch}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setmemberNameSearch(val);
                                        debouncedSearchmemberByName(val);
                                    }}
                                />
                            </div>

                            {/* member Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    {...register("memberPhone")}
                                />
                            </div>

                            {/* Dropdown */}
                            {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                                <ul className="absolute left-0 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                    {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                                        <li
                                            key={m._id || m.member_id}
                                            className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                                            onClick={() => {
                                                if (!m._id) return;
                                                setValue("memberObjectId", m._id);   // 🔥 store ObjectId

                                                setmemberIdSearch(m.member_id);
                                                setmemberNameSearch(m.member_name);
                                                setValue("memberId", m.member_id);
                                                setValue("memberName", m.member_name);
                                                setValue("memberPhone", m.mobile_number);
                                                setmemberDropdownById([]);
                                                setmemberDropdownByName([]);
                                            }}
                                        >
                                            <span className="w-[265px] font-medium">{m.member_id}</span>
                                            <span className="flex-1">{m.member_name}</span>
                                            <span className="w-[150px] text-gray-500">{m.mobile_number}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <input
                            type="hidden"
                            {...register("memberObjectId", { required: "Please select a member" })}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            {/* 
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        >
                            Save
                        </button> */}

                            <Button
                                saving={saving}
                                type="save"
                            />
                        </div>


                    </form>
                </div>
            </Modal>
        </>
    )
}
