import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import OfferingTable from "../../Components/Offerings/BagOfferingsTable"; // ✅ reusable table
import { URL } from "../../App";
import { FaPlus } from "react-icons/fa";
import Spinners from "../../Components/Spinners";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";


const BagOffering = () => {
  const token = sessionStorage.getItem("token");

  /* ===================== STATE ===================== */
  const [offerings, setOfferings] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const abortControllerRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);

  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState(null);




  const [form, setForm] = useState({
    subCategory: "",
    date: today,
    day: moment(today).format("dddd"),
    amount: "",
    description: "",
  });

    const isOffertorySelected = !!form.subCategory;

  /* ===================== FETCH SUB-CATEGORIES ===================== */
  useEffect(() => {
    const fetchSubCategories = async () => {
      const res = await axios.get(
        `${URL}/offerings/bag/subcategories`,
        { headers: { Authorization: token } }
      );

      const list = res.data || [];
      setSubCategories(list);

      // ✅ SET DEFAULT ONLY IF NOT SET

    };

    fetchSubCategories();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setForm({
        subCategory: "",
        date: today,
        day: moment(today).format("dddd"),
        amount: "",
        description: "",
      });
    }
  }, [isModalOpen]);




  /* ===================== FETCH OFFERINGS ===================== */
  const fetchOfferings = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await axios.get(`${URL}/offerings/bag/list`, {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
          fromDate,
          toDate,
        },
        headers: { Authorization: token },
        signal: abortControllerRef.current.signal,
      });

      setOfferings(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error(err);
        setOfferings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, [currentPage, searchQuery, fromDate, toDate, rowsPerPage]);

  /* ===================== HANDLERS ===================== */
  const handleDateChange = (date) => {
    setForm({
      ...form,
      date,
      day: moment(date).format("dddd"),
    });
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

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      await axios.post(`${URL}/offerings/bag/add`, form, {
        headers: { Authorization: token },
      });

      setResponse({
        status: "Success",
        message: "Bag offering added successfully",
      });

      setIsModalOpen(false);
      fetchOfferings();

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to add offering",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [response]);


  const validateMaxLength = (name, value, max = 50) => {
    if (value.length > max) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));

      setTimeout(() => {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 4000);

      return false;
    }

    // clear error when fixed
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return true;
  };


  const CharCounter = ({ value = "", max = 50, show }) => {
    if (!show || !value.length) return null;

    return (
      <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {value.length}/{max}
      </span>
    );
  };


  /* ===================== UI ===================== */
  return (

      <div className="p-2">

        {/* HEADER */}
        {/* ================= BACK ARROW (OUTSIDE) ================= */}
        <div className="flex items-center px-3 py-2">
          <FaArrowLeft
            onClick={() => navigate(-1)}
            className="text-lavender--600 cursor-pointer hover:text-lavender--700"
            size={18}
            title="Back"
          />
        </div>


        {/* ================= MAIN CONTAINER ================= */}
        <div className="p-5 mx-1 mt-3 bg-white shadow-md rounded-xl">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* ⭐ LEFT → TITLE */}
            <h1 className="text-xl font-bold capitalize text-lavender--600">
              Bag Offertory
            </h1>

            {/* ⭐ CENTER → SEARCH + DATE FILTER */}
            <div className="flex flex-wrap items-center justify-center gap-3 flex-1">

              {/* Search */}
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block py-1 text-sm text-gray-900 rounded w-56 ps-3 bg-gray-50"
              />

              {/* From Date */}
              <div className="flex items-center px-2 space-x-2 border rounded-lg">
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  max={today}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 border-0 rounded focus:ring-0 text-sm"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center px-2 space-x-2 border rounded-lg">
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  max={today}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 border-0 rounded focus:ring-0 text-sm"
                />
              </div>

            </div>

            {/* ⭐ RIGHT → ADD BUTTON */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg whitespace-nowrap"
            >
              <FaPlus /> Add Offertory
            </button>

          </div>




          {/* FILTER + ACTION CARD */}
          {/* <div className="h-full p-5 mx-1 mt-3 bg-white shadow-md rounded-xl"> */}


          {/* TABLE */}
          {loading ? (
            <Spinners />
          ) : (
            <OfferingTable
              offerings={offerings}
              loading={loading}
              CurrentPage={currentPage}
            />
          )}

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            rowsInput={rowsInput}
            jumpInput={jumpInput}
            setCurrentPage={setCurrentPage}
            setRowsPerPage={setRowsPerPage}
            setRowsInput={setRowsInput}
            setJumpInput={setJumpInput}
          />
        </div>

        {/* ===================== MODAL ===================== */}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="New Bag Offertory"
        >
              <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

<div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-3">


            <div>
              <label className="block  text-sm font-medium text-gray-700">
                Offertory Type
              </label>
              <select
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={form.subCategory}
                onChange={(e) =>
                  setForm({ ...form, subCategory: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Offertory Type
                </option>
                {subCategories.map((o) => (
                  <option key={o.offeringName} value={o.offeringName}>
                    {o.offeringName}
                  </option>
                ))}
              </select>
            </div>
            </div>
            {form.subCategory && (
              <>

                {/* Date + Day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block  text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block  text-sm font-medium text-gray-700">
                      Day
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.day}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    placeholder="Rs"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                </div>

                {/* Amount */}
                

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                  {/* Description */}
                  <div className="relative">
                    <label className="block  text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <input
                      type="text"
                      value={form.description}
                      placeholder="Enter Description"
                      onFocus={() => setActiveField("description")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (validateMaxLength("description", val, 100)) {
                          setForm({ ...form, description: val });
                        }
                      }}
                      className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
  
      ${errors.description ? "border-red-500" : "border-gray-300"}`}
                    />

                    {/* 🔢 Character Counter */}
                    <CharCounter
                      value={form.description}
                      max={100}
                      show={activeField === "description"}
                    />

                    {/* 🔴 Error Message */}
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>


                {/* Footer */}
                <div className="flex justify-end gap-6 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-red-500 text-sm font-medium"
                  >
                    Discard
                  </button>
                  {/* 
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-lavender--600 text-white rounded-md text-sm font-medium"
            >
              Save
            </button> */}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
                  >
                    {saving && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {saving ? "Saving..." : "Save"}
                  </button>

                </div>
              </>
            )}
          </div>



          {/* Helper Message */}
          {!form.subCategory && (
            <p className="text-sm text-gray-500 mt-2">
              Please select an <strong> Offertory Type </strong> to continue.
            </p>
          )}



        </Modal>



        {response?.status === "Success" && (
          <SuccessMessage Message={response.message} />
        )}
        {response?.status === "Failed" && (
          <FailedMessage Message={response.message} />
        )}

      </div>
  
  );
};

export default BagOffering;



