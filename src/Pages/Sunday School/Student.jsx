


//src/Pages/Sunday School/Student.jsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal"; // reuse modal
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";

export const Student = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibleMembers, setEligibleMembers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
    const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const fetchClasses = async (page = 1, query = "") => {
    try {
      const params = new URLSearchParams({ page, limit: pageSize, search: query });
      const res = await axios.get(`${URL}/sunday-classes?` + params.toString(), {
        headers: { Authorization: token },
      });
      setClassList(res.data.classes || []);
      setClassOptions(res.data.classes || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.page || 1);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClassList([]);
      setClassOptions([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchClasses(CurrentPage, searchQuery);
  }, [CurrentPage, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const resetModal = () => {
    setSelectedClass(null);
    setSelectedClassId("");
    setEligibleMembers([]);
    setSelectedStudents([]);
    reset();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    resetModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const handleClassChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedClassId(selectedId);
    if (!selectedId) {
      setSelectedClass(null);
      setEligibleMembers([]);
      setSelectedStudents([]);
      return;
    }
    try {
      const headers = { headers: { Authorization: token } };
      let cls = classList.find((c) => c._id === selectedId);
      if (!cls) {
        const clsRes = await axios.get(`${URL}/sunday-classes/${selectedId}`, headers);
        cls = clsRes.data;
      }
      setSelectedClass(cls);
      const preselected = (cls.students || []).map((s) => ({
        member_id: s.member_id,
        member_name: s.member_name,
        date_of_birth: s.date_of_birth,
        _id: s._id,
        dob: s.dob || null,
      }));
      setSelectedStudents(preselected);

      const res = await axios.get(
        `${URL}/sunday-classes/${selectedId}/students/eligible`,
        headers
      );

      const data = res.data || [];
      const eligibleFiltered = data.filter(
        (m) => !preselected.some((ps) => ps.member_id === m.member_id)
      );

      setEligibleMembers(eligibleFiltered);
    } catch (err) {
      console.error("Error fetching eligible SundayClass members:", err);
      setSelectedClass(null);
      setEligibleMembers([]);
      setSelectedStudents([]);
    }
  };

const toggleStudentSelection = (member) => {
  const exists = selectedStudents.some(
    (s) => s.member_id === member.member_id
  );

  if (exists) {
    // ❌ remove from selected
    setSelectedStudents((prev) =>
      prev.filter((s) => s.member_id !== member.member_id)
    );
  } else {
    // ➕ add to selected
    setSelectedStudents((prev) => [...prev, member]);
  }
};




  const onSubmit = async () => {
    if (!selectedClassId) {
      alert("Please select a class");
      return;
    }
    try {
      await axios.post(
        `${URL}/sunday-classes/${selectedClassId}/students`,
        { students: selectedStudents },
        { headers: { Authorization: token } }
      );
      setResponse({ status: "Success", message: "Students added successfully!" });
      await fetchClasses(CurrentPage, searchQuery);
      handleCloseModal();
    } catch (err) {
      console.error("Error saving SundayClass students:", err);
      alert("Error saving students. Please try again.");
    }
  };

  const handleViewDetails = (cls) => {
    setSelectedClass(cls);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedClass(null);
    setIsViewModalOpen(false);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(classList.length / pageSize));
  }, [classList]);

  return (
    <div>
      <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <h1 className="text-xl font-bold capitalize text-lavender--600">
           Sunday School Student
          </h1>
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button
        onClick={() => navigate("add-students")}
            className="flex items-center gap-2 px-4 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Add Student
          </button>
        </div>

        {/* Class list table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">

            {/* HEADER */}
            <thead className="text-base text-gray-700">
              <tr>
                {[
                  "Sl No",
                  "Class",
                  "Years",
                  "Teacher",
                  "Students",
                  "Action",
                ].map((h) => (
                  <th key={h} className="p-2 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {classList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                classList.map((cls, idx) => (
                  <tr
                    key={cls._id}
                    className="text-center border-b hover:bg-gray-50"
                  >
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    <td className="p-2 font-medium">
                      {cls.class_name} {cls.section_name}
                    </td>

                    <td className="p-2">
                      {moment(cls.year_from).format("YYYY")} -{" "}
                      {moment(cls.year_to).format("YYYY")}
                    </td>

                    <td className="p-2">
                      {cls.teacher?.member_name || "-"}
                    </td>

                    <td className="p-2">
                      {cls.students?.length || 0}
                    </td>

                    <td className="p-2 flex justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => handleViewDetails(cls)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>


        {/* Pagination */}
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
        />

      </div>

 
      {/* View Class Details */}
      <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title="Class Details">
        {selectedClass && (
          <div className="max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 mb-2">
              <p><strong>Class & Section:</strong> {selectedClass.class_name} {selectedClass.section_name}</p>
              <p><strong>Teacher:</strong> {selectedClass.teacher?.member_name || "-"}</p>
              <p><strong>Year Range:</strong> {moment(selectedClass.year_from).format("YYYY")} to {moment(selectedClass.year_to).format("YYYY")}</p>
              <p><strong>Current Students:</strong> {selectedClass.students?.length || 0}</p>
            </div>

            <h3 className="mb-2 font-semibold text-gray-700">Students</h3>
            <table className="min-w-full text-sm text-gray-600 border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-center">Sl No</th>
                  <th className="p-2 border text-center">Member ID</th>
                  <th className="p-2 border text-center">Name</th>
                  <th className="p-2 border text-center">DOB</th>
                </tr>
              </thead>
              <tbody>
                {selectedClass.students && selectedClass.students.length > 0 ? (
                  selectedClass.students.map((s, idx) => (
                    <tr key={s.member_id}>
                      <td className="p-2 border text-center">{idx + 1}</td>
                      <td className="p-2 border text-center">{s.member_id}</td>
                      <td className="p-2 border text-center">{s.member_name}</td>
                      <td className="p-2 border text-center">{s.dob ? moment(s.dob).format("DD-MM-YYYY") : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};






