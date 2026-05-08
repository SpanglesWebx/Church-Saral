

import React from 'react'

export const SanthaMembers = () => {
  return (
    <div>SanthaMembers</div>
  )
}




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { FaPlus, FaEye } from "react-icons/fa";
// import Pagination from "../../Components/Helpers/Pagination";
// import ExpenseFormModal from "../../Components/Expense/ExpenseFormModal";

// import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
// import { URL } from "../../App";

// export const SanthaMembers = () => {
//   const navigate = useNavigate();
//   const token = sessionStorage.getItem("token");

//   const [search, setSearch] = useState("");
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // pagination states (same pattern)
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(25);
//   const [rowsInput, setRowsInput] = useState("");
//   const [jumpInput, setJumpInput] = useState("");


//   const [viewData, setViewData] = useState([]);
//   const [openModal, setOpenModal] = useState(false);

//   const [Response, setResponse] = useState({ status: null, message: "" });
//   const [grandTotal, setGrandTotal] = useState(0);



//   const fetchSantha = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${URL}/santha/list`, {
//         params: {
//           page: currentPage,
//           limit: rowsPerPage,
//           search,
//         },
//         headers: {
//           Authorization: token,
//         },
//       });

//       setData(res.data.data);
//       setTotalPages(res.data.totalPages);

//     } catch (err) {
//       setResponse({
//         status: "Failed",
//         message: "Failed to fetch data",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchSantha();
//   }, [currentPage, rowsPerPage, search]);



//   const handleView = async (memberId) => {
//     console.log("CLICKED ID:", memberId); // 👈 DEBUG

//     try {
//       const res = await axios.get(`${URL}/santha/by-member`, {
//         params: { memberId },
//         headers: {
//           Authorization: token,
//         },
//       });

//       console.log("VIEW DATA:", res.data); // 👈 DEBUG

//       const result = res.data.data;

//       setViewData(Array.isArray(result) ? result : [result]);
//       setGrandTotal(res.data.grandTotal);
//       setOpenModal(true);


//     } catch (err) {
//       console.error(err); // 👈 SEE ERROR

//       setResponse({
//         status: "Failed",
//         message: "Failed to load member data",
//       });
//     }
//   };


//   return (
//     <>
//       <div className="p-2">

//         {/* CARD */}
//         <div className="p-5 mx-1 mt-3 bg-white shadow-md rounded-xl">

//           {/* HEADER */}
//           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//             {/* LEFT - HEADING */}
//             <h1 className="text-xl font-bold text-lavender--600">
//               Santha
//             </h1>

//             {/* CENTER - SEARCH */}
//             <div className="flex justify-center flex-1">
//               <input
//                 type="search"
//                 placeholder="Search by Member ID or Name"
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="block py-1 text-sm text-gray-900 rounded w-64 ps-3 bg-gray-50"
//               />
//             </div>

//             {/* RIGHT - ADD BUTTON */}
//             <button
//               onClick={() => navigate("/admin/santha/add")}
//               className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg whitespace-nowrap"
//             >
//               <FaPlus /> Add Santha
//             </button>

//           </div>

//           {/* TABLE */}
//           <div className="overflow-x-auto mt-4">
//             <table className="w-full text-sm text-gray-500">

//               {/* HEADER */}
//               <thead className="text-base text-gray-700">
//                 <tr>
//                   {[
//                     "Sl No.",
//                     "Member ID",
//                     "Member Name",
//                     "Member Tamil Name",

//                     "Action",
//                   ].map((h) => (
//                     <th key={h} className="p-2 text-center">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               {/* BODY */}
//               <tbody>
//                 {data.length > 0 ? (
//                   data.map((row, i) => (
//                     <tr key={i} className="text-center border-b">

//                       {/* SL NO */}
//                       <td className="p-2">
//                         {(currentPage - 1) * rowsPerPage + i + 1}
//                       </td>

//                       {/* MEMBER ID */}
//                       <td className="p-2  font-semibold">{row.member_id}</td>

//                       {/* MEMBER NAME */}
//                       <td className="p-2 text-left">{row.member_name}</td>
//                       <td className="p-2 text-left">{row.member_tamil_name}</td>



//                       {/* ACTION */}
//                       <td className="p-2 flex justify-center">
//                         <FaEye
//                           size={18}
//                           className="text-lavender--600 cursor-pointer"
//                           title="View Member"
//                           onClick={() => {
//                             if (!row._id) {
//                               console.log("Missing ID:", row);
//                               setResponse({
//                                 status: "Failed",
//                                 message: "Member ID missing",
//                               });
//                               return;
//                             }

