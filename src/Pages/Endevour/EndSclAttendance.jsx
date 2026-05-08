// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import moment from "moment";
// import { URL } from "../../App";

// export const EndSclAttendancePage = () => {
//   const { classId, date } = useParams();
//     const token = window.sessionStorage.getItem("token");

//   const [classData, setClassData] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [attendanceMarked, setAttendanceMarked] = useState(false);
//   const [editMode, setEditMode] = useState(false);

//   // Fetch class + attendance
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Get class details
//         const classRes = await axios.get(`${URL}/endeavour-classes/${classId}`, {
//           headers: { Authorization: token },
//         });

//         setClassData(classRes.data);
//         setStudents(classRes.data.students || []);

//         // Get attendance
//         const attRes = await axios.get(
//           `${URL}/endeavour-attendance?classId=${classId}&date=${date}`,
//           { headers: { Authorization: token } }
//         );

//         if (attRes.data.length > 0) {
//           const record = attRes.data[0];
//           const mapped = record.attendance.reduce((acc, a) => {
//             acc[a.member_id] = a.present;
//             return acc;
//           }, {});
//           setAttendance(mapped);
//           setAttendanceMarked(true);
//         } else {
//           const initial = (classRes.data.students || []).reduce((acc, s) => {
//             acc[s.member_id] = false;
//             return acc;
//           }, {});
//           setAttendance(initial);
//           setAttendanceMarked(false);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchData();
//   }, [classId, date, token]);

//   const toggleAttendance = (id) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const handleSave = async () => {
//     const payload = {
//       class: classId,
//       date,
//       attendance: students.map((s) => ({
//         member_id: s.member_id,
//         present: attendance[s.member_id] || false,
//       })),
//     };

//     if (!attendanceMarked) {
//       await axios.post(`${URL}/endeavour-attendance`, payload, {
//         headers: { Authorization: token },
//       });
//     } else {
//       await axios.put(`${URL}/endeavour-attendance/${classId}`, payload, {
//         headers: { Authorization: token },
//       });
//     }

//     setAttendanceMarked(true);
//     setEditMode(false);
//   };

//   return (
//     <div className="p-5 bg-white shadow rounded">
//       <h2 className="text-xl font-semibold mb-2">
//         {classData?.class_name} {classData?.section_name}
//       </h2>

//       <p className="mb-4 text-gray-600">
//         Date: {moment(date).format("DD-MM-YYYY")} ({moment(date).format("dddd")})
//       </p>

//       <table className="min-w-full border text-sm">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Sl No</th>
//             <th className="p-2 border">Member ID</th>
//             <th className="p-2 border">Name</th>
//             <th className="p-2 border">Present</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((s, i) => (
//             <tr key={s.member_id}>
//               <td className="p-2 border text-center">{i + 1}</td>
//               <td className="p-2 border text-center">{s.member_id}</td>
//               <td className="p-2 border text-center">{s.member_name}</td>
//               <td className="p-2 border text-center">
//                 <input
//                   type="checkbox"
//                   checked={attendance[s.member_id]}
//                   disabled={attendanceMarked && !editMode}
//                   onChange={() => toggleAttendance(s.member_id)}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="flex justify-end gap-3 mt-4">
//         {!attendanceMarked ? (
//           <button
//             onClick={handleSave}
//             className="px-4 py-2 bg-green-600 text-white rounded"
//           >
//             Save
//           </button>
//         ) : (
//           <>
//             {!editMode && (
//               <button
//                 onClick={() => setEditMode(true)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded"
//               >
//                 Edit
//               </button>
//             )}
//             {editMode && (
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 bg-green-600 text-white rounded"
//               >
//                 Update
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { FaArrowLeft } from "react-icons/fa";

