import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";

export const EndSclOfferings = () => {
  const navigate = useNavigate();
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());

    const token = window.sessionStorage.getItem("token");

  // ✅ Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes`, {
          headers: { Authorization: token },
        });
        setClassList(res.data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [token]);

  const handleOpenPage = (cls) => {
    if (!filterDate) return;

    const formattedDate = filterDate.toISOString().split("T")[0];

    navigate(`/admin/endofferings/${cls._id}/${formattedDate}`);
  };

  // ✅ Open modal for marking attendance
  const handleOpenModal = async (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
    setEditMode(false);
    setDate(filterDate);

    try {
      const res = await axios.get(
        `${URL}/endeavour-attendance?classId=${cls._id}&date=${filterDate.toISOString().split("T")[0]}`,
        { headers: { Authorization: token } }
      );

      if (res.data && res.data.length > 0) {
        const record = res.data[0];
        setStudents(cls.students || []);
        setAttendance(
          record.attendance.reduce((acc, a) => {
            acc[a.member_id] = a.present;
            return acc;
          }, {})
        );
        setAttendanceMarked(true);
      } else {
        setStudents(cls.students || []);
        setAttendance(
          (cls.students || []).reduce((acc, s) => {
            acc[s.member_id] = false;
            return acc;
          }, {})
        );
        setAttendanceMarked(false);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setStudents(cls.students || []);
      setAttendanceMarked(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
    setStudents([]);
    setAttendance({});
    setIsModalOpen(false);
  };

  const toggleAttendance = (memberId) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const totalStudents = students.length;
  const totalAbsentees = students.filter((s) => !attendance[s.member_id]).length;

  // ✅ Save new attendance
  const handleSave = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
      };

      const res = await axios.post(`${URL}/endeavour-attendance`, payload, {
        headers: { Authorization: token },
      });

      setAttendanceMarked(true);
      setIsModalOpen(false);
      setResponse({ status: "Success", message: "Attendance saved successfully!" });

      const dateKey = new Date(date).toISOString().split("T")[0];
      const newRecord = { ...res.data, class: selectedClass };

      setAttendanceStatus((prev) => {
        const exists = prev.some(
          (rec) =>
            rec.class?._id === selectedClass._id &&
            new Date(rec.date).toISOString().split("T")[0] === dateKey
        );

        return exists
          ? prev.map((rec) =>
            rec.class?._id === selectedClass._id &&
              new Date(rec.date).toISOString().split("T")[0] === dateKey
              ? newRecord
              : rec
          )
          : [...prev, newRecord];
      });
    } catch (err) {
      console.error("Error saving attendance:", err.response?.data || err);
      setResponse({ status: "Failed", message: "Failed to save attendance." });
    }
  };

  // ✅ Update attendance
  const handleUpdate = async () => {
    try {
      const payload = {
        class: selectedClass._id,
        date: new Date(date).toISOString(),
        attendance: students.map((s) => ({
          member_id: s.member_id,
          present: attendance[s.member_id] || false,
        })),
      };

      const res = await axios.put(
        `${URL}/endeavour-attendance/${selectedClass._id}`,
        payload,
        { headers: { Authorization: token } }
      );

      setEditMode(false);
      setIsModalOpen(false);
      setResponse({ status: "Success", message: "Attendance updated successfully!" });

      const dateKey = new Date(date).toISOString().split("T")[0];
      const updatedRecord = { ...res.data, class: selectedClass };

      setAttendanceStatus((prev) =>
        prev.map((rec) =>
          rec.class?._id === selectedClass._id &&
            new Date(rec.date).toISOString().split("T")[0] === dateKey
            ? updatedRecord
            : rec
        )
      );
    } catch (err) {
      console.error("Error updating attendance:", err.response?.data || err);
      setResponse({ status: "Failed", message: "Failed to update attendance." });
    }
  };

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const res = await axios.get(
          `${URL}/endeavour-attendance/status?date=${filterDate
            .toISOString()
            .split("T")[0]}`,
          { headers: { Authorization: token } }
        );

        setAttendanceStatus(res.data || []);
      } catch (err) {
        console.error("Error fetching attendance status:", err);
        setAttendanceStatus([]);
      }
    };

    if (filterDate) {
      fetchAttendanceStatus();
    }
  }, [filterDate, token]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">

          {/* LEFT SIDE - Heading */}
          <h1 className="text-xl font-bold text-lavender--600">
            Endeavour Offerings & Attendance
          </h1>

          {/* RIGHT SIDE - Date Filter */}
          <div className="flex items-center gap-3">

            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Date:
            </label>

            <input
              type="date"
              value={
                filterDate instanceof Date && !isNaN(filterDate)
                  ? filterDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilterDate(val ? new Date(val) : new Date());
              }}
              max={new Date().toISOString().split("T")[0]}
              className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border-gray-300 focus:outline-none focus:ring-0"
            />

            <span className="text-sm font-medium text-gray-600">
              {filterDate.toLocaleDateString("en-US", { weekday: "long" })}
            </span>

          </div>
        </div>

        {/* Classes Table */}
        <div className="overflow-x-auto mt-4 rounded-xl">
          <table className="w-full text-sm text-gray-600">
            <thead className="text-semibold text-gray-700">
              <tr className="">
                <th className="p-2 text-center">Sl No</th>
                <th className="p-2 text-center">Class</th>
                <th className="p-2 text-center">Teacher</th>
                <th className="p-2 text-center">Attendance Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {classList.map((cls, index) => {

                const isMarked = attendanceStatus.some(
                  (record) => record.class === cls._id
                );

                return (
                  <tr
                    key={cls._id}
                   className="p-2 text-center border-b "
                  >
                    <td className="p-2 text-center">{index + 1}</td>

                    <td className="p-2 text-center">
                      {cls.class_name} {cls.section_name}
                    </td>

                    <td className="p-2 text-center">
                      {cls.teacher?.member_name || "-"}
                    </td>

                    <td className="p-3 text-center">
                      {isMarked ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          <FaCheckCircle className="text-green-600" />
                          Marked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                          <RxCrossCircled className="text-red-600" />
                          Unmarked
                        </span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleOpenPage(cls)}
                        className="p-2 rounded-lg hover:bg-lavender--50 transition"
                      >
                        <FaEye
                          size={18}
                          className="text-lavender--600 hover:text-lavender--800"
                          title="View Class"
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>



      {/* Toasts */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </>
  );
};
