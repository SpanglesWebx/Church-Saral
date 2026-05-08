import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";

import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";

import { URL } from "../../App";

export const ReservedSlots = () => {

  const [reservedSlots, setReservedSlots] = useState([]);
  const [search, setSearch] = useState("");

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const token = window.sessionStorage.getItem("token");

  // ✅ FETCH RESERVED ONLY
  const fetchReservedSlots = async () => {

    try {

      const res = await axios.get(
        `${URL}/cemetery/booking/reserved?page=${CurrentPage}&limit=${rowsPerPage}&search=${search}`,
        {
          headers: {
            Authorization: token
          }
        }
      );

      setReservedSlots(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error("Fetch Reserved Slots Error", err);
    }
  };

  useEffect(() => {
    fetchReservedSlots();
  }, [CurrentPage, rowsPerPage, search]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4">

          {/* Heading */}
          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Cemetery Reserved Slots
          </h1>

          {/* Search */}
          <div>
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Search
            </label>

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
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">

          <table className="w-full text-sm text-gray-500">

            {/* TABLE HEAD */}
            <thead className="text-base text-gray-700">

              <tr>
                <th className="p-2 text-center">S No</th>
                <th className="p-2 text-center">Cemetery Name</th>
                <th className="p-2 text-center">The Allottee</th>
                <th className="p-2 text-center">Buried Person</th>
                <th className="p-2 text-center">Slot ID</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>

            </thead>

            {/* TABLE BODY */}
            <tbody>

              {reservedSlots.length > 0 ? (

                reservedSlots.map((item, idx) => (

                  <tr
                    key={item._id}
                    className="border-t text-center"
                  >
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    <td className="p-2">
                      {item.cemeteryId?.cemeteryName || "-"}
                    </td>

                    <td className="p-2">
                      {
                        item.bookingPerson?.isMember
                          ? item.bookingPerson?.memberId?.member_name
                          : item.bookingPerson?.nonMember?.name
                      }
                    </td>

                    <td className="p-2">
                      {item.buriedPerson?.name || "-"}
                    </td>

                    <td className="p-2">
                      {item.slotId}
                    </td>

                    <td className="p-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        {item.status}
                      </span>
                    </td>

                    <td className="p-2">

                      <button
                        onClick={() => {
                          setSelectedData(item);
                          setIsModalOpen(true);
                        }}
                        title="View Details"
                        className="text-lavender--600"
                      >
                        <FaEye size={18} />
                      </button>

                    </td>
                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan={7}
                    className="p-3 text-center text-gray-400"
                  >
                    No reserved slots found
                  </td>
                </tr>

              )}

            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
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

      {/* VIEW MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserved Slot Details"
      >
        {selectedData && (

          <div className="flex justify-center">

            <div className="space-y-5 text-base w-full max-w-[620px]">

              {/* Cemetery Name */}
              <div className="flex">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Cemetery Name
                </p>

                <p className="text-gray-600">
                  {selectedData.cemeteryId?.cemeteryName || "-"}
                </p>
              </div>

              {/* Cemetery Location */}
              <div className="flex">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Cemetery Location
                </p>

                <p className="text-gray-600">
                  {selectedData.cemeteryId?.cemeteryLocation || "-"}
                </p>
              </div>

              {/* Slot ID */}
              <div className="flex">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Slot ID
                </p>

                <p className="text-gray-600">
                  {selectedData.slotId || "-"}
                </p>
              </div>

              {/* Allottee */}
              <div className="flex">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Allottee
                </p>

                <p className="text-gray-600">
                  {
                    selectedData.bookingPerson?.isMember
                      ? (
                        selectedData.bookingPerson?.memberId?.member_name || "-"
                      )
                      : (
                        selectedData.bookingPerson?.nonMember?.name || "-"
                      )
                  }
                </p>
              </div>

              {/* Buried Person */}
              <div className="flex">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Buried Person
                </p>

                <p className="text-gray-600">
                  {selectedData.buriedPerson?.name || "-"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <p className="font-semibold text-gray-700 min-w-[220px] text-left">
                  Status
                </p>

                <div>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    {selectedData.status}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}
      </Modal>
    </>
  );
};