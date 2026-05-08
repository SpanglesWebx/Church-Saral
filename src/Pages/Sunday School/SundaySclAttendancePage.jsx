// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import moment from "moment";
// import { FaRegCircleCheck } from "react-icons/fa6";
// import { FaArrowLeft} from "react-icons/fa";
// import { RxCrossCircled } from "react-icons/rx";
// import { URL } from "../../App";

// export const SundaySclAttendancePage = () => {
//     const navigate = useNavigate();
//   const { classId } = useParams();
//   const token = window.sessionStorage.getItem("token");

//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [amounts, setAmounts] = useState({});
//   const [attendanceMarked, setAttendanceMarked] = useState(false);
//   const [filterDate, setFilterDate] = useState(new Date());
//   const [classInfo, setClassInfo] = useState({
//     class_name: "",
//     section_name: "",
//   });

//   useEffect(() => {
//     fetchClassData();
//   }, [classId, filterDate]);

//   const fetchClassData = async () => {
//     try {
//       const classRes = await axios.get(
//         `${URL}/sunday-classes/${classId}/details`,
//         { headers: { Authorization: token } }
//       );

//       const cls = classRes.data;
//       setClassInfo({
//         class_name: cls.class_name,
//         section_name: cls.section_name,
//       });

//       setStudents(cls.students || []);

//       const attendanceRes = await axios.get(
//         `${URL}/attendance?classId=${classId}&date=${filterDate
//           .toISOString()
//           .split("T")[0]}`,
//         { headers: { Authorization: token } }
//       );

//       if (attendanceRes.data.length > 0) {
//         const record = attendanceRes.data[0];

//         const attObj = {};
//         const amtObj = {};

//         record.attendance.forEach((a) => {
//           attObj[a.member_id] = a.present;
//           amtObj[a.member_id] = a.amount || "";
//         });

//         setAttendance(attObj);
//         setAmounts(amtObj);
//         setAttendanceMarked(true);
//       } else {
//         const initAtt = {};
//         const initAmt = {};
//         cls.students.forEach((s) => {
//           initAtt[s.member_id] = null;
//           initAmt[s.member_id] = "";
//         });
//         setAttendance(initAtt);
//         setAmounts(initAmt);
//         setAttendanceMarked(false);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const markPresent = (id) => {
//     setAttendance((prev) => ({ ...prev, [id]: true }));
//   };

//   const markAbsent = (id) => {
//     setAttendance((prev) => ({ ...prev, [id]: false }));
//     setAmounts((prev) => ({ ...prev, [id]: "" }));
//   };

//   const handleAmountChange = (id, value) => {
//     if (/^\d*$/.test(value)) {
//       setAmounts((prev) => ({ ...prev, [id]: value }));
//     }
//   };

//   const totalStudents = students.length;
//   const presentCount = students.filter(
//     (s) => attendance[s.member_id] === true
//   ).length;
//   const absentCount = students.filter(
//     (s) => attendance[s.member_id] === false
//   ).length;

//   const totalOffering = students.reduce(
//     (sum, s) =>
//       attendance[s.member_id] === true
//         ? sum + (Number(amounts[s.member_id]) || 0)
//         : sum,
//     0
//   );

//   const handleSave = async () => {
//     try {
//       const payload = {
//         class: classId,
//         date: filterDate.toISOString().split("T")[0],
//         attendance: students.map((s) => ({
//           member_id: s.member_id,
//           present: attendance[s.member_id] === true,
//           amount:
//             attendance[s.member_id] === true
//               ? Number(amounts[s.member_id]) || 0
//               : 0,
//         })),
//       };

//       await axios.post(`${URL}/attendance`, payload, {
//         headers: { Authorization: token },
//       });

//       setAttendanceMarked(true);
//       alert("Attendance saved successfully!");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//     const handlegoback = () => navigate("/admin/sundayofferings");

//   return (
//     <>
//       <div className="flex justify-start mt-6">
//             <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="Go back" />
//           </div>
//     <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

