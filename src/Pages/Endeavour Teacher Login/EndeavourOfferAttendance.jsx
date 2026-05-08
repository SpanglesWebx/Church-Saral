




// import React, { useEffect, useState } from "react";
// import { URL } from "../../App";
// import axios from "axios";
// import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
// import { FaRegCircleCheck } from "react-icons/fa6";
// import { RxCrossCircled } from "react-icons/rx";

// export const EndeavourOfferAttendance = () => {
//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [amounts, setAmounts] = useState({});
//   const [attendanceMarked, setAttendanceMarked] = useState(false);
//   const [filterDate, setFilterDate] = useState(new Date());
//   const [saving, setSaving] = useState(false);

//   const [teacherInfo, setTeacherInfo] = useState({
//     class_name: "",
//     section_name: "",
//     totalStudents: 0,
//     class_id: null,
//   });

//   const [Response, setResponse] = useState({ status: null, message: "" });

//     const token = window.sessionStorage.getItem("token");

//   /* ================= FETCH STUDENTS ================= */

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const tokenData = JSON.parse(atob(token.split(".")[1]));
//         const teacherId = tokenData.member_id;

//         const res = await axios.get(
//           `${URL}/endeavour-classes/teacher/${teacherId}/students`,
//           { headers: { Authorization: token } }
//         );

//         const fetchedStudents = res.data.students || [];
//         setStudents(fetchedStudents);

//         if (fetchedStudents.length > 0) {
//           const firstStudent = fetchedStudents[0];

//           const initialAttendance = {};
//           const initialAmounts = {};

//           fetchedStudents.forEach((s) => {
//             initialAttendance[s.member_id] = null;
//             initialAmounts[s.member_id] = "";
//           });

//           setAttendance(initialAttendance);
//           setAmounts(initialAmounts);

//           setTeacherInfo({
//             class_name: firstStudent.class_name,
//             section_name: firstStudent.section_name,
//             totalStudents: fetchedStudents.length,
//             class_id: firstStudent.class_id,
//           });
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchStudents();
//   }, [token]);

//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get(
//         `${URL}/endeavour-attendance?classId=${teacherInfo.class_id}&date=${formatDate(filterDate)}`,
//         { headers: { Authorization: token } }
//       );

//       if (res.data) {
//         const record = res.data;

//         const attObj = {};
//         const amtObj = {};

//         record.attendance.forEach((a) => {
//           attObj[a.student._id] = a.present;
//           amtObj[a.student._id] = a.amount;
//         });

//         setAttendance(attObj);
//         setAmounts(amtObj);
//         setAttendanceMarked(true);
//       } else {
//         // reset if no attendance
//         const initAtt = {};
//         const initAmt = {};

//         students.forEach((s) => {
//           initAtt[s._id] = null;
//           initAmt[s._id] = "";
//         });

//         setAttendance(initAtt);
//         setAmounts(initAmt);
//         setAttendanceMarked(false);
//       }

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* ================= HANDLERS ================= */

//   const markPresent = (id) => {
//     setAttendance((prev) => ({ ...prev, [id]: true }));
//   };

//   const markAbsent = (id) => {
//     setAttendance((prev) => ({ ...prev, [id]: false }));
//     setAmounts((prev) => ({ ...prev, [id]: "" }));
//   };

//   const handleAmountChange = (id, value) => {
//     setAmounts((prev) => ({ ...prev, [id]: value }));
//   };

//   const totalStudents = students.length;

//   const presentCount = students.filter(
//     (s) => attendance[s.member_id] === true
//   ).length;

//   const absentCount = students.filter(
//     (s) => attendance[s.member_id] === false
//   ).length;

//   const totalOffering = students.reduce((sum, s) => {
//     return attendance[s.member_id] === true
//       ? sum + (Number(amounts[s.member_id]) || 0)
//       : sum;
//   }, 0);

//   const validateForm = () => {
//     const unmarked = students.some(
//       (s) => attendance[s.member_id] === null
//     );

//     if (unmarked) {
//       setResponse({
//         status: "Failed",
//         message: "Please mark attendance for all students",
//       });
//       return false;
//     }

//     return true;
//   };

//   const handleSave = async () => {
//     if (saving) return;
//     if (!validateForm()) return;

//     try {
//       setSaving(true);

//       const payload = {
//         class: teacherInfo.class_id,
//         date: filterDate.toISOString(),
//         attendance: students.map((s) => ({
//           student: s._id, // 🔥 use ObjectId
//           present: attendance[s.member_id] === true,
//           amount:
//             attendance[s.member_id] === true
//               ? Number(amounts[s.member_id]) || 0
//               : 0,
//         }))
//       };

