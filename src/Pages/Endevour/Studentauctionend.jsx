import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus, FaEye } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";
import down from "../../assets/downloade.svg";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";


export const Studentauctionend = () => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Filters & table
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Toasts
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [serverError, setServerError] = useState("");

  // Member toggles
  const [isMember, setIsMember] = useState(true);
  const [isBuyerMember, setIsBuyerMember] = useState(true);

  // Live search dropdowns
  const [sellerDropdown, setSellerDropdown] = useState([]);
  const [buyerDropdown, setBuyerDropdown] = useState([]);

  // Extra states for text in the inputs
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");

  // ID search inputs & dropdowns
  const [sellerIdSearch, setSellerIdSearch] = useState("");
  const [sellerDropdownById, setSellerDropdownById] = useState([]);
  const [buyerIdSearch, setBuyerIdSearch] = useState("");
  const [buyerDropdownById, setBuyerDropdownById] = useState([]);

  const debounceTimeoutRef = useRef(null);
    const token = window.sessionStorage.getItem("token");

  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [classes, setClasses] = useState([]);

  const [auctionDate, setAuctionDate] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [localErrors, setLocalErrors] = useState({});


  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  // RHF
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sellerId: "",
      sellerName: "",
      sellerPhone: "",
      buyerId: "",
      buyerName: "",
      buyerPhone: "",
      item: "",
      amount: "",
      payment_status: "",
    },
  });

  // Utility: debounce
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };



  const fetchAuctions = async (page = 1, query = "", from = "", to = "") => {
    try {
      const res = await axios.get(`${URL}/endeavour-auctions`, {
        params: {
          page,
          limit: rowsPerPage,   // 🔥 dynamic limit
          query,
          from,
          to
        },
        headers: { Authorization: token },
      });

      const data = res.data;
      const auctionsList = data.auctions || [];

      const formatted = auctionsList.map((auction, index) => ({
        slNo: (page - 1) * rowsPerPage + (index + 1), // 🔥 dynamic serial
        sellerName: auction.seller?.name || "-",
        sellerId: auction.seller?.member_id || "-",
        item: auction.item,
        amount: auction.amount,
        buyerName: auction.buyer?.name || "-",
        buyerId: auction.buyer?.member_id
          ? auction.buyer.member_id
          : "Non-member",
        paymentStatus: auction.paymentStatus,
        action: auction._id,
      }));

      setAuctions(formatted);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);

    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };




  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [CurrentPage, searchQuery, fromDate, toDate, rowsPerPage]);




  const debounceFetch = (page, query, from, to) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAuctions(page, query, from, to);
    }, 200);
  };

  useEffect(() => {
    debounceFetch(CurrentPage, searchQuery, fromDate, toDate);
  }, [CurrentPage, searchQuery, fromDate, toDate]);

  // ===== Debounced live searches (same endpoints as Auction.jsx) =====
  // Search seller (student) by name
  const debouncedSearchSeller = useRef(
    debounce(async (val) => {
      if (!val) return setSellerDropdown([]);
      try {
        const res = await axios.get(`${URL}/student-auctions/search-students?query=${val}`, {
          headers: { Authorization: token },
        });
        setSellerDropdown(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400)
  ).current;

  // Search seller (student) by ID
  const debouncedSearchSellerById = useRef(
    debounce(async (val) => {
      if (!val) return setSellerDropdownById([]);
      try {
        const res = await axios.get(`${URL}/student-auctions/search-students?query=${val}`, {
          headers: { Authorization: token },
        });
        setSellerDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;


  const debouncedSearchBuyer = useRef(
    debounce(async (val) => {
      if (!val || !isBuyerMember) return setBuyerDropdown([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setBuyerDropdown(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400)
  ).current;

  const debouncedSearchBuyerById = useRef(
    debounce(async (val) => {
      if (!val || !isBuyerMember) return setBuyerDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setBuyerDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;

  // const onSubmit = async (formData) => {
  //   try {
  //     const payload = {
  //       date: formData.date || new Date(), // default today if not picked

  //       seller: {
  //         member_id: selectedStudent?.member_id,
  //         name: selectedStudent?.member_name,
  //         tamil_name: selectedStudent?.tamil_name || "",
  //         class_name: selectedClass?.class_name,   // now available
  //         section_name: selectedClass?.section_name, // now available
  //       },


  //       buyer: {
  //         isMember: isBuyerMember,
  //         member_id: isBuyerMember ? formData.buyerId : undefined,
  //         name: formData.buyerName,
  //         tamil_name: formData.buyerTamilName || "",
  //         phone: formData.buyerPhone || "",
  //       },

  //       item: formData.item,
  //       amount: Number(formData.amount),

  //       paymentStatus: "Unpaid", // always default Unpaid
  //     };

  //     await axios.post(`${URL}/endeavour-auctions`, payload, {
  //       headers: { Authorization: token },
  //     });

  //     reset();
  //     setSelectedStudent(null);
  //     setSelectedClass(null);
  //     setBuyerSearch("");
  //     setResponse({ status: "Success", message: "Auction added successfully" });
  //     setIsModalOpen(false);

  //     fetchAuctions(CurrentPage, searchQuery, fromDate, toDate);
  //   } catch (error) {
  //     setServerError(error?.response?.data?.message || "Failed to save auction");
  //     setResponse({ status: "Failed", message: "Failed to add auction" });
  //   }
  // };



  // ===== Excel Export (same structure as Auction.jsx) =====


  const onSubmit = async (formData) => {
    if (saving) return;

    try {
      setSaving(true);

      // 🔴 Manual seller validation
      if (!selectedClass || !selectedStudent) {
        setResponse({
          status: "Failed",
          message: "Please select Class and Seller",
        });
        setSaving(false);
        return;
      }

      const payload = {
        date: formData.date || new Date(),

        seller: {
          member_id: selectedStudent?.member_id,
          name: selectedStudent?.member_name,
          tamil_name: selectedStudent?.tamil_name || "",
          class_name: selectedClass?.class_name,
          section_name: selectedClass?.section_name,
        },

        buyer: {
          isMember: isBuyerMember,
          member_id: isBuyerMember ? formData.buyerId : undefined,
          name: formData.buyerName,
          tamil_name: formData.buyerTamilName || "",
          phone: formData.buyerPhone,
        },

        item: formData.item,
        amount: Number(formData.amount),
        paymentStatus: "Unpaid",
      };

      await axios.post(`${URL}/endeavour-auctions`, payload, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Auction added successfully",
      });

      reset();
      setSelectedStudent(null);
      setSelectedClass(null);
      setBuyerSearch("");
      setIsModalOpen(false);

      fetchAuctions(CurrentPage, searchQuery);

    } catch (error) {
      setResponse({
        status: "Failed",
        message:
          error?.response?.data?.message ||
          "Failed to add auction",
      });
    } finally {
      setSaving(false);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };




  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${URL}/auctions`, {
        params: { search: searchQuery, fromdate: fromDate, todate: toDate },
        headers: { Authorization: token },
      });

      const Data = response.data.auctions || [];
      if (!Data.length) return;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Auction Report");
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      worksheet.addRow(["Auction Report"]).font = { size: 14, bold: true };
      worksheet.mergeCells("A1:J1");

      worksheet.addRow([
        "Sl No", "Date", "Seller", "Seller Phone", "Item",
        "Buyer", "Buyer Phone", "Amount", "Payment Status", "Type"
      ]);

      Data.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          moment(item.date).format("YYYY-MM-DD"),
          item.sellerName,
          item.sellerPhone,
          item.item,
          item.buyerName,
          item.buyerPhone,
          item.amount,
          item.payment_status,
          item.sellerId ? "Member" : "Non-Member",
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Auction_Report_${fromDate}_to_${toDate}.xlsx`);
    } catch (err) {
      console.error("Excel error:", err);
    }
  };

  // ===== Open/Close modals =====
  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  //   reset({
  //     payment_status: "Unpaid",   // 👈 enforce Unpaid on modal open
  //   });
  // };
  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   reset();
  // };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset({
      payment_status: "Unpaid",
      date: new Date().toISOString().split("T")[0],
      item: "",
      amount: "",
      buyerPhone: "",
    });
    setSelectedStudent(null);
    setSelectedClass(null);
    setBuyerSearch("");
    setBuyerIdSearch("");
    setBuyerDropdown([]);
    setBuyerDropdownById([]);
    setIsBuyerMember(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    setSelectedStudent(null);
    setSelectedClass(null);
    setBuyerSearch("");
    setBuyerIdSearch("");
    setBuyerDropdown([]);
    setBuyerDropdownById([]);
    setIsBuyerMember(true);
  };

  const handleOpenEdit = (auction) => {
    setSelectedAuction(auction);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedAuction(null);
  };

  // Watchers to trigger live search by name
  const watchSellerInput = watch("sellerName");
  const watchBuyerInput = watch("buyerName");

  useEffect(() => {
    if (isMember) debouncedSearchSeller(watchSellerInput);
  }, [watchSellerInput, isMember]);

  useEffect(() => {
    if (isBuyerMember) debouncedSearchBuyer(watchBuyerInput);
  }, [watchBuyerInput, isBuyerMember]);

  // Table columns (same as Auction.jsx)
  const columns = [
    { label: "Sl No", key: "slNo", align: "center" },
    { label: "Seller Name", key: "sellerName", align: "left" },
    { label: "Item", key: "item", align: "center" },
    { label: "Amount", key: "amount", align: "center" },
    { label: "Buyer Name", key: "buyerName", align: "left" },
    { label: "Action", key: "action", align: "center" }
  ];


  // ✅ Fetch classes (only with students)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes`, {
          headers: { Authorization: token },
        });

        // Adjust depending on your backend response format
        setClasses(res.data.classes || res.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [token]);



  const studentDropdownRef = useRef(null);

  const handleClassChange = async (classId) => {
    try {
      const res = await axios.get(`${URL}/endeavour-classes/${classId}/details`, {
        headers: { Authorization: token },
      });
      const students = res.data?.students || [];
      setStudentOptions(students);
      setSelectedClass(classId);

      // 👇 automatically open dropdown after data loads
      setTimeout(() => {
        if (studentDropdownRef.current) {
          studentDropdownRef.current.focus();
          studentDropdownRef.current.size = students.length; // expands like a listbox
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };



  // ✅ Handle student change
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    const student = students.find(s => s.member_id === studentId);
    setSelectedStudent(student || null);
  };


  const validateMaxLength = (name, value, max = 50) => {
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

  const CharCounter = ({ value = "", max = 50, show }) => {
    if (!show || !value.length) return null;
    return (
      <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {value.length}/{max}
      </span>
    );
  };

  return (
    <div className="p-4">


      <div className="h-full p-4 mx-1 mt-3 bg-white rounded-xl">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex justify-between px-3">



            <h1 className="text-xl font-bold capitalize text-lavender--600">
              Endeavour Auction
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
                value={searchQuery}                // 🔹 controlled input
                onChange={(e) => {
                  setSearchQuery(e.target.value);  // 🔹 update state
                  setCurrentPage(1);               // 🔹 reset to page 1 on new search
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-3 lg:mt-0">
            {fromDate && toDate && (
              <button onClick={handleDownloadExcel} className="text-blue-600 hover:text-blue-800">
                <img src={down} alt="Download" />
              </button>
            )}
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Add Auction
            </button>
          </div>
        </div>

       
        {/* Auction Table */}
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-6">Loading auctions...</p>
          ) : auctions.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No auctions found</p>
          ) : (
            <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden">

              {/* ================= TABLE HEADER ================= */}
              <thead className=" text-gray-700 text-base">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-center border-b"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ================= TABLE BODY ================= */}
              <tbody>
                {auctions.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-white border-b hover:bg-gray-50 transition"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-2 text-sm border-b
                  
                  ${col.key === "sellerName" || col.key === "buyerName"
                            ? "text-left"
                            : "text-center"
                          }
                `}
                      >
                        {col.key === "action" ? (
                          <div className="flex justify-center">
                            <FaEye
                              size={18}
                              className="cursor-pointer text-blue-600 hover:text-blue-800 transition"
                              onClick={() => {
                                setSelectedAuction(row);
                                setIsEditOpen(true);
                              }}
                            />
                          </div>

                        ) : col.key === "amount" ? (
                          `₹${row[col.key]}`

                        ) : col.key === "paymentStatus" ? (
                          <span
                            className={`font-semibold ${row[col.key] === "Paid"
                                ? "text-green-600"
                                : "text-red-600"
                              }`}
                          >
                            {row[col.key]}
                          </span>

                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* ===== Add Auction Modal (YOUR Modal component) ===== */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Auction">
        <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>


          <div className="p-6 space-y-6">

            <form onSubmit={handleSubmit(onSubmit, () => {
              setResponse({
                status: "Failed",
                message: "Please fill all required fields",
              });
            })}>

              {/* ================= SELLER SECTION ================= */}
              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">

                <h3 className="text-sm font-semibold text-gray-700">
                  Seller Details
                </h3>

                {/* ✅ 4 Columns Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Class */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Select Class <span className="text-red-600">*</span>
                    </label>

                    <select
                      className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      onChange={(e) => {
                        const cls = classes.find((c) => c._id === e.target.value);
                        setSelectedClass(cls || null);
                        setStudentOptions(cls?.students || []);
                      }}
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.class_name} - {cls.section_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Seller (Student) <span className="text-red-600">*</span>
                    </label>

                    <select
                      value={selectedStudent?.member_id || ""}
                      className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      onChange={(e) => {
                        const student = studentOptions.find(
                          (s) => s.member_id === e.target.value
                        );
                        setSelectedStudent(student || null);
                      }}
                    >
                      <option value="">-- Select Student --</option>
                      {studentOptions.map((student) => (
                        <option key={student.member_id} value={student.member_id}>
                          {student.member_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={selectedStudent?.member_id || ""}
                      readOnly
                      className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 bg-gray-100"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Date <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="date"
                      {...register("date", { required: "Date is required" })}
                      className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                    />

                    {errors.date && (
                      <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                  </div>

                </div>
              </div>



              {/* ================= CORE FIELDS ================= */}

              
              <div className=" grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">



                {/* Item */}
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Item Name <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    {...register("item", {
                      required: "Item is required",
                      onChange: (e) => {
                        const fixed = validateMaxLength("item", e.target.value, 50);
                        setValue("item", fixed);
                      },
                    })}
                    onFocus={() => setActiveField("item")}
                    onBlur={() => setActiveField(null)}
                    className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
              ${localErrors.item ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={watch("item") || ""}
                    max={50}
                    show={activeField === "item"}
                  />

                  {errors.item && (
                    <p className="text-sm text-red-500">{errors.item.message}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Amount <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="number"
                    min={0}
                    {...register("amount", { required: "Amount is required" })}
                    className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                  />

                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                  )}
                </div>
              </div>


              {/* ================= BUYER SECTION ================= */}
                  <div className=" pt-1 mt-4">
              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">


                {/* Header + Toggle */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Buyer Details
                  </h3>

                  {/* Member Toggle */}
                  <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                    <div
                      className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                      style={{
                        width: "calc(50% - 0.25rem)",
                        transform: isBuyerMember ? "translateX(0)" : "translateX(100%)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsBuyerMember(true);
                        reset({ buyerName: "", buyerPhone: "", buyerId: "" });
                        setBuyerSearch("");
                        setBuyerIdSearch("");
                      }}
                      className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${isBuyerMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Member
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBuyerMember(false);
                        reset({ buyerName: "", buyerPhone: "", buyerId: "" });
                        setBuyerSearch("");
                        setBuyerIdSearch("");
                      }}
                      className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${!isBuyerMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Non-Member
                    </button>
                  </div>
                </div>


                {/* ================= MEMBER MODE ================= */}
                {isBuyerMember ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

                    {/* Buyer ID */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Buyer ID <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="text"
                        value={buyerIdSearch}
                        placeholder="Search by ID"
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuyerIdSearch(val);
                          setValue("buyerId", val);

                          if (!val) {
                            setValue("buyerName", "");
                            setValue("buyerPhone", "");
                            setBuyerDropdown([]);
                            setBuyerDropdownById([]);
                          }

                          debouncedSearchBuyerById(val);
                        }}
                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      />

                      {errors.buyerId && (
                        <p className="text-sm text-red-500">{errors.buyerId.message}</p>
                      )}
                    </div>

                    {/* Buyer Name */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Buyer Name
                      </label>

                      <input
                        type="text"
                        value={buyerSearch}
                        placeholder="Search by Name"
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuyerSearch(val);
                          setValue("buyerName", val);

                          if (!val) {
                            setValue("buyerId", "");
                            setValue("buyerPhone", "");
                            setBuyerDropdown([]);
                            setBuyerDropdownById([]);
                          }

                          debouncedSearchBuyer(val);
                        }}
                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      />
                    </div>

                    {/* Buyer Phone */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Buyer Phone
                      </label>

                      <input
                        type="text"
                        readOnly
                        {...register("buyerPhone", { required: "Buyer Phone is required" })}
                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300 bg-gray-100"
                      />

                      {errors.buyerPhone && (
                        <p className="text-sm text-red-500">{errors.buyerPhone.message}</p>
                      )}
                    </div>

                    {/* 🔥 FIXED DROPDOWN */}
                    {(buyerDropdownById.length > 0 || buyerDropdown.length > 0) && (
                      <ul className="absolute z-50 mt-[72px] w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto text-sm">

                        {(buyerDropdownById.length > 0
                          ? buyerDropdownById
                          : buyerDropdown
                        ).map((m) => (
                          <li
                            key={m.member_id}
                            onClick={() => {
                              setBuyerIdSearch(m.member_id);
                              setBuyerSearch(m.member_name);
                              setValue("buyerId", m.member_id);
                              setValue("buyerName", m.member_name);
                              setValue("buyerPhone", m.mobile_number);
                              setBuyerDropdown([]);
                              setBuyerDropdownById([]);
                            }}
                            className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                          >
                            <span className="font-medium">{m.member_id}</span>
                            <span>{m.member_name}</span>
                            <span className="text-gray-500">{m.mobile_number}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (






                  // ================= Non MEMBER MODE ================= 

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Buyer Name */}
                    <div className="relative">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Buyer Name <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="text"
                        {...register("buyerName", {
                          required: "Buyer Name is required",
                          onChange: (e) => {
                            const fixed = validateMaxLength("buyerName", e.target.value, 50);
                            setValue("buyerName", fixed);
                          },
                        })}
                        onFocus={() => setActiveField("buyerName")}
                        onBlur={() => setActiveField(null)}
                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      />

                      <CharCounter
                        value={watch("buyerName") || ""}
                        max={50}
                        show={activeField === "buyerName"}
                      />

                      {errors.buyerName && (
                        <p className="text-sm text-red-500">{errors.buyerName.message}</p>
                      )}
                    </div>

                    {/* Buyer Phone */}
                    <div className="relative">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Buyer Phone <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="text"
                        {...register("buyerPhone", {
                          required: "Buyer Phone is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone must be 10 digits",
                          },
                          onChange: (e) => {
                            const fixed = validateMaxLength("buyerPhone", e.target.value, 10);
                            setValue("buyerPhone", fixed);
                          },
                        })}
                        onFocus={() => setActiveField("buyerPhone")}
                        onBlur={() => setActiveField(null)}
                        className="block w-full mt-1 rounded-md shadow-sm sm:text-sm border border-gray-300"
                      />

                      <CharCounter
                        value={watch("buyerPhone") || ""}
                        max={10}
                        show={activeField === "buyerPhone"}
                      />

                      {errors.buyerPhone && (
                        <p className="text-sm text-red-500">{errors.buyerPhone.message}</p>
                      )}
                    </div>

                  </div>
                )}
              </div>

              </div>



              {/* ================= BUTTONS ================= */}
              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-md text-gray-600"
                >
                  Cancel
                </button>

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
          </div>

        </div>
      </Modal>


      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="View Student Auction"
      >
        {selectedAuction && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
            {[
              // { label: "Sl No", value: selectedAuction.slNo },
              { label: "Date", value: moment(selectedAuction.date).format("DD-MM-YYYY") },
              { label: "Seller Name", value: selectedAuction.sellerName },
              { label: "Seller Member ID", value: selectedAuction.sellerId },
              { label: "Item", value: selectedAuction.item },
              { label: "Amount", value: `₹${selectedAuction.amount}` },
              { label: "Buyer Name", value: selectedAuction.buyerName },
              {
                label: "Buyer ID",
                value: selectedAuction.buyerId ? selectedAuction.buyerId : "Non-Member",
              },

            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                  {item.label}
                </div>
                <div
                  className={`col-span-12 sm:col-span-8 text-base ${item.value
                    ? "text-gray-800 dark:text-gray-300"
                    : "text-yellow-500 font-semibold"
                    }`}
                >
                  {item.value}
                </div>
              </div>
            ))}


          </div>
        )}
      </Modal>



      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </div>
  );
}
