import React, { useState } from "react";
import Spinners from "../Spinners";
import moment from "moment";
import { FaEye } from "react-icons/fa";
import DetailModal from "../Expense/detailsModal";

export default function OfferingTable({ offerings, loading, CurrentPage }) {

  const tableHeading = [
    "Sl No.",
    "Date",
    "Trans ID",
    "Offerings Type",
    "Amount",
    "Action",
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleShowDetails = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <Spinners />;

  return (
    <div className="overflow-x-auto mt-4">

      {/* ================= MAIN TABLE ================= */}
      <table className="w-full text-sm text-gray-500">

        {/* HEADER */}
        <thead className="text-base text-gray-700">
          <tr>
            {tableHeading.map((heading) => (
              <th key={heading} className="p-2 text-center">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {offerings?.length > 0 ? (
            offerings.map((member, index) => (
              <tr
                key={member._id}
                className="text-center border-b hover:bg-gray-50"
              >

                {/* Sl No */}
                <td className="p-2">
                  {(CurrentPage - 1) * 15 + (index + 1)}
                </td>

                {/* Date */}
                <td className="p-2">
                  {/* {moment(member.date).format("DD/MM/YYYY hh:mm A")} */}

                  {moment.utc(member.date).format("DD/MM/YYYY")}

                </td>


                <td className="p-2 font-semibold ">
                  {member.transId}
                </td>


                {/* Offering Type */}
                <td className="p-2 font-medium">
                  {member.subCategory}
                </td>

                {/* Amount */}
                <td className="p-2">
                  ₹ {member.amount}
                </td>

                {/* Action */}
                <td className="p-2 flex justify-center">
                  <FaEye
                    size={18}
                    className="text-lavender--600 cursor-pointer"
                    title="View Details"
                    onClick={() => handleShowDetails(member)}
                  />
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={tableHeading.length}
                className="p-4 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* ================= DETAILS MODAL ================= */}
      <DetailModal isOpen={isModalOpen} onClose={handleCloseModal}>

        {selectedMember ? (

          <div className="flex flex-col gap-5 p-2">

            {/* ⭐ HEADER */}
            <h2 className="text-lg font-semibold text-gray-700">
              Offering Details
            </h2>

            {/* ⭐ KEY VALUE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Offerings Type</span>
                <span className="text-sm font-medium text-gray-800">
                  {selectedMember.subCategory}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Date & Time</span>
                <span className="text-sm font-medium text-gray-800">
                  {/* {moment(selectedMember.date).format("DD/MM/YYYY hh:mm A")} */}

                  {moment.utc(selectedMember.date).format("DD/MM/YYYY")}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Day</span>
                <span className="text-sm font-medium text-gray-800">
                  {/* {moment(selectedMember.date).format("dddd")} */}


                  {moment.utc(selectedMember.date).format("dddd")}
                </span>
              </div>


              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Trans ID</span>
                <span className="text-sm font-medium text-gray-800">
                  {selectedMember.transId}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Amount</span>
                <span className="text-sm font-medium text-gray-800">
                  ₹ {selectedMember.amount}
                </span>
              </div>

              <div className="flex flex-col sm:col-span-2">
                <span className="text-xs text-gray-500">Description</span>
                <span className="text-sm font-medium text-gray-800">
                  {selectedMember.description || "-"}
                </span>
              </div>

            </div>

          </div>

        ) : (
          <p>No details available</p>
        )}

      </DetailModal>

    </div>
  );
}