//       await axios.post(`${URL}/endeavour-attendance`, payload, {
//         headers: { Authorization: token },
//       });

//       setAttendanceMarked(true);

//       setResponse({
//         status: "Success",
//         message: "Attendance saved successfully!",
//       });
//     } catch (err) {
//       setResponse({
//         status: "Failed",
//         message: "Failed to save attendance",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const formatDate = (date) => {
//     if (!date) return "";

//     const d = new Date(date);
//     if (isNaN(d)) return "";

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   };

//   /* ================= UI ================= */

//   return (
//     <>
//       <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
//         <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

//           <h1 className="text-xl font-bold capitalize text-lavender--600">
//             Endeavour Students Attendance
//           </h1>

//           {/* ================= TOP INFO ================= */}
//           <div className="mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">

//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//               {/* Left Side - Class Details */}
//               <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-semibold text-gray-700">

//                 <div>
//                   Class:
//                   <span className="ml-2 text-gray-900 font-bold">
//                     {teacherInfo.class_name || "-"}
//                   </span>
//                 </div>

//                 <div>
//                   Section:
//                   <span className="ml-2 text-gray-900 font-bold">
//                     {teacherInfo.section_name || "-"}
//                   </span>
//                 </div>

//                 <div>
//                   Total Students:
//                   <span className="ml-2 text-lavender--600 font-bold">
//                     {teacherInfo.totalStudents}
//                   </span>
//                 </div>

//               </div>

//               {/* Right Side - Date Section */}
//               <div className="flex flex-wrap items-center gap-4">

//                 <div className="flex items-center gap-2">
//                   <label className="text-sm font-medium text-gray-800">
//                     Date:
//                   </label>

//                   <input
//                     type="date"
//                     value={formatDate(filterDate)}
//                     onChange={(e) => setFilterDate(new Date(e.target.value))}
//                     max={formatDate(new Date())}
//                     className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
//                   />
//                 </div>

//                 <div className="text-sm text-gray-600 font-medium">
//                   {filterDate.toLocaleDateString("en-US", {
//                     weekday: "long",
//                   })}
//                 </div>

//               </div>

//             </div>
//           </div>

//           <div className="overflow-x-auto mt-6">
//             <table className="min-w-full border-collapse text-sm text-gray-700">
//               <thead>
//                 <tr>
//                   {["S.No", "Member ID", "Member Name", "Attendance", "Amount"].map((h) => (
//                     <th key={h} className="p-2 text-center font-bold text-gray-700">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {students.map((s, index) => (
//                   <tr
//                     key={s.member_id}
//                     className={`border-t ${attendance[s.member_id] === true
//                       ? "bg-green-50"
//                       : attendance[s.member_id] === false
//                         ? "bg-red-50"
//                         : ""
//                       }`}
//                   >
//                     <td className="p-2 text-center">{index + 1}</td>
//                     <td className="p-2 text-center">{s.member_id}</td>
//                     <td className="p-2 text-center">{s.member_name}</td>

//                     <td className="p-2 text-center">
//                       <div className="flex justify-center gap-3">
//                         <FaRegCircleCheck
//                           onClick={() => markPresent(s.member_id)}
//                           className={`text-xl cursor-pointer ${attendance[s.member_id] === true
//                             ? "text-green-600"
//                             : "text-gray-400"
//                             }`}
//                         />
//                         <RxCrossCircled
//                           onClick={() => markAbsent(s.member_id)}
//                           className={`text-xl cursor-pointer ${attendance[s.member_id] === false
//                             ? "text-red-600"
//                             : "text-gray-400"
//                             }`}
//                         />
//                       </div>
//                     </td>

//                     <td className="p-2 text-center">
//                       {attendance[s.member_id] === true && (
//                         <input
//                           type="text"
//                           inputMode="numeric"
//                           pattern="[0-9]*"
//                           value={amounts[s.member_id] || ""}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             if (/^\d*$/.test(value)) {
//                               handleAmountChange(s.member_id, value);
//                             }
//                           }}
//                           className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 text-center"
//                         />
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>

//               <tfoot>
//                 <tr className="border-t bg-gray-50">
//                   <td colSpan={4} className="p-2 text-right font-semibold">
//                     Total Students
//                   </td>
//                   <td className="p-2 text-center font-semibold">
//                     {totalStudents}
//                   </td>
//                 </tr>

//                 <tr className="border-t bg-gray-50">
//                   <td colSpan={4} className="p-2 text-right font-semibold">
//                     No of Present
//                   </td>
//                   <td className="p-2 text-center font-semibold text-green-600">
//                     {presentCount}
//                   </td>
//                 </tr>