//       {/* Header */}
//       <h1 className="text-xl font-bold capitalize text-lavender--600">
//         Mark Attendance & Offerings
//       </h1>

//       {/* ===== Top Info ===== */}
//       <div className="mt-4 mb-4 w-full">
//         <div className="w-full flex flex-wrap items-center justify-between text-sm font-semibold text-gray-700">

//           <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
//             <div>
//               Class:{" "}
//               <span className="text-gray-900">
//                 {classInfo.class_name}
//               </span>
//             </div>
//             <div>
//               Section:{" "}
//               <span className="text-gray-900">
//                 {classInfo.section_name}
//               </span>
//             </div>
//             <div>
//               Total Students:{" "}
//               <span className="text-gray-900">{totalStudents}</span>
//             </div>
//           </div>

//           <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
//             <div className="flex items-center gap-2">
//               <label className="text-gray-800">Date:</label>
//               <input
//                 type="date"
//                 value={filterDate.toISOString().split("T")[0]}
//                 onChange={(e) => setFilterDate(new Date(e.target.value))}
//                 max={new Date().toISOString().split("T")[0]}
//                   className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-lavender--600 focus:border-lavender--600"
//               />
//             </div>

//             <div className="text-gray-600">
//               Day:{" "}
//               <span className="text-gray-900">
//                 {filterDate.toLocaleDateString("en-US", {
//                   weekday: "long",
//                 })}
//               </span>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ===== TABLE ===== */}
//       <div className="relative mt-6">
//         <div className="overflow-x-auto">
//           <table className="min-w-full border-collapse text-sm text-gray-700">
//             <thead>
//               <tr>
//                 {["S.No", "Member ID", "Member Name", "Attendance", "Amount"].map(
//                   (h) => (
//                     <th key={h} className="p-2 text-center font-bold text-gray-700">
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>

//             <tbody>
//               {students.map((s, index) => (
//                 <tr
//                   key={s.member_id}
//                   className={`border-t ${
//                     attendance[s.member_id] === true
//                       ? "bg-green-50"
//                       : attendance[s.member_id] === false
//                       ? "bg-red-50"
//                       : ""
//                   }`}
//                 >
//                   <td className="p-2 text-center">{index + 1}</td>
//                   <td className="p-2 text-center">{s.member_id}</td>
//                   <td className="p-2 text-center">{s.member_name}</td>

//                   <td className="p-2 text-center">
//                     <div className="flex justify-center gap-3">
//                       <FaRegCircleCheck
//                         onClick={() => markPresent(s.member_id)}
//                         className={`text-xl cursor-pointer ${
//                           attendance[s.member_id] === true
//                             ? "text-green-600"
//                             : "text-gray-400"
//                         }`}
//                       />
//                       <RxCrossCircled
//                         onClick={() => markAbsent(s.member_id)}
//                         className={`text-xl cursor-pointer ${
//                           attendance[s.member_id] === false
//                             ? "text-red-600"
//                             : "text-gray-400"
//                         }`}
//                       />
//                     </div>
//                   </td>

//                   <td className="p-2 text-center">
//                     {attendance[s.member_id] === true && (
//                       <input
//                         type="text"
//                         inputMode="numeric"
//                         value={amounts[s.member_id] || ""}
//                         onChange={(e) =>
//                           handleAmountChange(
//                             s.member_id,
//                             e.target.value
//                           )
//                         }
//                         className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 focus:ring-lavender--600 focus:border-lavender--600 text-center"
//                       />
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>

//             <tfoot>
//               <tr className="border-t bg-gray-50">
//                 <td colSpan={4} className="p-2 text-right font-semibold">
//                   Total Students
//                 </td>
//                 <td className="p-2 text-center font-semibold">
//                   {totalStudents}
//                 </td>
//               </tr>

