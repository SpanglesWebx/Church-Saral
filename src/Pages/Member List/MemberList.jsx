import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye, FaPrint, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/Pagination";
import { FiDownload } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";



export const MemberList = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [memberList, setMemberList] = useState([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [rowsInput, setRowsInput] = useState("");

  const [jumpInput, setJumpInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);




  // const fetchMemberList = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${URL}/new-members?page=${CurrentPage}&search=${searchTerm}&status=${statusFilter}&limit=${rowsPerPage || 50}`,
  //       { headers: { Authorization: token } }
  //     );

  //     setMemberList(res.data.data || []);
  //     setTotalPages(res.data.totalPages || 1);
  //   } catch (err) {
  //     console.error("Fetch Members Error:", err);
  //     setMemberList([]);
  //   }
  // };


  const fetchMemberList = async () => {
    try {
      const res = await axios.get(`${URL}/new-members`, {
        params: {
          page: CurrentPage,
          search: searchTerm,
          status: statusFilter,
          limit: rowsPerPage,
        },
        headers: { Authorization: token },
      });

      setMemberList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error("Fetch Members Error:", err);
      setMemberList([]);
    }
  };



  useEffect(() => {
    fetchMemberList();
  }, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);


  const downloadMembersPDF = async (type) => {
    try {
      setIsDownloading(true);

      const res = await axios.get(`${URL}/new-members/download-pdf`, {
        params: { type },
        headers: { Authorization: token },
        responseType: "blob", // 🔥 FIXED
      });

      const blob = new Blob([res.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Members.pdf";
      document.body.appendChild(link); // ✅ important
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url); // ✅ cleanup

      setIsDownloadModalOpen(false);

    } catch (err) {
      console.error("Download Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };


  const getPaginationPages = () => {
    const pages = [];
    const range = 2; // show 2 pages before & after current

    if (TotalPages <= 7) {
      for (let i = 1; i <= TotalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Left ellipsis
    if (CurrentPage > range + 2) {
      pages.push("ellipsis-left");
    }

    // Middle pages (CurrentPage - 2 to CurrentPage + 2)
    const start = Math.max(2, CurrentPage - range);
    const end = Math.min(TotalPages - 1, CurrentPage + range);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (CurrentPage < TotalPages - (range + 1)) {
      pages.push("ellipsis-right");
    }

    // Always show last page
    pages.push(TotalPages);

    return pages;
  };





  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">



          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-lavender--600">
              Members
            </h1>

            <FaFilePdf
              size={22}
              className="text-red-600 cursor-pointer"
              title="Download PDF"
              onClick={() => setIsDownloadModalOpen(true)}
            />
          </div>



        </div>

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
            <label className="text-l font-medium text-gray-600 mb-1">Member Status</label>
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

          <button onClick={() => navigate('/admin/memberlist/addnewmember')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Member
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Member Tamil Name</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {memberList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3">No Records Found</td>
                </tr>
              ) : (
                memberList.map((item, index) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 font-semibold">{item.member_id}</td>
                    <td className="p-2 text-left">{item.member_name}</td>
                    <td className="p-2 text-left">{item.member_tamil_name || "-"}</td>
                    <td
                      className={`p-2 font-semibold ${item.status === "Active" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {item.status}
                    </td>
                    <td className="p-2 text-center flex justify-center gap-3 items-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer "
                        title="View Member"
                        onClick={() => navigate(`/admin/memberlist/viewmember/${item._id}`)}
                      />
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
          defaultRows={50}   // 🔥 THIS MAKES PLACEHOLDER 50
        />




        <SmallSizedModal
          isOpen={isDownloadModalOpen}
          onClose={() => {
            if (!isDownloading) {
              setIsDownloadModalOpen(false);
            }
          }}
          title="Download Members"
        >
          <div className="p-1 text-center">

            {/* ✅ Confirm text */}
            <p className="text-sm font-semibold text-gray-700 mb-6">
              Are you sure you want to download Member List PDF?
            </p>

            {/* ✅ Buttons */}
            <div className="flex justify-center gap-4 mb-6">

              <button
                disabled={isDownloading}
                onClick={() => downloadMembersPDF("list")}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yes
              </button>

              <button
                disabled={isDownloading}
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>

            </div>

            {/* ✅ Spinner */}
            {isDownloading && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin" />

                <p className="text-sm font-medium text-gray-700">
                  Downloading PDF... Please wait
                </p>
              </div>
            )}

          </div>
        </SmallSizedModal>

        <SmallSizedModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Print Members"
        >
          <div className="p-1 text-center">
            <p className="text-sm font-medium text-gray-700 mb-6">
              Do you want to Print as
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setIsPrintModalOpen(false);
                }}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Detailed
              </button>

              <button
                onClick={() => {
                  setIsPrintModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                List Only
              </button>
            </div>
          </div>
        </SmallSizedModal>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