//                 <tr className="border-t bg-gray-50">
//                   <td colSpan={4} className="p-2 text-right font-semibold">
//                     No of Absent
//                   </td>
//                   <td className="p-2 text-center font-semibold text-red-600">
//                     {absentCount}
//                   </td>
//                 </tr>

//                 <tr className="border-t bg-gray-100">
//                   <td colSpan={4} className="p-2 text-right font-bold">
//                     Total Offerings
//                   </td>
//                   <td className="p-2 text-center font-bold text-lavender--600">
//                     ₹ {totalOffering}
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>

//           {!attendanceMarked && (
//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className={`px-4 py-2 rounded-md text-white ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"
//                   }`}
//               >
//                 {saving ? "Saving..." : "Save"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {Response.status === "Success" && (
//         <SuccessMessage Message={Response.message} />
//       )}
//       {Response.status === "Failed" && (
//         <FailedMessage Message={Response.message} />
//       )}
//     </>
//   );
// };




import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import axios from "axios";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";

export const EndeavourOfferAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [amounts, setAmounts] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState({
    class_name: "",
    section_name: "",
    totalStudents: 0,
    class_id: null,
  });

  const [Response, setResponse] = useState({ status: null, message: "" });

    const token = window.sessionStorage.getItem("token");

  /* ================= FETCH STUDENTS ================= */

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const teacherId = tokenData.member_id;

        const res = await axios.get(
          `${URL}/endeavour-classes/teacher/${encodeURIComponent(teacherId)}/students`,
          { headers: { Authorization: token } }
        );

        const fetchedStudents = res.data.students || [];
        setStudents(fetchedStudents);

        if (fetchedStudents.length > 0) {
          const firstStudent = fetchedStudents[0];

          setTeacherInfo({
            class_name: firstStudent.class_name,
            section_name: firstStudent.section_name,
            totalStudents: fetchedStudents.length,
            class_id: firstStudent.class_id,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, [token]);

  /* ================= FETCH ATTENDANCE ================= */


  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `${URL}/endeavour-attendance?classId=${teacherInfo.class_id}&date=${formatDate(filterDate)}`,
        { headers: { Authorization: token } }
      );

      const attObj = {};
      const amtObj = {};

      if (res.data) {
        res.data.attendance.forEach((a) => {
          attObj[a.student._id] = a.present;
          amtObj[a.student._id] = a.amount;
        });

        setAttendance(attObj);
        setAmounts(amtObj);
        setAttendanceMarked(true);
      } else {
        students.forEach((s) => {
          attObj[s._id] = null;
          amtObj[s._id] = "";
        });

        setAttendance(attObj);
        setAmounts(amtObj);
        setAttendanceMarked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (!teacherInfo.class_id || students.length === 0) return;

    fetchAttendance();
  }, [filterDate, teacherInfo.class_id, students]);

  /* ================= HANDLERS ================= */

  const markPresent = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: true }));
  };

  const markAbsent = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: false }));
    setAmounts((prev) => ({ ...prev, [id]: "" }));
  };

  const handleAmountChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const totalStudents = students.length;

  const presentCount = students.filter(
    (s) => attendance[s._id] === true
  ).length;

  const absentCount = students.filter(
    (s) => attendance[s._id] === false
  ).length;

  const totalOffering = students.reduce((sum, s) => {
    return attendance[s._id] === true
      ? sum + (Number(amounts[s._id]) || 0)
      : sum;
  }, 0);

  const validateForm = () => {
    const unmarked = students.some(
      (s) => attendance[s._id] === null
    );

    if (unmarked) {
      setResponse({
        status: "Failed",
        message: "Please mark attendance for all students",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        class: teacherInfo.class_id,
        date: filterDate.toISOString(),
        attendance: students.map((s) => ({
          student: s._id,
          present: attendance[s._id] === true,
          amount:
            attendance[s._id] === true
              ? Number(amounts[s._id]) || 0
              : 0,
        })),
      };

      await axios.post(`${URL}/endeavour-attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);

      setResponse({
        status: "Success",
        message: "Attendance saved successfully!",
      });
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Failed to save attendance",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  /* ================= UI ================= */

  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Endeavour Students Attendance
          </h1>

          {/* ================= TOP INFO ================= */}
          <div className="mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* Left Side - Class Details */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-semibold text-gray-700">

                <div>
                  Class:
                  <span className="ml-2 text-gray-900 font-bold">
                    {teacherInfo.class_name || "-"}
                  </span>
                </div>

                <div>
                  Section:
                  <span className="ml-2 text-gray-900 font-bold">
                    {teacherInfo.section_name || "-"}
                  </span>
                </div>

                <div>
                  Total Students:
                  <span className="ml-2 text-lavender--600 font-bold">
                    {teacherInfo.totalStudents}
                  </span>
                </div>

              </div>

              {/* Right Side - Date Section */}
              <div className="flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-800">
                    Date:
                  </label>

                  <input
                    type="date"
                    value={formatDate(filterDate)}
                    onChange={(e) => setFilterDate(new Date(e.target.value))}
                    max={formatDate(new Date())}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                  />
                </div>

                <div className="text-sm text-gray-600 font-medium">
                  {filterDate.toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </div>

              </div>

            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border-collapse text-sm text-gray-700">
              <thead>
                <tr>
                  {["S.No", "Member ID", "Member Name", "Attendance", "Amount"].map((h) => (
                    <th key={h} className="p-2 text-center font-bold text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((s, index) => (
                  <tr
                    key={s.member_id}
                    // className={`border-t ${attendance[s.member_id] === true
                    //   ? "bg-green-50"
                    //   : attendance[s.member_id] === false
                    //     ? "bg-red-50"
                    //     : ""
                    //   }`}

                    className={`border-t ${attendance[s._id] === true
                      ? "bg-green-50"
                      : attendance[s._id] === false
                        ? "bg-red-50"
                        : ""
                      }`}
                  >
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">{s.member_id}</td>
                    <td className="p-2 text-center">{s.member_name}</td>
                    {/* 
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-3">
                        <FaRegCircleCheck
                          onClick={() => markPresent(s.member_id)}
                          className={`text-xl cursor-pointer ${attendance[s.member_id] === true
                            ? "text-green-600"
                            : "text-gray-400"
                            }`}
                        />
                        <RxCrossCircled
                          onClick={() => markAbsent(s.member_id)}
                          className={`text-xl cursor-pointer ${attendance[s.member_id] === false
                            ? "text-red-600"
                            : "text-gray-400"
                            }`}
                        />
                      </div>
                    </td> */}


                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-3">

                        {attendanceMarked ? (
                          attendance[s._id] === true ? (
                            <FaRegCircleCheck className="text-xl text-green-600" />
                          ) : (
                            <RxCrossCircled className="text-xl text-red-600" />
                          )
                        ) : (
                          <>
                            <FaRegCircleCheck
                              onClick={() => markPresent(s._id)}
                              className={`text-xl cursor-pointer ${attendance[s._id] === true
                                ? "text-green-600"
                                : "text-gray-400"
                                }`}
                            />
                            <RxCrossCircled
                              onClick={() => markAbsent(s._id)}
                              className={`text-xl cursor-pointer ${attendance[s._id] === false
                                ? "text-red-600"
                                : "text-gray-400"
                                }`}
                            />
                          </>
                        )}

                      </div>
                    </td>

                    {/* <td className="p-2 text-center">
                      {attendance[s.member_id] === true && (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={amounts[s.member_id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              handleAmountChange(s.member_id, value);
                            }
                          }}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 text-center"
                        />
                      )}
                    </td> */}


                    <td className="p-2 text-center">
                      {attendanceMarked ? (
                        attendance[s._id] === true ? (
                          <span className="font-semibold text-gray-800">
                            ₹ {amounts[s._id] || 0}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      ) : (
                        attendance[s._id] === true && (
                          <input
                            type="text"
                            value={amounts[s._id] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                handleAmountChange(s._id, value);
                              }
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 text-center"
                          />
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="p-2 text-right font-semibold">
                    Total Students
                  </td>
                  <td className="p-2 text-center font-semibold">
                    {totalStudents}
                  </td>
                </tr>

                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="p-2 text-right font-semibold">
                    No of Present
                  </td>
                  <td className="p-2 text-center font-semibold text-green-600">
                    {presentCount}
                  </td>
                </tr>

                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="p-2 text-right font-semibold">
                    No of Absent
                  </td>
                  <td className="p-2 text-center font-semibold text-red-600">
                    {absentCount}
                  </td>
                </tr>

                <tr className="border-t bg-gray-100">
                  <td colSpan={4} className="p-2 text-right font-bold">
                    Total Offerings
                  </td>
                  <td className="p-2 text-center font-bold text-lavender--600">
                    ₹ {totalOffering}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!attendanceMarked && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"
                  }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {Response.status === "Success" && (
        <SuccessMessage Message={Response.message} />
      )}
      {Response.status === "Failed" && (
        <FailedMessage Message={Response.message} />
      )}
    </>
  );
};