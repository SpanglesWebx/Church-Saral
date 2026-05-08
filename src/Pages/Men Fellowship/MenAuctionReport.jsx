import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaEye } from "react-icons/fa";
import Pagination from "../../Components/Helpers/Pagination";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

const URL = import.meta.env.VITE_BACKEND_API_URL;

const tableHeading = [
  "Sl. No.",
  "Buyer ID",
  "Buyer Name",
  "Buyer Phone",
  "Overall Unpaid",
  "Action",
];

export const MenAuctionReport = () => {
  const [auctions, setAuctions] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: "",
    message: ""
  });

  // 🔹 Fetch Men Auction report (grouped by buyer)
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get(
          `${URL}/men-auctions/report/by-buyer?search=${search}&page=${CurrentPage}&limit=${rowsPerPage}`,
          { headers: { Authorization: token } }
        );
        setAuctions(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching men auctions:", err);
        setAuctions([]);
      }
    };
    fetchAuctions();
  }, [token, search, CurrentPage, rowsPerPage]);



  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleView = (buyer) => {
    setSelectedBuyer(buyer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBuyer(null);
    setIsModalOpen(false);
    setPaymentAmount("");
  };

  const handlePayment = async (auctionId) => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      setResponse({
        status: "Failed",
        message: "Enter a valid payment amount"
      });
      return;
    }

    try {
      // ✅ Call Payment API
      const res = await axios.post(
        `${URL}/men-auctions/payment`,
        {
          auctionId,
          amountPaid: Number(paymentAmount),
        },
        { headers: { Authorization: token } }
      );


      setResponse({
        status: "Success",
        message: res.data?.message || "Payment successful"
      });

      // ✅ Success message (optional)
      console.log(res.data.message);

      // ✅ Refresh report (IMPORTANT FIX)
      const reportRes = await axios.get(
        `${URL}/men-auctions/report/by-buyer`,
        {
          headers: { Authorization: token },
          params: {
            page: CurrentPage,
            limit: rowsPerPage, // ✅ FIXED
            search,
          },
        }
      );

      const reports = reportRes.data.data || [];

      // ✅ Find updated buyer safely
      const updatedBuyer = reports.find(
        (b) =>
          (b.buyerId && b.buyerId === selectedBuyer.buyerId) ||
          (b.buyerPhone && b.buyerPhone === selectedBuyer.buyerPhone)
      );

      // ✅ Update UI
      setSelectedBuyer(updatedBuyer || null);
      setAuctions(reports);
      setPaymentAmount("");

    } catch (err) {
      console.error("Payment error:", err.response?.data || err);

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Payment failed"
      });
    }
  };


  return (
    <div className="relative h-auto  w-full bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between p-4">

          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Men’s Auction Reports
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search Members..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset to first page when searching
                }}
              />
            </div>
          </div>
        </div>


        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                {tableHeading.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2  text-gray-700 text-center"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={tableHeading.length}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                auctions.map((buyer, bi) => (
                  <tr key={bi} className="border-b">
                    <td className="px-4 py-2 text-center">{(CurrentPage - 1) * rowsPerPage + bi + 1}</td>
                    <td className="px-4 py-2 text-center">
                      {buyer.isMember
                        ? buyer.buyerId
                        : buyer.buyerPhone
                          ? `Phone: ${buyer.buyerPhone}`
                          : "Non-Member"}
                    </td>
                    <td className="px-4 py-2">{buyer.buyerName}</td>
                    <td className="px-4 py-2 text-center">{buyer.buyerPhone}</td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${buyer.overallUnpaid > 0
                        ? "text-red-600"
                        : "text-green-600"
                        }`}
                    >
                      ₹{Number(buyer.overallUnpaid || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer mx-auto text-lavender--600 hover:text-lavender--600"
                        onClick={() => handleView(buyer)}
                        title="View"
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
          defaultRows={25}
        />
      </div>

      {/* Modal */}
      {isModalOpen && selectedBuyer && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Payment History - ${selectedBuyer.buyerName} ${selectedBuyer.isMember && selectedBuyer.buyerId
            ? `(${selectedBuyer.buyerId})`
            : selectedBuyer.buyerPhone
              ? `(${selectedBuyer.buyerPhone})`
              : ""
            }`}
        >
          <div className="space-y-3 max-h-[600px] overflow-y-auto">

            {/* ✅ Buyer Info (UPDATED UI) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-lg">

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-[90px]">Buyer:</span>
                  <span className="text-gray-900">{selectedBuyer.buyerName}</span>
                </div>

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-[90px]">Phone:</span>
                  <span className="text-gray-900">
                    {selectedBuyer.buyerPhone || "-"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-[110px]">
                    Due Amount:
                  </span>
                  <span className="text-red-600 font-bold text-xl">
                    ₹ {selectedBuyer.overallUnpaid}
                  </span>
                </div>

              </div>
            </div>

            {/* ✅ Payment Input with MAX LOGIC */}
            {selectedBuyer.overallUnpaid > 0 && (
              <div className="flex space-x-2 mb-4">

                <input
                  type="number"
                  value={paymentAmount}
                  min="0"
                  max={selectedBuyer.overallUnpaid}
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    let val = e.target.value;

                    if (val === "") {
                      setPaymentAmount("");
                      return;
                    }

                    val = Number(val);

                    if (val === 0) {
                      setPaymentAmount("");
                      return;
                    }

                    if (val > selectedBuyer.overallUnpaid) {
                      val = selectedBuyer.overallUnpaid;
                    }

                    setPaymentAmount(val);
                  }}
                  placeholder={`Enter amount (Max ₹${selectedBuyer.overallUnpaid})`}
                  className="px-3 py-2 flex-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />

                <button
                  onClick={() => handlePayment(selectedBuyer.auctions[0]._id)}
                  disabled={
                    !paymentAmount ||
                    Number(paymentAmount) <= 0 ||
                    Number(paymentAmount) > selectedBuyer.overallUnpaid
                  }
                  className={`px-4 py-2 rounded text-white
              ${!paymentAmount || Number(paymentAmount) <= 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"
                    }
            `}
                >
                  Pay
                </button>

              </div>
            )}

            {/* ✅ Auctions Table (same) */}
            <table className="w-full border mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Seller</th>
                  <th className="p-2 border text-right">Auction Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBuyer.auctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(auction.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-2 border">{auction.item}</td>
                    <td className="p-2 border">{auction.sellerName}</td>
                    <td className="p-2 border text-right">₹{auction.amount}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan="3" className="p-2 border text-right">
                    Totals
                  </td>
                  <td className="p-2 border text-right">
                    ₹
                    {selectedBuyer.auctions.reduce(
                      (sum, a) => sum + a.amount,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ✅ Payments Table */}
            {selectedBuyer.payments && selectedBuyer.payments.length > 0 && (
              <>
                <h3 className="text-md font-bold mb-2">Payments Made</h3>
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBuyer.payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border">
                          {new Date(p.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="p-2 border text-right text-green-600 font-semibold">
                          ₹{p.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

          </div>
        </Modal>
      )}




      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </div>
  );
};
