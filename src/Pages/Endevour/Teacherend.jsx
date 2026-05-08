import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";

export const Teacherend = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
    const token = window.sessionStorage.getItem("token");

  const [rowsPerPage, setRowsPerPage] = useState(10);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


const fetchTeachers = async (page = 1, query = "") => {
  try {
    const res = await axios.get(`${URL}/endeavour-classes/teachers/details`, {
      headers: { Authorization: token },
      params: { page, limit: 10, search: query },
    });
    setTeachers(res.data.teachers || []);
    setTotalPages(res.data.totalPages || 1);
    setCurrentPage(res.data.page || 1);
  } catch (err) {
    console.error("Error fetching endeavour teachers:", err);
    setTeachers([]);
  }
};

// Fetch whenever page or searchQuery changes
useEffect(() => {
  fetchTeachers(CurrentPage, searchQuery);
}, [CurrentPage, searchQuery]);


  const filteredTeachers = teachers.filter(
    (t) =>
      t.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacher_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
      {/* 🔎 Search bar */}
      <div className="flex flex-col items-center justify-between lg:flex-row">
            <h1 className="text-xl font-bold capitalize text-lavender--600">
                  Endeavour Teachers
            </h1>

        <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg
                className="w-3 h-3 text-gray-500"
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
              id="teacher-search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              placeholder="Search..."
              value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on search
  }}
            />
          </div>
        </div>
      </div>

   
     {/* 📋 Table */}
<div className="overflow-x-auto mt-4">
  <table className="w-full text-sm text-gray-500">

    {/* HEADER */}
    <thead className="text-base text-gray-700">
      <tr>
        <th className="p-2 text-center">Sl No</th>
        <th className="p-2 text-center">Teacher ID</th>
        <th className="p-2 text-center">Teacher Name</th>
        <th className="p-2 text-center">Mobile Number</th>
        <th className="p-2 text-center">Class</th>
        <th className="p-2 text-center">Section</th>
      </tr>
    </thead>

    {/* BODY */}
    <tbody>
      {teachers.length === 0 ? (
        <tr>
          <td
            colSpan={6}
            className="p-4 text-center text-gray-500"
          >
            No data found
          </td>
        </tr>
      ) : (
        teachers.map((t, idx) => (
          <tr
            key={t.class_id}
            className="text-center border-b hover:bg-gray-50"
          >
            <td className="p-2">
              {(CurrentPage - 1) * 10 + idx + 1}
            </td>
            <td className="p-2">{t.teacher_id}</td>
            <td className="p-2 font-medium">{t.teacher_name}</td>
            <td className="p-2">{t.mobile_number || "-"}</td>
            <td className="p-2">{t.class_name}</td>
            <td className="p-2">{t.section_name}</td>
          </tr>
        ))
      )}
    </tbody>

  </table>
</div>


      {/* 📑 Pagination */}
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
  );
};
