import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";


export const NewFamilyList = () => {
  const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");

  const [familyList, setFamilyList] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsInput, setRowsInput] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [jumpInput, setJumpInput] = useState("");


  const fetchFamilyList = async () => {
    try {
      // const res = await axios.get(
      //   `${URL}/family/list?page=${CurrentPage}&search=${searchTerm}&limit=${rowsPerPage}`,
      //   { headers: { Authorization: token } }
      // );


      const res = await axios.get(`${URL}/family/list`, {
        params: {
          page: CurrentPage,
          search: searchTerm,
          limit: rowsPerPage,
        },
        headers: { Authorization: token },
      });


      setFamilyList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Family Error:", err);
      setFamilyList([]);
    }
  };

  useEffect(() => {
    fetchFamilyList();
  }, [CurrentPage, searchTerm, rowsPerPage]);

  const getPaginationPages = () => {
    const pages = [];
    const range = 2;

    if (TotalPages <= 7) {
      for (let i = 1; i <= TotalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (CurrentPage > range + 2) pages.push("ellipsis-left");

    const start = Math.max(2, CurrentPage - range);
    const end = Math.min(TotalPages - 1, CurrentPage + range);

    for (let i = start; i <= end; i++) pages.push(i);

    if (CurrentPage < TotalPages - (range + 1)) pages.push("ellipsis-right");

    pages.push(TotalPages);

    return pages;
  };


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Families
          </h1>

          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No</th>
                <th className="p-2 text-center">Family ID</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Family Head Name</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {familyList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3">No Families Found</td>
                </tr>
              ) : (
                familyList.map((fam, index) => (
                  <tr key={fam._id} className="border-b">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 font-semibold">{fam.family_id}</td>
                    <td className="p-2">{fam.head?.member_id}</td>
                    <td className="p-2 text-left">{fam.head?.member_name}</td>

                    <td className="p-2 flex justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => navigate("/admin/familylist/familymemberslist", {
                          state: { familyId: fam.family_id }
                        })}
                      />
                    </td>
                  </tr>
                ))
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
  defaultRows={50}
/>

      </div>
    </>
  );
};
