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

export const ClassSunday = () => {
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [localErrors, setLocalErrors] = useState({});

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

  const yearFrom = watch("year_from");
  const yearTo = watch("year_to");


  const navigate = useNavigate();

  /** =================== LOAD CLASSES =================== */
  const loadClasses = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page,
        limit: rowsPerPage,
      });

      if (searchQuery) params.set("search", searchQuery.trim());
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to) params.set("to", dateRange.to);

      const { data } = await axios.get(
        `${URL}/sunday-classes?` + params.toString(),
        {
          headers: { Authorization: token },
        }
      );

      setClasses(data.classes || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error loading classes:", err);
      setClasses([]);
      setTotalPages(1);
    }
  };





  useEffect(() => {
    loadClasses(CurrentPage);
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
        await axios.put(`${URL}/sunday-classes/${editingClass._id}`, formData, {
          headers: { Authorization: token },
        });
      } else {
        await axios.post(`${URL}/sunday-classes`, formData, {
          headers: { Authorization: token },
        });
      }

      reset();
      setIsModalOpen(false);
      setIsEdit(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/sunday-classes`, {
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
        const res = await axios.get(`${URL}/sunday-class-tags`, {
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
  useEffect(() => {
    const fetchAssignedTeachers = async () => {
      try {
        const res = await axios.get(`${URL}/sunday-classes`, {
          headers: { Authorization: token },
        });

        // const teacherIds = (res.data.classes || [])
        //   .map(c => c.teacher?.member_id)
        //   .filter(Boolean);

        // setAssignedTeacherIds(teacherIds);


        const teacherIds = (res.data.classes || [])
          .map(c => c.teacher?._id)
          .filter(Boolean);

        setAssignedTeacherIds(teacherIds);

      } catch (err) {
        console.error("Error fetching assigned teachers:", err);
      }
    };

    fetchAssignedTeachers();
  }, []);


  const openEdit = (row) => {
    setIsEditModalOpen(true);
    setEditingClass(row);
    setIsEdit(true);

    // Prefill form fields
    reset({
      class_name: row.class_name,
      section_name: row.section_name,
      year_from: row.year_from
        ? moment(row.year_from).format("YYYY-MM-DD")
        : "",
      year_to: row.year_to
        ? moment(row.year_to).format("YYYY-MM-DD")
        : "",
      teacherId: row.teacher?._id || "",
      max_students: row.max_students,
      notes: row.notes || "",
    });

    // Sync controlled states
    setSelectedClass(row.class_name);
    setMemberIdSearch(row.teacher?.member_id || "");
    setMemberNameSearch(row.teacher?.member_name || "");
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

  const validateMaxLength = (name, value, max = 100) => {
    if (value.length > max) {
      setLocalErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));

      // ⛔ hard stop extra characters
      return value.slice(0, max);
    }

    // clear error when within limit
    setLocalErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return value;
  };


  const CharCounter = ({ value = "", max = 100, show }) => {
    if (!show || !value.length) return null;
    return (
      <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {value.length}/{max}
      </span>
    );
  };


  const handleAddSubmit = async (formData) => {
    if (saving) return;

    // 🔴 Check Required Fields
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
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${URL}/sunday-classes`, formData, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Class added successfully!",
      });

      reset();
      setIsAddModalOpen(false);

      const updated = await axios.get(`${URL}/sunday-classes`, {
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

    // 🔴 Required field validation
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
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${URL}/sunday-classes/${editingClass._id}`,
        formData,
        {
          headers: { Authorization: token },
        }
      );

      setResponse({
        status: "Success",
        message: "Class updated successfully!",
      });

      reset();
      setIsEditModalOpen(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/sunday-classes`, {
        headers: { Authorization: token },
      });

      setClasses(updated.data.classes || []);
    } catch (error) {
      console.error("Error updating class:", error);

      setResponse({
        status: "Failed",
        message:
          error?.response?.data?.message || "Error updating class",
      });
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    if (memberVerified) {
      const timer = setTimeout(() => setMemberVerified(false), 2000); // 2000ms = 2s
      return () => clearTimeout(timer); // cleanup if component unmounts or changes
    }
  }, [memberVerified]);

  useEffect(() => {
    if (Response.status) {
      const timer = setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Response]);

  const handleCloseEditModal = () => {
    reset({
      class_name: "",
      section_name: "",
      year_from: "",
      year_to: "",
      teacherId: "",
      max_students: "",
      notes: "",
    });

    setEditingClass(null);
    setSelectedClass("");
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);
    setMemberVerified(false);

    setIsEditModalOpen(false);
  };

  return (


    
      <div>
        <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
          {/* FILTERS */}
          {/* ================= MAIN CONTAINER ================= */}


          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* ⭐ LEFT → TITLE */}
            <h1 className="text-xl font-bold capitalize text-lavender--600">
              Sunday School Class
            </h1>

            {/* ⭐ CENTER → DATE FILTER + SEARCH */}
            <div className="flex flex-wrap items-center justify-center gap-3 flex-1">

              <div className="flex items-center px-2 space-x-2 border rounded-lg">
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  max={today}
                  value={fromDate}
                  onChange={handleFromDateChange}
                  className="px-2 py-1 border-0 rounded focus:ring-0 text-sm"
                />
              </div>

              <div className="flex items-center px-2 space-x-2 border rounded-lg">
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  max={today}
                  value={toDate}
                  onChange={handleToDateChange}
                  className="px-2 py-1 border-0 rounded focus:ring-0 text-sm"
                />
              </div>

              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-56 ps-3 bg-gray-50"
              />
            </div>

            {/* ⭐ RIGHT → ADD BUTTON */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg whitespace-nowrap"
            >
              <FaPlus /> Add Class
            </button>

          </div>


          {/* TABLE */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-gray-500">

              <thead className="text-base text-gray-700">
                <tr>
                  {[
                    "Sl No",
                    "Class",
                    "Section",
                    "From",
                    "To",
                    "Teacher",
                    "Max Students",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="p-2 text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {classes.length ? (
                  classes.map((row, index) => (
                    <tr
                      key={row._id}
                      className="text-center border-b hover:bg-gray-50"
                    >
                      <td className="p-2">
                        {(CurrentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="p-2">{row.class_name}</td>
                      <td className="p-2">{row.section_name}</td>
                      <td className="p-2">
                        {row.year_from ? moment(row.year_from).format("DD/MM/YYYY") : "-"}
                      </td>
                      <td className="p-2">
                        {row.year_to ? moment(row.year_to).format("DD/MM/YYYY") : "-"}
                      </td>
                      <td className="p-2">{row.teacher?.member_name || "-"}</td>
                      <td className="p-2">{row.max_students}</td>

                      <td className="p-2 flex justify-center gap-3">
                        <FaEye
                          size={18}
                          className="text-lavender--600 cursor-pointer"
                          onClick={() => handleViewClass(row)}
                        />
                        <CiEdit
                          size={18}
                          className="cursor-pointer text-blue-500"
                          onClick={() => openEdit(row)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
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
 <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
          <div className="p-6 space-y-6">
            {/* <form onSubmit={handleSubmit(handleAddSubmit)}> */}
           


            <form onSubmit={handleSubmit(handleAddSubmit, () => {
              setResponse({
                status: "Failed",
                message: "Please fill all required fields",
              });
            })}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* CLASS FIELD */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Class <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsClassModalOpen(true);
                        // optionally prefill newClasses with current tags so user can edit them
                        setNewClasses(classList.map(c => c.name));
                      }}
                      className="block mb-1 font-semibold text-sm text-lavender--600"
                    >
                      Add Class
                    </button>
                  </div>

                  <select
                    {...register("class_name", { required: "Class is required" })}
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setValue("class_name", e.target.value); // sync with react-hook-form
                    }}
                    className="   mt-1  shadow-sm sm:text-sm border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                  >
                    <option value="">-- Select Class --</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>

                  {errors.class_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.class_name.message}</p>
                  )}
                </div>



                {/* Section */}
                <div>
                  {/* <label className="block text-lg font-medium text-gray-700"> */}
                  <label className="block mb-1 text-sm font-medium text-gray-700">

                    Section <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("section_name", { required: "Section is required" })}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/[0-9]/g, ""))
                    }
                    className=" block w-full mt-1 rounded-md shadow-sm sm:text-sm  border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.section_name && (
                    <p className="text-sm text-red-500">{errors.section_name.message}</p>
                  )}
                </div>

                {/* Year From */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">

                    Year From <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("year_from", { required: "Start year is required" })}
                    className=" block w-full mt-1 rounded-md shadow-sm sm:text-sm  border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.year_from && (
                    <p className="text-sm text-red-500">{errors.year_from.message}</p>
                  )}
                </div>

                {/* Year To */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">

                    Year To <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("year_to", { required: "End year is required" })}
                    className=" block w-full mt-1 rounded-md shadow-sm sm:text-sm  border-gray-300 focus:outline-none focus:ring-0"
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
                    placeholder="Search by Member ID"
                    value={memberIdSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberIdSearch(val);
                      debouncedSearchMemberById(val);
                    }}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border-gray-300"
                  />

                  {/* DROPDOWN BELOW INPUT */}
                  {memberDropdownById.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">
                      {memberDropdownById.map((m) => {
                        const isAssigned =
                          assignedTeacherIds.includes(m._id) &&
                          (!editingClass || editingClass.teacher?._id !== m._id);

                        return (
                          <li
                            key={m.member_id}
                            onClick={() => {
                              if (isAssigned) return;

                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);
                              // setValue("teacherId", m.member_id);
                              setValue("teacherId", m._id);

                              setMemberDropdownById([]);
                              setMemberVerified(true);
                            }}
                            className={`px-3 py-2 flex justify-between items-center
              ${isAssigned
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-100"
                              }`}
                          >
                            <span className="font-medium">{m.member_id}</span>
                            <span>{m.member_name}</span>

                            {isAssigned && (
                              <span className="text-xs text-red-500">
                                [Already Assigned]
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
                    placeholder="Search by Name"
                    value={memberNameSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberNameSearch(val);
                      debouncedSearchMemberByName(val);
                    }}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border-gray-300"
                  />

                  {memberDropdownByName.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">
                      {memberDropdownByName.map((m) => {
                        const isAssigned =
                          assignedTeacherIds.includes(m._id) &&
                          (!editingClass || editingClass.teacher?._id !== m._id);

                        return (
                          <li
                            key={m.member_id}
                            onClick={() => {
                              if (isAssigned) return;

                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);
                              // setValue("teacherId", m.member_id);
                              setValue("teacherId", m._id);

                              setMemberDropdownByName([]);
                              setMemberVerified(true);
                            }}
                            className={`px-3 py-2 flex justify-between items-center
              ${isAssigned
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-100"
                              }`}
                          >
                            <span>{m.member_name}</span>

                            {isAssigned && (
                              <span className="text-xs text-red-500">
                                [Already Assigned]
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {memberVerified && (
                    <p className="mt-1 text-sm text-green-600">
                      Teacher verified successfully
                    </p>
                  )}

                  {errors.teacherId && (
                    <p className="text-sm text-red-500">
                      {errors.teacherId.message}
                    </p>
                  )}
                </div>








                {/* Max Students */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">

                    Max Students <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("max_students", { required: "Required" })}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm  border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.max_students && (
                    <p className="text-sm text-red-500">{errors.max_students.message}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Notes
                </label>

                <input
                  type="text"
                  {...register("notes", {
                    onChange: (e) => {
                      const fixedValue = validateMaxLength(
                        "notes",
                        e.target.value,
                        100
                      );

                      setValue("notes", fixedValue, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    },
                  })}
                  onFocus={() => setActiveField("notes")}
                  onBlur={() => setActiveField(null)}
                  className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
    ${localErrors.notes ? "border-red-500" : "border-gray-300"}`}
                />


                <CharCounter
                  value={watch("notes") || ""}
                  max={100}
                  show={activeField === "notes"}
                />

                {fieldErrors.notes && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.notes}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                {/* <button
              type="submit"
              className="px-4 py-2 text-white bg-lavender--600 rounded-md"
            >
              Save
            </button> */}

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
                >
                  {saving && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {saving ? "Saving..." : isEditModalOpen ? "Update" : "Save"}
                </button>

              </div>
            </form>
            </div>

          </div>
        </Modal>




        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title="Edit Class"
        >
           <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
          <div className="p-6 space-y-6">
            {/* <form onSubmit={handleSubmit(handleEditSubmit)}> */}
            <form onSubmit={handleSubmit(handleEditSubmit, () => {
              setResponse({
                status: "Failed",
                message: "Please fill all required fields",
              });
            })}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* CLASS FIELD */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Class
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
                    className="block w-full mt-1 p-2.5 rounded-md shadow-sm sm:text-sm
                       border border-gray-300 text-gray-800
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
                    <p className="mt-1 text-sm text-red-500">
                      {errors.class_name.message}
                    </p>
                  )}
                </div>

                {/* SECTION */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Section
                  </label>
                  <input
                    type="text"
                    {...register("section_name", { required: "Section is required" })}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/[0-9]/g, ""))
                    }
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
                       border border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.section_name && (
                    <p className="text-sm text-red-500">{errors.section_name.message}</p>
                  )}
                </div>

                {/* YEAR FROM */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Year From
                  </label>
                  <input
                    type="date"
                    {...register("year_from", { required: "Start year is required" })}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
                       border border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.year_from && (
                    <p className="text-sm text-red-500">{errors.year_from.message}</p>
                  )}
                </div>

                {/* YEAR TO */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Year To
                  </label>
                  <input
                    type="date"
                    {...register("year_to", { required: "End year is required" })}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
                       border border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.year_to && (
                    <p className="text-sm text-red-500">{errors.year_to.message}</p>
                  )}
                </div>


                {/* TEACHER ID */}
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Teacher ID
                  </label>

                  <input
                    type="hidden"
                    {...register("teacherId", { required: "Teacher is required" })}
                  />

                  <input
                    type="text"
                    placeholder="Search by Member ID"
                    value={memberIdSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberIdSearch(val);
                      debouncedSearchMemberById(val);
                    }}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
      border border-gray-300 focus:outline-none focus:ring-0"
                  />

                  {/* DROPDOWN */}
                  {memberDropdownById.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">
                      {memberDropdownById.map((m) => {
                        const isAssigned =
                          assignedTeacherIds.includes(m._id) &&
                          (!editingClass || editingClass.teacher?._id !== m._id);

                        return (
                          <li
                            key={m.member_id}
                            onClick={() => {
                              if (isAssigned) return;

                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);
                              // setValue("teacherId", m.member_id);
                              setValue("teacherId", m._id);

                              setMemberDropdownById([]);
                              setMemberVerified(true);
                            }}
                            className={`px-3 py-2 flex justify-between items-center
              ${isAssigned
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-100"
                              }`}
                          >
                            <span className="font-medium">{m.member_id}</span>
                            <span>{m.member_name}</span>

                            {isAssigned && (
                              <span className="text-xs text-red-500">
                                [Already Assigned]
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
                    Teacher Name
                  </label>

                  <input
                    type="text"
                    placeholder="Search by Name"
                    value={memberNameSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberNameSearch(val);
                      debouncedSearchMemberByName(val);
                    }}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
      border border-gray-300 focus:outline-none focus:ring-0"
                  />

                  {memberDropdownByName.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">
                      {memberDropdownByName.map((m) => {
                        const isAssigned =
                          assignedTeacherIds.includes(m._id) &&
                          (!editingClass || editingClass.teacher?._id !== m._id);

                        return (
                          <li
                            key={m._id}
                            onClick={() => {
                              if (isAssigned) return;

                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);
                              // setValue("teacherId", m.member_id);
                              setValue("teacherId", m._id);

                              setMemberDropdownByName([]);
                              setMemberVerified(true);
                            }}
                            className={`px-3 py-2 flex justify-between items-center
              ${isAssigned
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-100"
                              }`}
                          >
                            <span>{m.member_name}</span>

                            {isAssigned && (
                              <span className="text-xs text-red-500">
                                [Already Assigned]
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {memberVerified && (
                    <p className="mt-1 text-sm text-green-600">
                      Teacher verified successfully
                    </p>
                  )}

                  {errors.teacherId && (
                    <p className="text-sm text-red-500">
                      {errors.teacherId.message}
                    </p>
                  )}
                </div>


                {/* DROPDOWN */}
                {/* {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                  <ul className="absolute left-1/2 -translate-x-1/2 mt-[275px]
                         w-[90%] bg-white border border-gray-200 rounded-lg
                         shadow-lg z-50 max-h-60 overflow-y-auto">
                    {(memberDropdownById.length > 0
                      ? memberDropdownById
                      : memberDropdownByName
                    ).map((m) => (
                      <li
                        key={m.member_id}
                        onClick={() => {
                          setMemberIdSearch(m.member_id);
                          setMemberNameSearch(m.member_name);
                          setValue("teacherId", m.member_id);
                          setMemberDropdownById([]);
                          setMemberDropdownByName([]);
                          setMemberVerified(true);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                      >
                        <span className="font-medium">{m.member_id}</span>
                        <span>{m.member_name}</span>
                      </li>
                    ))}
                  </ul>
                )} */}

                {/* MAX STUDENTS */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Max Students
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("max_students", { required: "Required" })}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
                       border border-gray-300 focus:outline-none focus:ring-0"
                  />
                  {errors.max_students && (
                    <p className="text-sm text-red-500">
                      {errors.max_students.message}
                    </p>
                  )}
                </div>
              </div>

              {/* NOTES */}
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Notes
                </label>
                <input
                  type="text"
                  {...register("notes")}
                  className="block w-full mt-1 rounded-md shadow-sm sm:text-sm
                     border border-gray-300 focus:outline-none focus:ring-0"
                />
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-md text-sm font-medium text-white
            flex items-center gap-2
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
                >
                  {saving && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
          </div>
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
                { label: "Teacher Name", value: viewClass.teacher?.member_name || "-" }
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
                              {s.dob ? moment(s.dob).format("DD-MM-YYYY") : "-"}
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
                        (cls) => cls.name.trim().toUpperCase() === tag.trim().toUpperCase()
                      );

                      return (
                        <span
                          key={i}
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border
          ${isExisting
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-red-100 text-red-700 border-red-300"
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
                        // 1️⃣ Combine typed input + existing tags
                        const combined = [
                          ...newClasses,
                          classInput.trim(), // 👈 this is the missing piece
                        ];

                        // 2️⃣ Clean
                        const cleaned = [...new Set(
                          combined
                            .map(c => c.trim())
                            .filter(c => c.length > 0)
                        )];

                        // 3️⃣ Guard
                        if (cleaned.length === 0) {
                          setResponse({
                            status: "Failed",
                            message: "Please add at least one class",
                          });
                          return;
                        }

                        // 4️⃣ API call
                        const res = await axios.put(
                          `${URL}/sunday-class-tags/update`,
                          { names: cleaned },
                          { headers: { Authorization: token } }
                        );

                        // 5️⃣ Update dropdown
                        setClassList(res.data.classTags || []);

                        // 6️⃣ Auto-select first
                        const pick = cleaned[0];
                        setSelectedClass(pick);
                        setValue("class_name", pick);

                        // 7️⃣ Reset modal
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
                          message: err.response?.data?.message || "Failed to update classes",
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