export const EndSclAttendancePage = () => {
    const { classId, date } = useParams();
    const navigate = useNavigate();
      const token = window.sessionStorage.getItem("token");

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [amounts, setAmounts] = useState({});
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [teacherInfo, setTeacherInfo] = useState({
        class_name: "",
        section_name: "",
        totalStudents: 0,
        class_id: null,
    });

    const [Response, setResponse] = useState({ status: null, message: "" });

    const filterDate = new Date(date);

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch class details
                const classRes = await axios.get(
                    `${URL}/endeavour-classes/${classId}`,
                    { headers: { Authorization: token } }
                );

                const cls = classRes.data;
                setStudents(cls.students || []);
                setTeacherInfo({
                    class_name: cls.class_name,
                    section_name: cls.section_name,
                    totalStudents: cls.students.length,
                    class_id: cls._id,
                });

                // Fetch attendance
                const attRes = await axios.get(
                    `${URL}/endeavour-attendance?classId=${classId}&date=${date}`,
                    { headers: { Authorization: token } }
                );

                const attObj = {};
                const amtObj = {};

                if (attRes.data && attRes.data.attendance) {
                    attRes.data.attendance.forEach((a) => {
                        attObj[a.student._id] = a.present;
                        amtObj[a.student._id] = a.amount;
                    });

                    setAttendanceMarked(true);
                } else {
                    cls.students.forEach((s) => {
                        attObj[s._id] = null;
                        amtObj[s._id] = "";
                    });
                    setAttendanceMarked(false);
                }

                setAttendance(attObj);
                setAmounts(amtObj);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [classId, date, token]);

    /* ================= HANDLERS ================= */

    const markPresent = (id) => {
        if (attendanceMarked && !editMode) return;
        setAttendance((prev) => ({ ...prev, [id]: true }));
    };

    const markAbsent = (id) => {
        if (attendanceMarked && !editMode) return;
        setAttendance((prev) => ({ ...prev, [id]: false }));
        setAmounts((prev) => ({ ...prev, [id]: "" }));
    };

    const handleAmountChange = (id, value) => {
        setAmounts((prev) => ({ ...prev, [id]: value }));
    };

    const totalStudents = students.length;
    const presentCount = students.filter((s) => attendance[s._id] === true).length;
    const absentCount = students.filter((s) => attendance[s._id] === false).length;

    const totalOffering = students.reduce((sum, s) => {
        return attendance[s._id] === true
            ? sum + (Number(amounts[s._id]) || 0)
            : sum;
    }, 0);

    const validateForm = () => {
        const unmarked = students.some((s) => attendance[s._id] === null);
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
        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload = {
                class: classId,
                date,
                attendance: students.map((s) => ({
                    student: s._id,
                    present: attendance[s._id] === true,
                    amount:
                        attendance[s._id] === true
                            ? Number(amounts[s._id]) || 0
                            : 0,
                })),
            };

            if (!attendanceMarked) {
                await axios.post(`${URL}/endeavour-attendance`, payload, {
                    headers: { Authorization: token },
                });
            } else {
                await axios.put(`${URL}/endeavour-attendance/${classId}`, payload, {
                    headers: { Authorization: token },
                });
            }

            setAttendanceMarked(true);
            setEditMode(false);

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

    /* ================= UI ================= */

    return (
        <>
            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

                <div className="flex justify-start mt-6">
                    <FaArrowLeft
                        size={18}
                        onClick={() => navigate("/admin/endofferings")}
                        className="cursor-pointer"
                    />
                </div>

                <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Mark Attendance & Offerings
                    </h1>

                    {/* TOP INFO */}
                    {/* <div className="mt-4 mb-4 w-full">
                        <div className="flex flex-wrap items-center justify-between text-sm font-semibold text-gray-700">

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <div>
                                    Class:
                                    <span className="text-gray-900 ml-2">
                                        {teacherInfo.class_name}
                                    </span>
                                </div>

                                <div>
                                    Section:
                                    <span className="text-gray-900 ml-2">
                                        {teacherInfo.section_name}
                                    </span>
                                </div>

                                <div>
                                    Total Students:
                                    <span className="text-gray-900 ml-2">
                                        {teacherInfo.totalStudents}
                                    </span>
                                </div>
                            </div>

                            <div className="text-gray-600">
                                Date:
                                <span className="ml-2 text-gray-900 font-semibold">
                                    {filterDate.toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>

                                <span className="ml-3 text-gray-900">
                                    {filterDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div> */}
                    <div className="mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm font-semibold text-gray-700">

                            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                                <div>
                                    Class:
                                    <span className="ml-2 text-gray-900 font-bold">
                                        {teacherInfo.class_name}
                                    </span>
                                </div>

                                <div>
                                    Section:
                                    <span className="ml-2 text-gray-900 font-bold">
                                        {teacherInfo.section_name}
                                    </span>
                                </div>

                                <div>
                                    Total Students:
                                    <span className="ml-2 text-lavender--600 font-bold">
                                        {teacherInfo.totalStudents}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-medium">
                                <div>
                                    Date:
                                    <span className="ml-2 text-gray-900 font-semibold">
                                        {filterDate.toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>

                                    <span className="ml-3 text-gray-900">
                                        {filterDate.toLocaleDateString("en-US", {
                                            weekday: "long",
                                        })}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* TABLE */}
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
                                        key={s._id}
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

                                        <td className="p-2 text-center">
                                            <div className="flex justify-center gap-3">
                                                {attendanceMarked && !editMode ? (
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

                                        <td className="p-2 text-center">
                                            {attendanceMarked && !editMode ? (
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

                            {/* FOOTER */}
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

                    {/* SAVE / UPDATE BUTTON */}
                    {/* <div className="flex justify-end mt-6">
            {!attendanceMarked ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            ) 
            
            
            : 
            (
              <>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                  >
                    Update
                  </button>
                )}
              </>
            )
            
            
            }
          </div> */}

                    <div className="flex justify-end mt-6">
                        {!attendanceMarked && (
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                            >
                                Save
                            </button>
                        )}
                    </div>
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