//               <tr className="border-t bg-gray-50">
//                 <td colSpan={4} className="p-2 text-right font-semibold">
//                   No of Present
//                 </td>
//                 <td className="p-2 text-center font-semibold text-green-600">
//                   {presentCount}
//                 </td>
//               </tr>

//               <tr className="border-t bg-gray-50">
//                 <td colSpan={4} className="p-2 text-right font-semibold">
//                   No of Absent
//                 </td>
//                 <td className="p-2 text-center font-semibold text-red-600">
//                   {absentCount}
//                 </td>
//               </tr>

//               <tr className="border-t bg-gray-100">
//                 <td colSpan={4} className="p-2 text-right font-bold">
//                   Total Offerings
//                 </td>
//                 <td className="p-2 text-center font-bold text-lavender--600">
//                   ₹ {totalOffering}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>

//       {!attendanceMarked && (
//         <div className="flex justify-end mt-6">
//           <button
//             onClick={handleSave}
//             className="px-4 py-2 text-base font-medium text-white bg-lavender--600 rounded-md"
//           >
//             Save
//           </button>
//         </div>
//       )}
//     </div>
//     </>
//   );
// };











import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { FaArrowLeft } from "react-icons/fa";

export const SundaySclAttendancePage = () => {
    const { classId, date } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [amounts, setAmounts] = useState({});
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [filterDate, setFilterDate] = useState(
        date ? new Date(date) : new Date()
    );

    const [teacherInfo, setTeacherInfo] = useState({
        class_name: "",
        section_name: "",
        totalStudents: 0,
        class_id: null,
    });
    const [Response, setResponse] = useState({ status: null, message: "" });

      const token = window.sessionStorage.getItem("token");
    const [saving, setSaving] = useState(false);



    useEffect(() => {
        if (!classId || !date) return;

        const loadData = async () => {
            try {

                // 🔹 Always fetch class details (for header info)
                const classRes = await axios.get(
                    `${URL}/sunday-classes/${classId}/details`,
                    { headers: { Authorization: token } }
                );

                const cls = classRes.data;

                setTeacherInfo({
                    class_name: cls.class_name,
                    section_name: cls.section_name,
                    totalStudents: cls.students.length,
                    class_id: cls._id,
                });

                // 🔹 Then check attendance
                const attendanceRes = await axios.get(
                    `${URL}/attendance?classId=${classId}&date=${date}`,
                    { headers: { Authorization: token } }
                );

                if (attendanceRes.data) {

                    const attendanceStudents = attendanceRes.data.attendance.map(a => a.student);

                    setStudents(attendanceStudents);

                    const initAtt = {};
                    const initAmt = {};

                    attendanceStudents.forEach((s) => {
                        initAtt[s._id] = null;
                        initAmt[s._id] = "";
                    });

                    attendanceRes.data.attendance.forEach((a) => {
                        initAtt[a.student._id] = a.present;
                        initAmt[a.student._id] = a.amount;
                    });

                    setAttendance(initAtt);
                    setAmounts(initAmt);
                    setAttendanceMarked(true);

                } else {
                    // If no attendance yet → use current class students
                    setStudents(cls.students || []);
                    setAttendanceMarked(false);
                }

            } catch (err) {
                console.error("Error loading data:", err);
            }
        };

        loadData();

    }, [classId, date]);




    // Toggle Present
    const markPresent = (id) => {
        setAttendance((prev) => ({ ...prev, [id]: true }));
    };

    // Toggle Absent
    const markAbsent = (id) => {
        setAttendance((prev) => ({ ...prev, [id]: false }));
        setAmounts((prev) => ({ ...prev, [id]: "" }));
    };

    const handleAmountChange = (id, value) => {
        setAmounts((prev) => ({ ...prev, [id]: value }));
    };

    const totalStudents = students.length;
    const presentCount = students.filter((s) => attendance[s._id] === true).length;
    const absentCount = students.filter((s) => attendance[s._id] === false).length;
    const totalOffering = students.reduce(
        (sum, s) =>
            attendance[s._id] === true
                ? sum + (Number(amounts[s._id]) || 0)
                : sum,
        0
    );


    useEffect(() => {
        const blockRefresh = (e) => {
            if (saving) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", blockRefresh);
        return () => window.removeEventListener("beforeunload", blockRefresh);
    }, [saving]);



    const validateForm = () => {
        if (!teacherInfo.class_id) {
            setResponse({
                status: "Failed",
                message: "Class not found",
            });
            return false;
        }

        if (students.length === 0) {
            setResponse({
                status: "Failed",
                message: "No students available",
            });
            return false;
        }

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
                class: classId,
                date: filterDate.toISOString().split("T")[0],
                attendance: students.map((s) => ({
                    student: s._id,
                    present: attendance[s._id] === true,
                    amount:
                        attendance[s._id] === true
                            ? Number(amounts[s._id]) || 0
                            : 0,
                })),
            };

            const res = await axios.post(`${URL}/attendance`, payload, {
                headers: { Authorization: token },
            });

            setAttendanceMarked(true);

            setResponse({
                status: "Success",
                message: res.data.message || "Attendance saved successfully!",
            });

        } catch (err) {

            setResponse({
                status: "Failed",
                message:
                    err.response?.data?.message ||
                    "Something went wrong while saving attendance",
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

    const handlegoback = () => navigate("/admin/sundayofferings");

    return (
        <>
            <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>


                <div className="flex justify-start mt-6">
                    <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="Go back" />
                </div>


                <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                    <h1 className="text-xl font-bold capitalize text-lavender--600">
                        Mark Attendance & Offerings
                    </h1>

                    {/* ===== Top Info ===== */}
                    <div className="mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm font-semibold text-gray-700">

                            {/* Left Side - Class Details */}
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                                <div>
                                    Class:{" "}
                                    <span className="ml-2 text-gray-900 font-bold">
                                        {teacherInfo.class_name}
                                    </span>
                                </div>
                                <div>
                                    Section:{" "}
                                    <span className="ml-2 text-gray-900 font-bold">
                                        {teacherInfo.section_name}
                                    </span>
                                </div>
                                <div>
                                    Total Students:{" "}
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

                                    {/* <input
                    type="date"
                    readOnly
                    // onChange={(e) => setFilterDate(new Date(e.target.value))}
                    // max={formatDate(new Date())}
                    value={formatDate(filterDate)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-lavender--600 focus:border-lavender--600"
                /> */}

                                    <span className="text-gray-900 font-semibold">
                                        {new Date(filterDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 font-medium">
                                    Day:{" "}
                                    <span className="ml-1 text-gray-900 font-semibold">
                                        {filterDate.toLocaleDateString("en-US", {
                                            weekday: "long",
                                        })}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ===== TABLE ===== */}
                    <div className="relative mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm text-gray-700">
                                <thead>
                                    <tr>
                                        {[
                                            "S.No",
                                            "Member ID",
                                            "Member Name",
                                            "Attendance",
                                            "Amount",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="p-2 text-center font-bold text-gray-700"
                                            >
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

                                                    {/* 🔥 IF attendance already saved → show only one icon */}
                                                    {attendanceMarked ? (
                                                        attendance[s._id] === true ? (
                                                            <FaRegCircleCheck className="text-xl text-green-600" />
                                                        ) : (
                                                            <RxCrossCircled className="text-xl text-red-600" />
                                                        )
                                                    ) : (
                                                        <>
                                                            {/* 🔥 If not saved → allow selection */}
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
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={amounts[s._id] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^\d*$/.test(value)) {
                                                                    handleAmountChange(s._id, value);
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 focus:ring-lavender--600 focus:border-lavender--600 text-center"
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
                    </div>

                    {!attendanceMarked && (
                        <div className="flex justify-end mt-6">

                            <div className="flex justify-end mt-6">
                                {!attendanceMarked && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-md text-white flex items-center gap-2
      ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
    `}
                                    >
                                        {saving && (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                )}
                            </div>

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




