import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";


export const SundaySclOfferings = () => {
  const navigate = useNavigate();
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [offering, setOffering] = useState("");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());




    const token = window.sessionStorage.getItem("token");

  // ✅ Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/sunday-classes`, {
          headers: { Authorization: token },
        });
        setClassList(res.data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [token]);






  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${URL}/attendance/by-date?date=${filterDate.toISOString().split("T")[0]}`,
          { headers: { Authorization: token } }
        );

        setAttendanceStatus(res.data || []);

      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceStatus([]);
      }
    };

    fetchAttendance();
  }, [filterDate, token]);


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">

          {/* LEFT SIDE - Heading */}
          <h1 className="text-xl font-bold text-lavender--600">
            Sunday School Offerings & Attendance
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
              className="block w-full mt-1 rounded-md shadow-sm sm:text-sm  border-gray-300 focus:outline-none focus:ring-0"
            />

            <span className="text-sm font-medium text-gray-600">
              {filterDate.toLocaleDateString("en-US", { weekday: "long" })}
            </span>

          </div>

        </div>


      <div className="overflow-x-auto mt-4rounded-xl ">
  <table className="w-full text-sm text-gray-600">

    {/* ===== Table Head ===== */}
    <thead className="text-semibold  text-gray-700 ">
      <tr>
        <th className="p-3 text-center ">Sl No</th>
        <th className="p-3 text-center ">Class</th>
        <th className="p-3 text-center ">Teacher</th>
        <th className="p-3 text-center ">Attendance Status</th>
        <th className="p-3 text-center ">Action</th>
      </tr>
    </thead>

    {/* ===== Table Body ===== */}
    <tbody>
      {classList.map((cls, index) => {

        const isMarked = attendanceStatus.some(
          (record) => record.class === cls._id
        );

        return (
          <tr
            key={cls._id}
            className=" hover:bg-gray-50 transition"
          >
            <td className="p-3 text-center">
              {index + 1}
            </td>

            <td className="p-3 text-center font-medium text-gray-800">
              {cls.class_name} {cls.section_name}
            </td>

            <td className="p-3 text-center text-gray-600">
              {cls.teacher?.member_name || "-"}
            </td>

            {/* ===== Status Badge ===== */}
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

            {/* ===== Action Button ===== */}
            <td className="p-3 text-center">
              <button
                onClick={() =>
                  navigate(
                    `/admin/sundayofferings/${cls._id}/${filterDate
                      .toISOString()
                      .split("T")[0]}`
                  )
                }
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
