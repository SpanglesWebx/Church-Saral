


import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import axios from "axios";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";

export const SundaySclTeachOfferAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [amounts, setAmounts] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [teacherInfo, setTeacherInfo] = useState({
    class_name: "",
    section_name: "",
    totalStudents: 0,
    class_id: null,
  });
  const [Response, setResponse] = useState({ status: null, message: "" });

    const token = window.sessionStorage.getItem("token");
  const [saving, setSaving] = useState(false);

  // ✅ Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const teacherId = tokenData.member_id;

        const res = await axios.get(
          `${URL}/sunday-classes/teacher/${encodeURIComponent(teacherId)}/students`,
          { headers: { Authorization: token } }
        );

        setStudents(res.data.students || []);

        if (res.data.students?.length > 0) {
          const firstStudent = res.data.students[0];
          setTeacherInfo({
            class_name: firstStudent.class_name,
            section_name: firstStudent.section_name,
            totalStudents: res.data.students.length,
            class_id: firstStudent.class_id,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, [token]);


  useEffect(() => {
    if (!teacherInfo.class_id) return;

    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${URL}/attendance?classId=${teacherInfo.class_id}&date=${formatDate(filterDate)}`,
          { headers: { Authorization: token } }
        );

        // 🔥 Attendance exists
        if (res.data && res.data.attendance?.length > 0) {
          const record = res.data;

          const attObj = {};
          const amtObj = {};
          const attendanceStudents = [];

          record.attendance.forEach((a) => {
            attObj[a.student._id] = a.present;
            amtObj[a.student._id] = a.amount;

            attendanceStudents.push({
              _id: a.student._id,
              member_id: a.student.member_id,
              member_name: a.student.member_name,
            });
          });

          setStudents(attendanceStudents); // ⭐ load from attendance
          setAttendance(attObj);
          setAmounts(amtObj);
          setAttendanceMarked(true);

        }
        // 🔥 No attendance for this date
        else {

          // Reload class students again
          const tokenData = JSON.parse(atob(token.split(".")[1]));
          const teacherId = tokenData.member_id;

          const resStudents = await axios.get(
            `${URL}/sunday-classes/teacher/${teacherId}/students`,
            { headers: { Authorization: token } }
          );

          const freshStudents = resStudents.data.students || [];

          const initAtt = {};
          const initAmt = {};

          freshStudents.forEach((s) => {
            initAtt[s._id] = null;
            initAmt[s._id] = "";
          });

          setStudents(freshStudents); // ⭐ load active students
          setAttendance(initAtt);
          setAmounts(initAmt);
          setAttendanceMarked(false);
        }

      } catch (err) {
        console.error(err);
        setStudents([]);
        setAttendance({});
        setAmounts({});
        setAttendanceMarked(false);
      }
    };

    fetchAttendance();

  }, [filterDate, teacherInfo.class_id]);




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
        class: teacherInfo.class_id,
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



  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Sunday School Students Attendance
          </h1>

        
          {/* ===== Top Info ===== */}
          <div className="mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm font-semibold text-gray-700">

              {/* Left Side - Class Details */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
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
                    onChange={(e) => setFilterDate(new Date(e.target.value))}
                    max={formatDate(new Date())}
                    value={formatDate(filterDate)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                  />
                </div>

                <div className="text-sm text-gray-600 font-medium">
                  <span className="text-gray-900">
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
              {/* <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-base font-medium text-white bg-lavender--600 rounded-md"
            >
              Save
            </button> */}
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






