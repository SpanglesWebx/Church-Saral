import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FaEye } from 'react-icons/fa6'
import { URL } from "../../App";
import Pagination from '../../Components/Helpers/Pagination';
import Modal from '../../Components/Expense/ExpenseFormModal';

export const MarriageHallIssuedAssets = () => {

  const token = window.sessionStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await axios.get(`${URL}/marriage/issued-assets`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined
        }
      });

      setRows(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch {
      setRows([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, [CurrentPage, rowsPerPage, searchTerm]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-2">
          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Marriage Hall Issued Assets
          </h1>

          {/* SEARCH */}
          <div className="relative">
            {/* <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div> */}

            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search Name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">S No</th>
                <th className="p-2 text-center">Hall Name</th>
                <th className="p-2 text-center">Customer Name</th>
                <th className="p-2 text-center">Booking Date</th>
                <th className="p-2 text-center">No. of Items</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r._id} className="border-b text-center">
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="p-2">{r.hall?.hall_name}</td>
                    <td className="p-2">{r.customerName}</td>
                    <td className="p-2">
                      {new Date(r.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-2">
                      {r.issued_assets?.kitchen?.length || 0}
                    </td>
                    <td className="p-2">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600 mx-auto"
                        onClick={() => {
                          setSelectedBooking(r);
                          setIsModalOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                ))
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

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issued Assets Details"
      >
        {selectedBooking && (
          <div className="flex flex-col w-full max-w-3xl space-y-3 max-h-[650px] overflow-y-auto">

            {/* DETAILS */}
            {[
              { label: "Hall", value: selectedBooking.hall?.hall_name },
              { label: "Customer Name", value: selectedBooking.customerName },
              {
                label: "Booking Date",
                value: new Date(selectedBooking.date).toLocaleDateString("en-GB")
              },
              {
                label: "No of Items",
                value: selectedBooking.issued_assets?.kitchen?.length || 0
              }
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-semibold text-gray-700">
                  {item.label}
                </div>
                <div className="col-span-8 text-gray-800">
                  {item.value}
                </div>
              </div>
            ))}

            {/* ITEMS TABLE */}
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Issued Items
              </h3>

              <div className="overflow-x-auto">
                {selectedBooking?.issued_assets?.kitchen?.length > 0 ? (
                  <table className="w-full text-sm text-gray-500">
                    <thead className="text-base text-gray-700">
                      <tr>
                        <th className="p-2 text-center">S No</th>
                        <th className="p-2 text-center">Item</th>
                        <th className="p-2 text-center">Issued</th>
                        <th className="p-2 text-center">Returned</th>
                        <th className="p-2 text-center">Damaged</th>
                        <th className="p-2 text-center">Missing</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedBooking.issued_assets.kitchen.map((item, i) => (
                        <tr key={item._id} className="border-b text-center">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2">{item.item_name}</td>
                          <td className="p-2">{item.issued_qty}</td>
                          <td className="p-2">{item.returned}</td>
                          <td className="p-2">{item.damaged}</td>
                          <td className="p-2">{item.missing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No data found
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </Modal>
    </>
  );
};