//                             handleView(row._id);
//                           }}
//                         />
//                       </td>

//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={5} className="p-4 text-center text-gray-500">
//                       No data found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>

//             </table>
//           </div>

//           {/* PAGINATION */}
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             rowsPerPage={rowsPerPage}
//             rowsInput={rowsInput}
//             jumpInput={jumpInput}
//             setCurrentPage={setCurrentPage}
//             setRowsPerPage={setRowsPerPage}
//             setRowsInput={setRowsInput}
//             setJumpInput={setJumpInput}
//           />

//         </div>





//       </div>


//       {openModal && (
//         <ExpenseFormModal
//           isOpen={openModal}
//           title="Santha Details"
//           onClose={() => setOpenModal(false)}
//         >
//           <div className="space-y-4">

//             {/* ✅ MEMBER DETAILS */}
//             {viewData.length > 0 && (
//               <div className="grid grid-cols-2 gap-3 text-sm border-b pb-3">

//                 <div>
//                   <strong>Member ID:</strong> {viewData[0].member_id}
//                 </div>

//                 <div>
//                   <strong>Member Name:</strong> {viewData[0].member_name}
//                 </div>

//                 <div>
//                   <strong>Family ID:</strong> {viewData[0].family_id}
//                 </div>

//                 <div>
//                   <strong>Phone:</strong> {viewData[0].primary_contact}
//                 </div>

//               </div>
//             )}



//             {/* ✅ GRAND TOTAL */}
//             {viewData.length > 0 && (
//               <div className="flex justify-end items-center bg-gray-50 border rounded-md px-4 py-2">

//                 <span className="text-sm text-gray-600 mr-2">
//                   Total Amount:
//                 </span>

//                 <span className="text-lg font-bold text-green-600">
//                   ₹ {grandTotal}
//                 </span>

//               </div>
//             )}

//             {/* ✅ TABLE */}
//             <div className="max-h-[450px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
//               <table className="w-full text-sm text-gray-700 border-collapse">

//                 {/* HEADER */}
//                 <thead className="bg-gray-100 sticky top-0 z-10">
//                   <tr>
//                     <th className="p-3 border text-center font-semibold">S.No</th>
//                     <th className="p-3 border text-center font-semibold">Date</th>
//                     <th className="p-3 border text-center font-semibold">Trans ID</th>
//                     <th className="p-3 border text-center font-semibold">Month</th>
//                     <th className="p-3 border text-center font-semibold">Amount</th>
//                   </tr>
//                 </thead>

//                 {/* BODY */}
//                 <tbody>
//                   {viewData.length > 0 ? (() => {

//                     // ✅ GROUP BY DATE
//                     const grouped = {};

//                     viewData.forEach(item => {
//                       const d = new Date(item.date).toLocaleDateString("en-GB");
//                       if (!grouped[d]) grouped[d] = [];
//                       grouped[d].push(item);
//                     });

//                     let serial = 1;

//                     return Object.entries(grouped).map(([date, items]) => {
//                       return items.map((item, index) => (
//                         <tr
//                           key={serial}
//                           className="text-center border-b hover:bg-gray-50 transition"
//                         >

//                           {/* S.NO */}
//                           <td className="p-2 border">{serial++}</td>

//                           {/* DATE (ROWSPAN) */}
//                           {index === 0 && (
//                             <td
//                               className="p-2 border font-medium bg-gray-50"
//                               rowSpan={items.length}
//                             >
//                               {date}
//                             </td>
//                           )}


//                           <td className="p-2 border text-lavender--600 font-semibold">
//                             {item.transId}
//                           </td>

//                           {/* MONTH */}
//                           <td className="p-2 border">{item.month}</td>

//                           {/* AMOUNT */}
//                           <td className="p-2 border font-semibold text-green-600">
//                             ₹ {item.amount}
//                           </td>

//                         </tr>
//                       ));
//                     });

//                   })() : (
//                     <tr>
//                       <td colSpan={4} className="p-4 text-center text-gray-500">
//                         No data found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>

//               </table>
//             </div>

//           </div>
//         </ExpenseFormModal>
//       )}
//       {Response.status &&
//         (Response.status === "Success" ? (
//           <SuccessMessage Message={Response.message} />
//         ) : (
//           <FailedMessage Message={Response.message} />
//         ))}

//     </>
//   );
// };

