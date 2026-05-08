import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import { FaPeopleRoof } from "react-icons/fa6";
import Pagination from "../../Components/Helpers/Pagination";

export const PastorList = () => {
  const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pastors, setPastors] = useState([]);




  const [rowsPerPage, setRowsPerPage] = useState(25); // ✅ default 25
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const fetchPastors = async (
    page = 1,
    searchVal = "",
    statusVal = "All"
  ) => {
    try {
      const res = await axios.get(`${URL}/pastors/list`, {
        params: {
          page,
          limit: rowsPerPage,     // ✅ important
          search: searchVal,
          status: statusVal
        },
        headers: { Authorization: token }
      });

      setPastors(res.data.data || []);
      setCurrentPage(res.data.currentPage || page);
      setTotalPages(
        res.data.totalPages || res.data.total_pages || 1
      );
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };


  useEffect(() => {
    fetchPastors(CurrentPage, searchTerm, statusFilter);
  }, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
       
           <h1 className="text-xl font-bold capitalize text-lavender--600">
                            Pastors
                        </h1>
        <div className="flex items-center justify-between p-2">
          <div>
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
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Pastor Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button onClick={() => navigate('/admin/pastorlist/addpastor')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Pastor
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Pastor ID</th>
                <th className="p-2 text-center">Pastor Name</th>
                <th className="p-2 text-center">Pastor Tamil Name</th>
                <th className="p-2 text-center">Work Period</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pastors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No pastors found
                  </td>
                </tr>
              ) : (
                pastors.map((p, index) => (
                  <tr key={p._id} className="border-b ">
                    <td className="p-2 text-center">  {(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center font-semibold">{p.pastor_id}</td>
                    <td className="p-2 text-left">{p.pastor_name}</td>
                    <td className="p-2 text-left">{p.pastor_tamil_name}</td>

                    {/* Work period (Joining date → Today) */}
                    <td className="p-2 text-center">
                      {p.joining_date ? (
                        p.status === "Inactive" && p.left_date ? (
                          `${new Date(p.joining_date).toLocaleDateString()} → ${new Date(
                            p.left_date
                          ).toLocaleDateString()}`
                        ) : (
                          `${new Date(p.joining_date).toLocaleDateString()} → Present`
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs 
                        ${p.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-2 text-center flex ">
                      <FaEye size={18} className="text-lavender--600 m-auto cursor-pointer"
                        onClick={() => navigate(`/admin/pastorlist/viewpastor/${p._id}`)} />
                      <FaPeopleRoof size={18} className="text-lavender--600 m-auto cursor-pointer"
                        onClick={() => navigate(`/admin/pastorlist/pastorfampreview/${p._id}`)} />
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
        />


        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

      </div>
    </>
  )
}
