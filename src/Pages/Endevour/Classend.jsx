import React, { useEffect, useState, useRef } from "react";
import { CiEdit } from "react-icons/ci";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import moment from "moment";
import debounce from "lodash.debounce";  
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./DashSundayschool.css"; // ✅ reuse same css
import Pagination from "../../Components/Helpers/Pagination";

export const Classend = () => {
  // class tags state
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]); // { _id, name } objects from backend
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const [newClasses, setNewClasses] = useState([]); // tags array inside modal
  const [classInput, setClassInput] = useState("");

  // separate modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);




  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [options, setOptions] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
    const token = window.sessionStorage.getItem("token");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewClass, setViewClass] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [localErrors, setLocalErrors] = useState({});
  const [teacherVerifiedByUser, setTeacherVerifiedByUser] = useState(false);
  const [assignedTeacherIds, setAssignedTeacherIds] = useState([]);



  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);

    // Reset react-hook-form fields
    reset({
      class_name: "",
      section_name: "",
      year_from: "",
      year_to: "",
      teacherId: "",
      max_students: "",
      notes: "",
    });

    // Reset local state
    setSelectedClass("");
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);
    setMemberVerified(false);
    setNewClasses([]);
    setClassInput("");
  };



  const handleCloseAddModal = () => {
    reset();
    setResponse({ status: null, message: "" });
    setIsAddModalOpen(false);
  };
  const handleViewClass = (row) => {
    setViewClass(row);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewClass(null);
    setIsViewModalOpen(false);
  };



  // 🔍 Debounced search by ID
  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownById([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownById(res.data);
          setMemberError("");
        } else {
          setMemberDropdownById([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownById([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  // 🔍 Debounced search by Name
  const debouncedSearchMemberByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownByName([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownByName(res.data);
          setMemberError("");
        } else {
          setMemberDropdownByName([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownByName([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;


  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const navigate = useNavigate();

  /** =================== LOAD CLASSES =================== */
  const loadClasses = async (page = 1, limit = rowsPerPage) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchQuery || "",
        from: dateRange.from || "",
        to: dateRange.to || ""
      });

      const { data } = await axios.get(
        `${URL}/endeavour-classes?${params.toString()}`,
        { headers: { Authorization: token } }
      );

      setClasses(data.classes || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    const fetchAssignedTeachers = async () => {
      try {
        const res = await axios.get(
          `${URL}/endeavour-classes/teachers`,
          { headers: { Authorization: token } }
        );

        const ids = res.data
          .map(t => t.teacher?.member_id)
          .filter(Boolean);

        setAssignedTeacherIds(ids);
      } catch (err) {
        console.error("Error fetching assigned teachers", err);
      }
    };

    fetchAssignedTeachers();
  }, []);


  useEffect(() => {
    loadClasses(CurrentPage, rowsPerPage);
  }, [CurrentPage, rowsPerPage, searchQuery, dateRange]);


  /** =================== TEACHER SEARCH =================== */
  const handleSearchteacher = async (query) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }
    try {
      const res = await fetch(
        `${URL}/member-search?name=${encodeURIComponent(query)}`,
        { headers: { Authorization: token } }
      );
      if (!res.ok) {
        setOptions([]);
        return;
      }
      const data = await res.json();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Teacher search error:", err);
      setOptions([]);
    }
  };

  /** =================== FORM HANDLERS =================== */
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEdit(false);
    setEditingClass(null);
    reset();
    setOptions([]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingClass(null);
    reset();
    setOptions([]);
  };

  const onSubmit = async (formData) => {
    try {
      if (isEdit && editingClass) {
        await axios.put(`${URL}/endeavour-classes/${editingClass._id}`, formData, {
          headers: { Authorization: token },
        });
      } else {
        await axios.post(`${URL}/endeavour-classes`, formData, {
          headers: { Authorization: token },
        });
      }

      reset();
      setIsModalOpen(false);
      setIsEdit(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/endeavour-classes`, {
        headers: { Authorization: token },
      });
      setClasses(updated.data.classes || []);
    } catch (error) {
      console.error("Error saving class:", error);
      setServerError(error?.response?.data?.message || "Error saving class");
    }
  };

  /** =================== DATE & SEARCH =================== */
  const today = new Date().toISOString().split("T")[0];

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (e.target.value && toDate) {
      setDateRange({ from: e.target.value, to: toDate });
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (fromDate && e.target.value) {
      setDateRange({ from: fromDate, to: e.target.value });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchClassTags = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-class-tags`, {
          headers: { Authorization: token },
        });
        // expecting: { classTags: [{ _id, name }, ...] }
        setClassList(res.data.classTags || []);
      } catch (err) {
        console.error("Error fetching class tags:", err);
        setClassList([]);
      }
    };
    fetchClassTags();
  }, []); // run once
  const validateMaxLength = (name, value, max = 100) => {
    if (value.length > max) {
      setLocalErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));
      return value.slice(0, max);
    }

    setLocalErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return value;
  };


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

  const handleAddSubmit = async (formData) => {
    if (saving) return;

    // 🔴 Manual Required Field Validation
    if (
      !formData.class_name ||
      !formData.section_name ||
      !formData.year_from ||
      !formData.year_to ||
      !formData.teacherId ||
      !formData.max_students
    ) {
      setResponse({
        status: "Failed",
        message: "Please fill all required fields",
      });
      return; // ⛔ Stop execution
    }

    try {
      setSaving(true);

      await axios.post(`${URL}/endeavour-classes`, formData, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Class added successfully",
      });

      reset();
      setIsAddModalOpen(false);

      const updated = await axios.get(`${URL}/endeavour-classes`, {
        headers: { Authorization: token },
      });

      setClasses(updated.data.classes || []);

    } catch (error) {
      console.error("Error adding class:", error);
      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Error adding class",
      });
    } finally {
      setSaving(false);
    }
  };



  const handleEditSubmit = async (formData) => {
    if (!editingClass || saving) return;



    // ✅ Manual Required Validation
    if (
      !formData.class_name ||
      !formData.section_name ||
      !formData.year_from ||
      !formData.year_to ||
      !formData.teacherId ||
      !formData.max_students
    ) {
      setResponse({
        status: "Failed",
        message: "Please fill all required fields",
      });
      return; // ⛔ stop API call
    }
    try {
      setSaving(true);
      await axios.put(`${URL}/endeavour-classes/${editingClass._id}`, formData, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Class updated successfully",
      });

      reset();
      setIsEditModalOpen(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/endeavour-classes`, {
        headers: { Authorization: token },
      });
      setClasses(updated.data.classes || []);
    } catch (error) {
      console.error("Error updating class:", error);
      // setServerError(error?.response?.data?.message || "Error updating class");
      setResponse({
        status: "Failed",
        message:
          error?.response?.data?.message || "Error updating class",
      });
    }
    finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (memberVerified) {
      const timer = setTimeout(() => setMemberVerified(false), 2000); // 2000ms = 2s
      return () => clearTimeout(timer); // cleanup if component unmounts or changes
    }
  }, [memberVerified]);


  const CharCounter = ({ value = "", max = 100, show }) => {
    if (!show || !value.length) return null;
    return (
      <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {value.length}/{max}
      </span>
    );
  };

  useEffect(() => {
    if (isEditModalOpen && editingClass) {
      reset({
        teacherId: editingClass.teacher?.member_id || "",
        // other fields
      });

      setMemberIdSearch(editingClass.teacher?.member_id || "");
      setMemberNameSearch(editingClass.teacher?.member_name || "");

      setMemberVerified(true);           // internally valid
      setTeacherVerifiedByUser(false);   // ❌ no success message
    }
  }, [isEditModalOpen, editingClass, reset]);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);

    reset(); // 🔥 Reset react-hook-form

    setEditingClass(null);
    setSelectedClass("");

    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);

    setMemberVerified(false);
    setTeacherVerifiedByUser(false);
  };

  useEffect(() => {
    if (Response.status) {
      const timer = setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Response]);


  /** =================== RENDER =================== */
  return (
    <div>
      <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
        {/* FILTERS */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT: Title + Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">

            {/* Heading */}
            <h1 className="text-xl font-bold text-lavender--600 whitespace-nowrap">
              Endeavour Class
            </h1>

            {/* From Date */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-sm">From</label>
              <input
                type="date"
                max={today}
                value={fromDate}
                onChange={handleFromDateChange}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-sm">To</label>
              <input
                type="date"
                max={today}
                value={toDate}
                onChange={handleToDateChange}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            {/* Search */}
            <div className="relative w-56">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none ps-3">
                <svg
                  className="w-3 h-3 text-gray-500"
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
                className="block py-1 text-sm text-gray-900 rounded w-full ps-8 bg-gray-50 
                   border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            {fromDate && toDate && (
              <button className="text-blue-600 hover:text-blue-800">
                <img src={down} alt="download" />
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Add Class
            </button>
          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">

            {/* HEADER */}
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No</th>
                <th className="p-2 text-center">Class</th>
                <th className="p-2 text-center">Section</th>
                <th className="p-2 text-center">From</th>
                <th className="p-2 text-center">Year</th>
                <th className="p-2 text-center">Teacher</th>
                <th className="p-2 text-center">Max Students</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                classes.map((row, index) => (
                  <tr
                    key={row._id}
                    className="text-center border-b hover:bg-gray-50"
                  >
                    <td className="p-2">
                      {(CurrentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="p-2 font-medium">
                      {row.class_name}
                    </td>

                    <td className="p-2">
                      {row.section_name || "-"}
                    </td>

                    <td className="p-2">
                      {row.year_from
                        ? moment(row.year_from).format("DD-MM-YYYY")
                        : "-"}
                    </td>

                    <td className="p-2">
                      {row.year_to
                        ? moment(row.year_to).format("DD-MM-YYYY")
                        : "-"}
                    </td>

                    <td className="p-2">
                      {row.teacher?.member_name || "-"}
                    </td>

                    <td className="p-2">
                      {row.max_students}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-2 flex justify-center gap-3">
                      <FaEye
                        size={18}
                        title="View Class"
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => handleViewClass(row)}
                      />

                      <CiEdit
                        size={18}
                        title="Edit Class"
                        className="cursor-pointer text-blue-500"
                        onClick={() => {
                          setEditingClass(row);
                          setIsEditModalOpen(true);

                          setValue("class_name", row.class_name);
                          setValue("section_name", row.section_name);
                          setValue("year_from", row.year_from?.split("T")[0]);
                          setValue("year_to", row.year_to?.split("T")[0]);
                          setValue("max_students", row.max_students);
                          setValue("notes", row.notes || "");

                          if (row.teacher) {
                            setMemberIdSearch(row.teacher.member_id);
                            setMemberNameSearch(row.teacher.memer_name);
                            setValue("teacherId", row.teacher.member_id);
                            setMemberVerified(true);
                          }
                        }}
                      />
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


      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add Class">
        {/* <form onSubmit={handleSubmit(handleAddSubmit)}> */}



        <form onSubmit={handleSubmit(handleAddSubmit, () => {
          setResponse({
            status: "Failed",
            message: "Please fill all required fields",
          });
        })}>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* CLASS */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Class <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsClassModalOpen(true);
                    setNewClasses(classList.map(c => c.name));
                  }}
                  className="text-sm font-medium text-lavender--600"
                >
                  Add Class
                </button>
              </div>

              <select
                {...register("class_name", { required: "Class is required" })}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setValue("class_name", e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:ring-lavender--600 focus:border-lavender--600"
              >
                <option value="">-- Select Class --</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>

              {errors.class_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.class_name.message}
                </p>
              )}
            </div>

            {/* SECTION */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Section <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("section_name", { required: "Section is required" })}
                onInput={(e) => (e.target.value = e.target.value.replace(/[0-9]/g, ""))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.section_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.section_name.message}
                </p>
              )}
            </div>

            {/* YEAR FROM */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year From <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("year_from", { required: "Start year is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.year_from && (
                <p className="text-sm text-red-500">{errors.year_from.message}</p>
              )}
            </div>

            {/* YEAR TO */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year To <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("year_to", { required: "End year is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.year_to && (
                <p className="text-sm text-red-500">{errors.year_to.message}</p>
              )}
            </div>

            {/* TEACHER ID */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Teacher ID <span className="text-red-600">*</span>
              </label>

              <input type="hidden" {...register("teacherId", { required: "Teacher is required" })} />

              <input
                type="text"
                placeholder="Search Member ID"
                value={memberIdSearch}
                onChange={(e) => {
                  setMemberIdSearch(e.target.value);
                  debouncedSearchMemberById(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />

              {memberDropdownById.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto text-sm">
                  {memberDropdownById.map((m) => (
                    <li
                      key={m.member_id}
                      onClick={() => {
                        if (assignedTeacherIds.includes(m.member_id)) return;
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("teacherId", m.member_id);
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);
                      }}
                      // className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                      className={`px-3 py-2 flex justify-between items-center
    ${assignedTeacherIds.includes(m.member_id)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "cursor-pointer hover:bg-gray-100"
                        }`}
                    >
                      <span className="font-medium">{m.member_id}</span>
                      <span className="text-gray-500">{m.member_name}</span>

                      {assignedTeacherIds.includes(m.member_id) && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Already Assigned
                        </span>
                      )}
                    </li>

                  ))}
                </ul>
              )}
            </div>

            {/* TEACHER NAME */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Teacher Name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                placeholder="Search Name"
                value={memberNameSearch}
                onChange={(e) => {
                  setMemberNameSearch(e.target.value);
                  debouncedSearchMemberByName(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />

              {memberDropdownByName.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto text-sm">
                  {memberDropdownByName.map((m) => (
                    <li
                      key={m.member_id}
                      onClick={() => {
                        if (assignedTeacherIds.includes(m.member_id)) return;
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("teacherId", m.member_id);
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);
                      }}
                      // className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      className={`px-3 py-2 flex justify-between items-center
    ${assignedTeacherIds.includes(m.member_id)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "cursor-pointer hover:bg-gray-100"
                        }`}
                    >
                      {m.member_name}
                      {assignedTeacherIds.includes(m.member_id) && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Already Assigned
                        </span>
                      )}

                    </li>
                  ))}
                </ul>
              )}

              {memberVerified && (
                <p className="text-xs text-green-600 mt-1">
                  Teacher verified successfully
                </p>
              )}

              {errors.teacherId && (
                <p className="text-sm text-red-500">
                  {errors.teacherId.message}
                </p>
              )}
            </div>

            {/* MAX STUDENTS */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Max Students <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={0}
                {...register("max_students", { required: "Required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />

              {errors.max_students && (
                <p className="text-sm text-red-500">{errors.max_students.message}</p>
              )}
            </div>

          </div>

          {/* NOTES */}
          <div className="relative mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Notes
            </label>

            <input
              type="text"
              {...register("notes", {
                onChange: (e) => {
                  const val = validateMaxLength("notes", e.target.value, 100);
                  setValue("notes", val);
                },
              })}
              onFocus={() => setActiveField("notes")}
              onBlur={() => setActiveField(null)}
              className={`block w-full rounded-md shadow-sm sm:text-sm
          ${localErrors.notes ? "border-red-500" : "border-gray-300"}`}
            />

            <CharCounter
              value={watch("notes") || ""}
              max={100}
              show={activeField === "notes"}
            />

            {localErrors.notes && (
              <p className="text-xs text-red-500 mt-1">
                {localErrors.notes}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2
          ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

        </form>
      </Modal>





      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}

        title="Edit Class"
      >
        {/* <form onSubmit={handleSubmit(handleEditSubmit)}> */}


        <form onSubmit={handleSubmit(handleEditSubmit, () => {
          setResponse({
            status: "Failed",
            message: "Please fill all required fields",
          });
        })}>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* CLASS */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Class <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsClassModalOpen(true);
                    setNewClasses(classList.map(c => c.name));
                  }}
                  className="text-sm font-medium text-lavender--600"
                >
                  Add Class
                </button>
              </div>
              {/* 
              <select
                {...register("class_name", { required: "Class is required" })}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setValue("class_name", e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm
                     focus:ring-lavender--600 focus:border-lavender--600"
              > */}



              <select
                {...register("class_name", { required: "Class is required" })}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm
                     focus:ring-lavender--600 focus:border-lavender--600"
              >

                <option value="">-- Select Class --</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>

              {errors.class_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.class_name.message}
                </p>
              )}
            </div>

            {/* SECTION */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Section <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("section_name", { required: "Section is required" })}
                onInput={(e) => (e.target.value = e.target.value.replace(/[0-9]/g, ""))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.section_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.section_name.message}
                </p>
              )}
            </div>

            {/* YEAR FROM */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year From <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("year_from", { required: "Start year is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.year_from && (
                <p className="text-sm text-red-500">{errors.year_from.message}</p>
              )}
            </div>

            {/* YEAR TO */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year To <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("year_to", { required: "End year is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.year_to && (
                <p className="text-sm text-red-500">{errors.year_to.message}</p>
              )}
            </div>

            {/* TEACHER ID */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Teacher ID <span className="text-red-600">*</span>
              </label>

              <input
                type="hidden"
                {...register("teacherId", { required: "Teacher is required" })}
              />

              <input
                type="text"
                placeholder="Search Member ID"
                value={memberIdSearch}
                onChange={(e) => {
                  setMemberIdSearch(e.target.value);
                  debouncedSearchMemberById(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />

              {memberDropdownById.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow
                         max-h-48 overflow-y-auto text-sm">
                  {memberDropdownById.map((m) => {
                    const isAssigned =
                      assignedTeacherIds.includes(m.member_id) &&
                      editingClass?.teacher?.member_id !== m.member_id;

                    return (
                      <li
                        key={m.member_id}
                        onClick={() => {
                          if (isAssigned) return;

                          setMemberIdSearch(m.member_id);
                          setMemberNameSearch(m.member_name);
                          setValue("teacherId", m.member_id);
                          setMemberDropdownById([]);
                          setMemberDropdownByName([]);
                          setMemberVerified(true);
                          setTeacherVerifiedByUser(true);
                        }}
                        className={`px-3 py-2 flex justify-between items-center
        ${isAssigned
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{m.member_id}</span>
                          <span className="text-xs text-gray-500">
                            {m.member_name}
                          </span>
                        </div>

                        {isAssigned && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Already Assigned
                          </span>
                        )}
                      </li>
                    );
                  })}

                </ul>
              )}
            </div>

            {/* TEACHER NAME */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Teacher Name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                placeholder="Search Name"
                value={memberNameSearch}
                onChange={(e) => {
                  setMemberNameSearch(e.target.value);
                  debouncedSearchMemberByName(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />

              {memberDropdownByName.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow
                         max-h-48 overflow-y-auto text-sm">
                  {memberDropdownByName.map((m) => {
                    const isAssigned =
                      assignedTeacherIds.includes(m.member_id) &&
                      editingClass?.teacher?.member_id !== m.member_id;

                    return (
                      <li
                        key={m.member_id}
                        onClick={() => {
                          if (isAssigned) return;

                          setMemberIdSearch(m.member_id);
                          setMemberNameSearch(m.member_name);
                          setValue("teacherId", m.member_id);
                          setMemberDropdownById([]);
                          setMemberDropdownByName([]);
                          setMemberVerified(true);
                          setTeacherVerifiedByUser(true);
                        }}
                        className={`px-3 py-2 flex justify-between items-center
        ${isAssigned
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-100"
                          }`}
                      >
                        <span>{m.member_name}</span>

                        {isAssigned && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Already Assigned
                          </span>
                        )}
                      </li>
                    );
                  })}

                </ul>
              )}

              {memberVerified && teacherVerifiedByUser && (
                <p className="text-xs text-green-600 mt-1">
                  Teacher verified successfully
                </p>
              )}

              {errors.teacherId && (
                <p className="text-sm text-red-500">
                  {errors.teacherId.message}
                </p>
              )}
            </div>

            {/* MAX STUDENTS */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Max Students <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={0}
                {...register("max_students", { required: "Required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.max_students && (
                <p className="text-sm text-red-500">
                  {errors.max_students.message}
                </p>
              )}
            </div>

          </div>

          {/* NOTES */}
          <div className="relative mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Notes
            </label>

            <input
              type="text"
              {...register("notes", {
                onChange: (e) => {
                  const val = validateMaxLength("notes", e.target.value, 100);
                  setValue("notes", val);
                },
              })}
              onFocus={() => setActiveField("notes")}
              onBlur={() => setActiveField(null)}
              className={`block w-full rounded-md shadow-sm sm:text-sm
          ${localErrors.notes ? "border-red-500" : "border-gray-300"}`}
            />

            <CharCounter
              value={watch("notes") || ""}
              max={100}
              show={activeField === "notes"}
            />

            {localErrors.notes && (
              <p className="text-xs text-red-500 mt-1">
                {localErrors.notes}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2
          ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Updating..." : "Update"}
            </button>
          </div>

        </form>
      </Modal>



      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="View Class Details"
      >
        {viewClass ? (
          <div className="text-sm text-gray-700 space-y-4 max-h-[600px] overflow-y-auto">
            {[
              { label: "Class Name", value: viewClass.class_name || "-" },
              { label: "Section", value: viewClass.section_name || "-" },
              { label: "Year From", value: viewClass.year_from ? new Date(viewClass.year_from).toLocaleDateString() : "-" },
              { label: "Year To", value: viewClass.year_to ? new Date(viewClass.year_to).toLocaleDateString() : "-" },
              { label: "Max Students", value: viewClass.max_students || "-" },
              { label: "Notes", value: viewClass.notes || "-" },
              { label: "Teacher ID", value: viewClass.teacher?.member_id || "-" },
              { label: "Teacher Name", value: viewClass.teacher?.member_name || "-" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 py-1">
                <div className="col-span-12 sm:col-span-4 font-semibold text-[16px]">{item.label}</div>
                <div className="col-span-12 sm:col-span-8 text-[16px]">{item.value}</div>
              </div>
            ))}

            {/* Students */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Students</h3>
              {viewClass.students?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-gray-700">
                    <thead className="bg-gray-100 text-xs">
                      <tr>
                        <th className="p-2 border">Sl No.</th>
                        <th className="p-2 border">Member ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">DOB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewClass.students.map((s, i) => (
                        <tr key={i}>
                          <td className="p-2 border">{i + 1}</td>
                          <td className="p-2 border">{s.member_id}</td>
                          <td className="p-2 border">{s.member_name}</td>
                          <td className="p-2 border">
                            {s.date_of_birth ? moment(s.date_of_birth).format("DD-MM-YYYY") : "-"}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No students enrolled.</p>
              )}
            </div>


          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No details available</div>
        )}
      </Modal>



      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Add Class
              </h2>

              {/* Tags */}
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {newClasses.map((tag, i) => {
                    const isExisting = classList.some(
                      (cls) => cls.name.toUpperCase() === tag.toUpperCase()
                    );

                    return (
                      <span
                        key={i}
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium
          ${isExisting
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                      >
                        {tag}

                        <button
                          type="button"
                          className="ml-2 hover:text-red-600"
                          onClick={() =>
                            setNewClasses((prev) => prev.filter((_, idx) => idx !== i))
                          }
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>


                {/* Input for adding new class */}
                <input
                  type="text"
                  placeholder="+ Add Class"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && classInput.trim()) {
                      e.preventDefault();
                      const newTag = classInput.trim();
                      if (newTag && !newClasses.includes(newTag)) {
                        setNewClasses(prev => [...prev, newTag]);
                      }
                      setClassInput("");
                    }
                  }}
                  className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setIsClassModalOpen(false);
                    setNewClasses([]);
                    setClassInput("");
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      let finalClasses = [...newClasses];

                      // 👉 Auto-add input value if user didn’t press Enter
                      if (classInput.trim()) {
                        const sanitized = classInput
                          .replace(/[0-9]/g, "")
                          .trim()
                          .replace(/\s+/g, " ")
                          .toUpperCase();

                        if (sanitized && !finalClasses.includes(sanitized)) {
                          finalClasses.push(sanitized);
                        }
                      }

                      if (finalClasses.length === 0) {
                        setResponse({
                          status: "Failed",
                          message: "Please add at least one class",
                        });
                        return;
                      }

                      const res = await axios.put(
                        `${URL}/endeavour-class-tags/update`,
                        { names: finalClasses },
                        { headers: { Authorization: token } }
                      );

                      setClassList(res.data.classTags || []);

                      const pick = finalClasses[0];
                      setSelectedClass(pick);
                      setValue("class_name", pick);

                      setNewClasses([]);
                      setClassInput("");
                      setIsClassModalOpen(false);

                      setResponse({
                        status: "Success",
                        message: "Classes updated successfully!",
                      });
                    } catch (err) {
                      console.error("Error updating class tags:", err);
                      setResponse({
                        status: "Failed",
                        message:
                          err.response?.data?.message || "Failed to update classes",
                      });
                    }
                  }}
                  className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                >
                  Save
                </button>


              </div>
            </div>
          </div>
        </div>
      )}



      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>

  )
}


















