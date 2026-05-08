
//src/Pages/Endevour/Studentend.jsx
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


export const Studentend = () => {
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
  const pageSize = 10; // 👈 how many classes to show per page
  const [searchQuery, setSearchQuery] = useState("");
  const { register, handleSubmit, reset, formState: { errors }, } = useForm();

  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const fetchClasses = async (page = 1, query = "") => {
    try {
      const params = new URLSearchParams({
        page,
        limit: pageSize,
        search: query,
      });

      const res = await axios.get(`${URL}/endeavour-classes?` + params.toString(), {
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


  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on new search
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

      // Try to find class data locally first (from classList), otherwise fetch it
      // ✅ ALWAYS fetch populated class
      const clsRes = await axios.get(
        `${URL}/endeavour-classes/${selectedId}/students`,
        headers
      );
      const cls = clsRes.data;

      // set selected class for UI (used for max_students etc.)
      setSelectedClass(cls);

      // Preselect students already present in this specific section
      const preselected = (cls.students || []).map((s) => ({
        _id: s._id,
        member_id: s.member_id,
        member_name: s.member_name,
        dob: s.dob || null,
      }));

      setSelectedStudents(preselected);

      // Fetch eligible students from backend (this endpoint should exclude students
      // already enrolled in any section of the same class_name if backend is implemented as suggested)
      const res = await axios.get(
        `${URL}/endeavour-classes/${selectedId}/eligible-students`,
        headers
      );

      

      // Ensure the eligible list does not include students already in THIS SECTION
      // (defence-in-depth even if backend already excluded them)
      const eligibleFiltered = data.filter(
        (m) => !preselected.some((ps) => ps.member_id === m.member_id)
      );

      setEligibleMembers(eligibleFiltered);
    } catch (err) {
      console.error("Error fetching eligible endeavour members:", err);
      setSelectedClass(null);
      setEligibleMembers([]);
      setSelectedStudents([]);
    }
  };

  const toggleStudentSelection = (member) => {
    const isSelected = selectedStudents.some(
      (s) => s.member_id === member.member_id
    );

    if (isSelected) {
      // REMOVE from selected
      setSelectedStudents(prev =>
        prev.filter(s => s.member_id !== member.member_id)
      );
    } else {
      // ADD to selected
      setSelectedStudents(prev => [...prev, member]);
    }
  };

  const onSubmit = async () => {
    if (!selectedClassId) return;

    try {
      await axios.post(
        `${URL}/endeavour-classes/${selectedClassId}/students`,
        {
          students: selectedStudents.map(s => ({
            member_id: s.member_id,
          })),
        },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: "Students updated successfully",
      });

      handleCloseModal();
      fetchClasses(CurrentPage, searchQuery);
    } catch (err) {
      console.error(err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to save students",
      });
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
            Endeavour Student
          </h1>
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

            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Class</th>
                <th className="p-2 text-center">Years</th>
                <th className="p-2 text-center">Teacher</th>
                <th className="p-2 text-center">Students</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

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
                    className="border-b hover:bg-gray-50 text-center"
                  >
                    <td className="p-2">
                      {(CurrentPage - 1) * pageSize + idx + 1}
                    </td>

                    <td className="p-2">
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

                    <td className="p-2">
                      <div className="flex justify-center">
                        <FaEye
                          className="text-lavender--600 cursor-pointer"
                          onClick={() => handleViewDetails(cls)}
                        />
                      </div>
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
        />


      </div>

      {/* Add Students Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Student"
      >
        <div className="max-w-[1300px] w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              {/* Class & Section */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="w-full">
                  <label
                    htmlFor="class_section"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Class & Section
                  </label>
                  <select
                    id="class_section"
                    {...register("class_section", { required: "Class & Section is required" })}
                    onChange={handleClassChange}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  >
                    <option value="">Select Class & Section</option>
                    {classOptions.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}{cls.section_name ? ` - ${cls.section_name}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.class_section && (
                    <p className="text-sm text-red-500">{errors.class_section.message}</p>
                  )}
                </div>
              </div>

              {/* Eligible + Selected Students */}
              {selectedClass && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                  {/* ELIGIBLE MEMBERS */}
                  <div className="border rounded-lg shadow-sm bg-white">
                    <div className="px-4 py-3 border-b">
                      <h3 className="font-semibold text-gray-800">Eligible Members</h3>
                      <p className="text-xs text-gray-500">
                        Select students (Max: {selectedClass.max_students})
                      </p>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {eligibleMembers.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No eligible members
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Member ID</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">DOB</th>
                              <th className="p-2 text-center">Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eligibleMembers.map(m => (
                              <tr key={m.member_id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{m.member_id}</td>
                                <td className="p-2">{m.member_name}</td>
                                <td className="p-2">
                                  {m.dob ? moment(m.dob).format("DD-MM-YYYY") : "-"}
                                </td>
                                <td className="p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.some(
                                      (s) => s.member_id === m.member_id
                                    )}
                                    disabled={
                                      !selectedStudents.some(s => s.member_id === m.member_id) &&
                                      selectedStudents.length >= selectedClass.max_students
                                    }
                                    onChange={() => toggleStudentSelection(m)}
                                    className="accent-lavender--600"
                                  />

                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* SELECTED STUDENTS */}
                  <div className="border rounded-lg shadow-sm bg-white">
                    <div className="px-4 py-3 border-b">
                      <h3 className="font-semibold text-gray-800">Selected Students</h3>
                      <p className="text-xs text-gray-500">
                        {selectedStudents.length} / {selectedClass.max_students} selected
                      </p>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {selectedStudents.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No students selected
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Member ID</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">DOB</th>
                              <th className="p-2 text-center">Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudents.map(s => (
                              <tr key={s.member_id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{s.member_id}</td>
                                <td className="p-2">{s.member_name}</td>
                                <td className="p-2">
                                  {s.dob
                                    ? moment(s.dob).format("DD-MM-YYYY")
                                    : "-"}
                                </td>
                                <td className="p-2 text-center flex justify-center">
                                  <FaTrash
                                    className="text-red-500 cursor-pointer"
                                    onClick={() => toggleStudentSelection(s)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}


              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-base font-medium text-red-500 border border-transparent rounded-md focus:outline-none focus:ring-0 sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-base font-medium text-white bg-lavender--600 border border-transparent rounded-md shadow-sm hover:bg-lavender--600 focus:outline-none focus:ring-0 sm:text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>


      {/* View Class Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Class Details"
      >
        {selectedClass && (
          <div className="max-h-[600px] overflow-y-auto">
            {/* Class Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 mb-2">
              <p>
                <strong>Class & Section:</strong> {selectedClass.class_name}{" "}
                {selectedClass.section_name}
              </p>
              <p>
                <strong>Teacher:</strong> {selectedClass.teacher?.member_name || "-"}
              </p>
              <p>
                <strong>Year Range:</strong>{" "}
                {moment(selectedClass.year_from).format("YYYY")} to{" "}
                {moment(selectedClass.year_to).format("YYYY")}
              </p>
              <p>
                <strong>Current Students:</strong>{" "}
                {selectedClass.students?.length || 0}
              </p>
            </div>

            {/* Students Table */}
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
                  selectedClass.students.map((s, index) => (
                    <tr key={s._id} className="border-b">
                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border text-center">{s.member_id}</td>
                      <td className="p-2 border text-center">{s.member_name}</td>
                      <td className="p-2 border text-center">
                        {s.dob ? moment(s.dob).format("DD-MM-YYYY") : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-500"
                    >
                      No students enrolled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />
      )}
    </div>
  );
};
