import React, { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import { Checkbox, FormControlLabel } from '@mui/material';
import axios from "axios";
import { useRef } from "react";
import { URL } from "../../App";
import { useForm } from 'react-hook-form';


import Button from "../../Components/Form/Button";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import CharCounter from "../../Components/Form/CharCounter";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";

export const WomenMember = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [femaleIdSearch, setFemaleIdSearch] = useState("");
  const [femaleNameSearch, setFemaleNameSearch] = useState("");
  const [femaleDropdownById, setFemaleDropdownById] = useState([]);
  const [femaleDropdownByName, setFemaleDropdownByName] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [womenMembers, setWomenMembers] = useState([]);
  const [loading, setLoading] = useState(false);


  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [searchTerm, setSearchTerm] = useState("");


  const { saving, startSaving, stopSaving } = useSaving();
  const { errors: tempErrors, showError } = useTemporaryError();

  useBlockRefresh(saving);

    const token = window.sessionStorage.getItem("token");
  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset(); // clear form fields if using react-hook-form
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      memberId: "",
      memberName: "",
      phone: "",
      memberObjectId: ""
    },
  });
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // ✅ Female search by ID
  const debouncedSearchFemaleById = useRef(
    debounce(async (val) => {
      if (!val) return setFemaleDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/female/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setFemaleDropdownById(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setFemaleDropdownById([
            { member_id: "none", member_name: "No female members match your search", mobile_number: "" }
          ]);
        } else {
          setFemaleDropdownById([]);
        }
      }
    }, 300)
  ).current;


  // ✅ Female search by Name
  const debouncedSearchFemaleByName = useRef(
    debounce(async (val) => {
      if (!val) return setFemaleDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search/female?name=${val}`, {
          headers: { Authorization: token },
        });
        setFemaleDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setFemaleDropdownByName([
            { member_id: "none", member_name: "No female members match your search", mobile_number: "" }
          ]);
        } else {
          setFemaleDropdownByName([]);
        }
      }
    }, 300)
  ).current;
  // ✅ fetch Women’s Fellowship list
  const fetchWomenMembers = async () => {

    try {

      setLoading(true);

      const res = await axios.get(`${URL}/womens-fellowship`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm
        }
      });

      setWomenMembers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {

      console.error("❌ Error fetching Women’s Fellowship members:", err);
      setWomenMembers([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchWomenMembers();
  }, [CurrentPage, rowsPerPage, searchTerm]);

  const onSubmit = async () => {

    startSaving();

    try {

      const memberId = watch("memberObjectId");

      if (!memberId) {
        setResponse({
          status: "Failed",
          message: "Please select a member"
        });
        return;
      }

      await axios.post(`${URL}/womens-fellowship`,
        {
          member: memberId
        },
        {
          headers: { Authorization: token }
        }
      );

      setResponse({
        status: "Success",
        message: "Member added to Women's Fellowship"
      });

      handleCloseModal();
      fetchWomenMembers();

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error adding member"
      });

    } finally {
      stopSaving();
    }
  };

  return (
    <>
     <div className="p-3 sm:p-4 lg:p-6 mx-2 sm:mx-4 lg:mx-6 mt-3 bg-white shadow-md rounded-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

               <h1 className="text-xl font-bold capitalize text-lavender--600">
                    Women's Fellowship Members
                </h1>

          <div className="w-full md:w-auto">
              <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 flex items-center pointer-events-none  left-3">
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search..."
                value={searchTerm}

                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FormControlLabel control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />}
              label="Tamil Names Only" />
            <button
              onClick={handleOpenModal}
              
              className="flex items-center justify-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg w-full sm:w-auto"
            >
              <FaPlus /> Add Women
            </button>
          </div>
        </div>


        <div className="w-full overflow-x-auto mt-6">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className='text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center'>
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                {showTamilOnly ? (
                  <th className="p-2 text-center">Member Tamil Name</th>
                ) : (
                  <>
                    <th className="p-2 text-center">Member Name</th>
                    <th className="p-2 text-center">Member Tamil Name</th>
                  </>
                )}

                <th className="p-2 text-center">Phone</th>
                {/* <th className="p-2 text-center">Action</th> */}
              </tr>
            </thead>
            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4">Loading...</td>
                </tr>
              ) : womenMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4">No Women’s Fellowship members found</td>
                </tr>
              ) : (
                womenMembers.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2">{m.member_id}</td>
                    {showTamilOnly ? (
                      <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                    ) : (
                      <>
                        <td className="p-2 text-left">{m.member_name}</td>
                        <td className="p-2 text-left">{m.member_tamil_name || "-"}</td>
                      </>
                    )}

                    <td className="p-2">{m.mobile_number}</td>
                    {/* <td className="p-2">
                      <button className="px-3 py-1 text-sm text-white bg-red-500 rounded">
                        Delete
                      </button>
                    </td> */}
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


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Women Member">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 border rounded-lg bg-gray-50">



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">

              {/* Member ID */}
              <div className="relative">

                <RequiredLabel>Member ID</RequiredLabel>

                <input
                  type="text"
                  maxLength={50}
                  placeholder="Search by ID"
                  {...register("memberId", { required: true })}
                  value={femaleIdSearch}
                  onChange={(e) => {

                    const val = e.target.value;

                    setFemaleIdSearch(val);
                    setValue("memberId", val);

                    validateMaxLength("memberId", val, 50, showError);

                    debouncedSearchFemaleById(val);

                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm pr-12"
                />

                <CharCounter value={watch("memberId") || ""} max={50} show />

                {tempErrors.memberId && (
                  <p className="text-xs text-red-500 mt-1">
                    {tempErrors.memberId}
                  </p>
                )}

              </div>




              {/* Member Name */}
              <div className="relative">

                <RequiredLabel>Member Name</RequiredLabel>

                <input
                  type="text"
                  maxLength={50}
                  placeholder="Search by Name"
                  {...register("memberName", { required: true })}
                  value={femaleNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;

                    setValue("memberName", val);
                    setFemaleNameSearch(val);
                    validateMaxLength("memberName", val, 50, showError);
                    debouncedSearchFemaleByName(val);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm pr-12"
                />

                <CharCounter value={watch("memberName") || ""} max={50} show />

                {tempErrors.memberName && (
                  <p className="text-xs text-red-500 mt-1">
                    {tempErrors.memberName}
                  </p>
                )}

              </div>

              {/* Phone */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"

                  readOnly
                  {...register("phone")}
                  value={watch("phone") || ""}
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {/* ✅ Unified Dropdown for ID + Name */}
              {(femaleDropdownById.length > 0 || femaleDropdownByName.length > 0) && (
                <ul className="absolute left-0 mt-[65px] w-full md:w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {(femaleDropdownById.length > 0 ? femaleDropdownById : femaleDropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      className={`flex px-3 py-2 text-sm text-gray-700 ${m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer transition"
                        }`}
                      onClick={() => {
                        if (m.member_id === "none") return;
                        setFemaleIdSearch(m.member_id);
                        setFemaleNameSearch(m.member_name);
                        setValue("memberId", m.member_id);
                        setValue("memberName", m.member_name);
                        setValue("memberTamilName", m.member_tamil_name);
                        setValue("memberObjectId", m._id);
                        setValue("phone", m.mobile_number);
                        setFemaleDropdownById([]);
                        setFemaleDropdownByName([]);
                      }}
                    >
                      <span className="w-[250px] font-medium">{m.member_id === "none" ? m.member_name : m.member_id}</span>
                      {m.member_id !== "none" && <span className="flex-1">{m.member_name}</span>}
                      {m.member_id !== "none" && <span className="w-[200px] text-gray-500">{m.mobile_number}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>



          </div>
          <div className="flex justify-end gap-3 mt-4">

            <Button
              saving={saving}
              type="save"
              buttonType="submit"
            />
          </div>
        </form>

      </Modal>

      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </>
  )
}
