



//CoverAddOffering.jsx file 

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useRef } from "react";




const emptyRow = () => ({
  member: "",
  member_id: "",
  member_name: "",
  member_type: "",

  isMemberSelected: false,
  isCurrentActive: true,
  currentAmount: "",     // 👈 amount for CURRENT month
  entries: [],           // 👈 extra months only


  primaryMonth: null,
  primaryAmount: "",

  showMonthPicker: false,
  activeDropdown: null,
  highlightIndex: 0,
  idResults: [],
  nameResults: [],
});



const CoverAddOffering = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [offertories, setOffertories] = useState([]);
  const [offertoryType, setOffertoryType] = useState("");
  const [date, setDate] = useState(today);
  const [day, setDay] = useState(moment(today).format("dddd"));

  const [rows, setRows] = useState([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState(null);



  const lastRequestRef = useRef(0);
  const [monthDropdownWidth, setMonthDropdownWidth] = useState(0);


  const memberIdRef = useRef(null);
  const memberNameRef = useRef(null);
  const monthRef = useRef(null);

  const tableRef = useRef(null);


  const monthPickerRefs = useRef({});


  const [showOffertoryConfirm, setShowOffertoryConfirm] = useState(false);
  const [pendingOffertory, setPendingOffertory] = useState("");

  const dropdownItemRefs = useRef([]);

  const amountInputRefs = useRef({});

  const isMonthlyOffertory = offertoryType === "Monthly Offertory";


  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAnyPicker = Object.values(
        monthPickerRefs.current
      ).some(ref => ref && ref.contains(event.target));

      if (!clickedInsideAnyPicker) {
        closeMonthPicker();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  /* ================= BLOCK REFRESH ================= */
  useEffect(() => {
    const block = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", block);
    return () => window.removeEventListener("beforeunload", block);
  }, [saving]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsidePicker = Object.values(
        monthPickerRefs.current
      ).some(ref => ref && ref.contains(e.target));

      const clickedInsideTable =
        tableRef.current?.contains(e.target);

      if (!clickedInsidePicker && !clickedInsideTable) {
        setRows(prev =>
          prev.map(r => ({ ...r, showMonthPicker: false }))
        );
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    let t = setTimeout(() => {
      if (
        memberIdRef.current &&
        memberNameRef.current &&
        monthRef.current
      ) {
        const w =
          memberIdRef.current.offsetWidth +
          memberNameRef.current.offsetWidth +
          monthRef.current.offsetWidth;

        setMonthDropdownWidth(w);
      }
    }, 120); // 👈 debounce (prevents jitter)

    return () => clearTimeout(t);
  }, []);


  const closeMonthPicker = () => {
    setRows(prev =>
      prev.map(r => ({ ...r, showMonthPicker: false }))
    );
  };


  const addNewMemberRow = (rowIndex) => {
    const r = rows[rowIndex];

    // Validate current member completed
    if (!isRowComplete(r)) {
      setResponse({
        status: "Failed",
        message: "Complete current member entries before adding new member",
      });
      return;
    }

    setRows(prev => [...prev, emptyRow()]);
  };
  const handleSmartAdd = (rowIndex) => {
    const row = rows[rowIndex];

    /* ================= MONTHLY OFFERTORY ================= */
    if (isMonthlyOffertory) {

      const hasAnyMonth =
        row.primaryMonth || row.entries.length > 0;

      if (!hasAnyMonth) {
        setResponse({
          status: "Failed",
          message: "Select at least one month before adding new member",
        });
        return;
      }

      if (row.primaryMonth && !row.primaryAmount) {
        setResponse({
          status: "Failed",
          message: "Enter amount for selected month",
        });
        return;
      }

      if (row.entries.some(e => !e.amount)) {
        setResponse({
          status: "Failed",
          message: "Enter amount for all selected months",
        });
        return;
      }

    }

    /* ================= NON MONTHLY OFFERTORY ================= */

    if (!isMonthlyOffertory) {

      if (!row.member || !row.primaryAmount) {
        setResponse({
          status: "Failed",
          message: "Enter member and amount before adding new row",
        });
        return;
      }

    }

    /* ================= ADD ROW ================= */

    if (rowIndex === rows.length - 1) {
      setRows(prev => [...prev, emptyRow()]);
    }
  };



  const deleteMemberRow = (rowIndex) => {
    const updated = rows.filter((_, idx) => idx !== rowIndex);

    // Always keep one empty editor row
    if (updated.length === 0) {
      setRows([emptyRow()]);
    } else {
      setRows(updated);
    }
  };


  const monthToIndex = (label) => {
    // "Apr 25" → sortable index
    const [mon, yy] = label.split(" ");
    const year = 2000 + Number(yy);
    const monthIndex = moment(mon, "MMM").month();
    return year * 12 + monthIndex;
  };

  const sortMonths = (months) =>
    [...months].sort((a, b) => monthToIndex(a) - monthToIndex(b));



  /* ================= FETCH COVER OFFERTORIES ================= */
  useEffect(() => {
    axios
      .get(`${URL}/offerings/cover/subcategories`, {
        headers: { Authorization: token },
      })
      .then((res) => setOffertories(res.data || []))
      .catch(console.error);
  }, []);

  /* ================= DATE ================= */
  const handleDateChange = (d) => {
    setDate(d);
    setDay(moment(d).format("dddd"));
  };

  /* ================= ROW UPDATE ================= */
  const updateRow = (i, data) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === i ? { ...row, ...data } : row
      )
    );
  };


  /* ================= MEMBER SEARCH ================= */
  const searchMemberById = async (value, rowIndex) => {
    if (!value) {
      updateRow(rowIndex, {
        member_name: "",
        member_type: "",
        idResults: [],
        activeDropdown: null,
      });
      return;
    }

    const requestId = ++lastRequestRef.current;

    try {
      const res = await axios.get(`${URL}/member-search/by-id`, {
        params: { id: value },
        headers: { Authorization: token },
      });

      // Ignore stale responses
      if (requestId !== lastRequestRef.current) return;

      updateRow(rowIndex, {
        idResults: res.data || [],
        nameResults: [],
        highlightIndex: 0,
        activeDropdown: "id",
      });
    } catch (err) {
      console.error(err);
    }
  };




  const searchMemberByName = async (value, rowIndex) => {
    if (!value) {
      updateRow(rowIndex, {
        member_id: "",
        member_type: "",
        nameResults: [],
        activeDropdown: null,
      });
      return;
    }

    const requestId = ++lastRequestRef.current;

    try {
      const res = await axios.get(`${URL}/member-search`, {
        params: { name: value },
        headers: { Authorization: token },
      });

      // Ignore stale responses
      if (requestId !== lastRequestRef.current) return;

      updateRow(rowIndex, {
        nameResults: res.data || [],
        idResults: [],
        highlightIndex: 0,
        activeDropdown: "name",
      });
    } catch (err) {
      console.error(err);
    }
  };



  const currentMonthLabel = () => {
    const m = moment(date);
    return `${m.format("MMM")} ${m.format("YY")}`;
  };


  const toggleMonth = (rowIndex, month) => {
    const row = rows[rowIndex];

    const exists = row.entries.find(e => e.month === month);

    if (exists) {
      // unselect → remove row
      updateRow(rowIndex, {
        entries: row.entries.filter(e => e.month !== month),
      });
    } else {
      // select → ADD TO END
      updateRow(rowIndex, {
        entries: [...row.entries, { month, amount: "" }],
      });
    }
  };


  const addActiveMonth = (rowIndex) => {
    const row = rows[rowIndex];

    if (!row.activeMonth || !row.activeAmount) return;

    // ❌ Prevent duplicate
    if (row.entries.some(e => e.month === row.activeMonth)) {
      setResponse({
        status: "Failed",
        message: "Month already added for this member"
      });
      return;
    }

    updateRow(rowIndex, {
      entries: [
        ...row.entries,
        {
          month: row.activeMonth,
          amount: row.activeAmount
        }
      ],
      activeAmount: ""
    });
  };






  const handleMonthToggle = (rowIndex, monthLabel) => {
    const row = rows[rowIndex];

    if (!row.member_id) {
      setResponse({
        status: "Failed",
        message: "Select member before choosing month",
      });
      return;
    }

    const allMonths = [
      row.primaryMonth,
      ...row.entries.map(e => e.month),
    ].filter(Boolean);

    const isSelected = allMonths.includes(monthLabel);

    // 🚫 Prevent removing the only selected month
    if (isSelected && allMonths.length === 1) return;

    let nextMonths;
    if (isSelected) {
      nextMonths = allMonths.filter(m => m !== monthLabel);
    } else {
      nextMonths = [...allMonths, monthLabel];
    }

    const ordered = sortMonths(nextMonths);
    const newPrimary = ordered[0];
    const ledgerMonths = ordered.slice(1);

    // 🔑 PRESERVE AMOUNTS CORRECTLY
    const getAmountForMonth = (m) => {
      if (m === row.primaryMonth) {
        return row.primaryAmount;
      }
      return row.entries.find(e => e.month === m)?.amount || "";
    };

    updateRow(rowIndex, {
      primaryMonth: newPrimary,
      primaryAmount: getAmountForMonth(newPrimary),
      entries: ledgerMonths.map(m => ({
        month: m,
        amount: getAmountForMonth(m),
      })),
    });
  };




  /* ================= KEYBOARD HANDLER ================= */
  const handleKeyDown = (e, row, rowIndex, list) => {
    if (!Array.isArray(list) || list.length === 0) return;

    const max = list.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      updateRow(rowIndex, {
        highlightIndex: Math.min(row.highlightIndex + 1, max),
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      updateRow(rowIndex, {
        highlightIndex: Math.max(row.highlightIndex - 1, 0),
      });
    }

    if (e.key === "PageDown") {
      e.preventDefault();
      updateRow(rowIndex, {
        highlightIndex: Math.min(row.highlightIndex + 5, max),
      });
    }

    if (e.key === "PageUp") {
      e.preventDefault();
      updateRow(rowIndex, {
        highlightIndex: Math.max(row.highlightIndex - 5, 0),
      });
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const sel = list[row.highlightIndex];
      if (!sel) return;

      updateRow(rowIndex, {
        member_id: sel.member_id,
        member_name: sel.member_name || "", // ✅ GUARANTEE
        member_type: sel.member_type || "",
        activeDropdown: null,
        idResults: [],
        nameResults: [],
        highlightIndex: 0,
        isCurrentActive: true,
      });

      requestAnimationFrame(() => {
        amountInputRefs.current[rowIndex]?.focus();
      });
    }




    if (e.key === "Escape") {
      updateRow(rowIndex, {
        activeDropdown: null,
        highlightIndex: 0,
      });
    }
  };


  /* ================= ROW ADD / DELETE ================= */
  const addRow = (i) => {
    const r = rows[i];

    if (!isRowComplete(r)) {
      setResponse({
        status: "Failed",
        message: "Please complete member and all selected month amounts",
      });
      return;
    }

    setRows((prev) => [...prev, emptyRow()]);
  };



  const deleteRow = (i) => {
    const clone = rows.filter((_, idx) => idx !== i);
    setRows(clone.length ? clone : [emptyRow()]);
  };

  /* ================= MONTH LIST ================= */



  const monthsList = (() => {
    if (!date) return [];

    const selected = moment(date);
    const fyStartYear =
      selected.month() >= 3
        ? selected.year()
        : selected.year() - 1;

    return [
      "Apr", "May", "Jun", "Jul", "Aug", "Sep",
      "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
    ].map((m, idx) => {
      const year = idx <= 8 ? fyStartYear : fyStartYear + 1;

      return {
        label: `${m} ${String(year).slice(2)}`,
        year,
        fyStartYear, // optional, useful for debug
      };
    });
  })();



  const addMonthEntry = (rowIndex, month) => {
    const row = rows[rowIndex];

    if (row.entries.some((e) => e.month === month)) return;

    updateRow(rowIndex, {
      entries: [...row.entries, { month, amount: "" }],
    });
  };

  const removeMonthEntry = (rowIndex, month) => {
    const row = rows[rowIndex];
    updateRow(rowIndex, {
      entries: row.entries.filter((e) => e.month !== month),
    });
  };

  const updateMonthAmount = (rowIndex, month, value) => {
    const row = rows[rowIndex];
    updateRow(rowIndex, {
      entries: row.entries.map((e) =>
        e.month === month
          ? { ...e, amount: value.replace(/[^0-9]/g, "") }
          : e
      ),
    });
  };

  const isRowEmpty = (r) => {
    return (
      !r.member_id &&
      !r.member_name &&
      !r.primaryMonth &&
      !r.primaryAmount &&
      (!Array.isArray(r.entries) || r.entries.length === 0)
    );
  };


  const isRowComplete = (r) => {

    if (!r.member) return false;

    /* MONTHLY OFFERTORY */
    if (isMonthlyOffertory) {

      const hasPrimary =
        r.primaryMonth &&
        r.primaryAmount &&
        Number(r.primaryAmount) > 0;

      const hasLedger =
        Array.isArray(r.entries) &&
        r.entries.length > 0 &&
        r.entries.every(
          e => e.amount && Number(e.amount) > 0
        );

      return hasPrimary || hasLedger;
    }

    /* NON MONTHLY OFFERTORY */

    return r.primaryAmount && Number(r.primaryAmount) > 0;
  };


  const canSave = () => {
    if (rows.length === 0) return false;

    const lastRow = rows[rows.length - 1];

    // ❌ last row partially filled
    if (!isRowEmpty(lastRow) && !isRowComplete(lastRow)) {
      return false;
    }

    // ✅ at least one completed row exists
    return rows.some(isRowComplete);
  };




  const getCompletedRows = () => {
    return rows.filter(isRowComplete);
  };



const buildPayloadRows = () =>
  getCompletedRows().map(r => {

    /* ================= MONTHLY ================= */

    if (isMonthlyOffertory) {

      let entries = [];
      const usedMonths = new Set();

      // primary month
      if (r.primaryMonth && r.primaryAmount) {

        entries.push({
          month: r.primaryMonth,
          amount: Number(r.primaryAmount)
        });

        usedMonths.add(r.primaryMonth);
      }

      // additional months
      r.entries.forEach(e => {

        if (!usedMonths.has(e.month)) {

          entries.push({
            month: e.month,
            amount: Number(e.amount)
          });

          usedMonths.add(e.month);
        }

      });

      return {
        member: r.member || r.member_id,
        entries
      };
    }

    /* ================= NON MONTHLY ================= */

    return {
      member: r.member || r.member_id,
      amount: Number(r.primaryAmount)
    };

  });




  const validateForm = () => {
    if (!offertoryType) {
      setResponse({
        status: "Failed",
        message: "Please select Cover Offertory",
      });
      return false;
    }

    const completedRows = buildPayloadRows();

    if (completedRows.length === 0) {
      setResponse({
        status: "Failed",
        message: "Please complete at least one member with amount",
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

      const completedRows = buildPayloadRows();

        console.log("Payload rows:", completedRows);

      await axios.post(
        `${URL}/offerings/cover-add`,
        {
          offertoryType,
          date,
          day,
          rows: completedRows,
        },
        { headers: { Authorization: token } }
      );


      setResponse({
        status: "Success",
        message: "Cover offering saved successfully",
        time: Date.now(),
      });

      navigate(-1);

    } catch (err) {
      // ✅ BACKEND-AWARE ERROR HANDLING
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        "Server error while saving cover offering";

      // ❌ Conflict: same member + same month + same date
      if (status === 409) {
        setResponse({
          status: "Failed",
          message,
          time: Date.now(),
        });
        return;
      }

      // ❌ Financial year / validation errors
      if (status === 400) {
        setResponse({
          status: "Failed",
          message,
          time: Date.now(),
        });
        return;
      }

      // ❌ Fallback
      setResponse({
        status: "Failed",
        message,
        time: Date.now(),
      });

    } finally {
      setSaving(false);
    }
  };








  const toggleMonthPicker = (rowIndex) => {
    const row = rows[rowIndex];

    // ✅ Require member selection (ID or Name)
    if (!row.member_id && !row.member_name) return;

    updateRow(rowIndex, {
      showMonthPicker: !row.showMonthPicker,
    });
  };



  const isCurrentMonth = (monthLabel) => {
    return monthLabel === currentMonthLabel();
  };


  const dropdownClass = `
  absolute left-0 w-full mt-1
  bg-white border rounded-md shadow-lg
  z-[9999]
  max-h-48 overflow-y-auto
`;



  const onMemberEditStart = (rowIndex, type) => {
    const row = rows[rowIndex];

    // If already has entries → reset
    if (row.entries.length > 0) {
      updateRow(rowIndex, {
        entries: [],
        showMonthPicker: false,
        activeDropdown: type,
        ...(type === "id"
          ? { member_name: "", member_type: "" }
          : { member_id: "", member_type: "" }),
      });
    }
  };


  const onMemberIdChange = (rowIndex, value) => {
    updateRow(rowIndex, {
      member_id: value,
      member_name: "",
      member_type: "",
      entries: [],
      activeDropdown: "id",
    });
    searchMemberById(value, rowIndex);
  };
  const onMemberNameChange = (rowIndex, value) => {
    updateRow(rowIndex, {
      member_name: value,
      member_id: "",
      member_type: "",
      entries: [],
      activeDropdown: "name",
    });
    searchMemberByName(value, rowIndex);
  };
  const hasFilledData = () => {
    return rows.some(
      r =>
        r.member_id ||
        (Array.isArray(r.entries) && r.entries.length > 0)
    );
  };

  const handleOffertoryChange = (value) => {
    // ✅ If default option selected → no modal
    if (!value) {
      setOffertoryType("");
      setRows([emptyRow()]);
      setResponse(null);
      return;
    }

    // ✅ If data exists → show confirm modal
    if (hasFilledData()) {
      setPendingOffertory(value);
      setShowOffertoryConfirm(true);
      return;
    }

    // ✅ Normal change
    setOffertoryType(value);
    setRows([emptyRow()]);
    setResponse(null);
  };





  const confirmOffertoryChange = () => {
    setOffertoryType(pendingOffertory);
    setRows([emptyRow()]);
    setResponse(null);
    setPendingOffertory("");
    setShowOffertoryConfirm(false);
  };

  const cancelOffertoryChange = () => {
    setPendingOffertory("");
    setShowOffertoryConfirm(false);
  };


  const getCurrentButtonLabel = (row) =>
    row.primaryMonth || currentMonthLabel();


  return (
    <div className={`${saving ? "pointer-events-none opacity-60" : ""} p-2`}>
      {/* HEADER */}
      <div className="flex items-center px-3 py-2">
        <FaArrowLeft
          title="Back"
          onClick={() => navigate(-1)}
          className="cursor-pointer text-lavender--600"
        />

      </div>

      {response &&
        (response.status === "Success" ? (
          <SuccessMessage Message={response.message} />
        ) : (
          <FailedMessage Message={response.message} />
        ))}




      <div className="p-5 mx-1 mt-3 bg-white shadow-md rounded-xl">


        <span className="text-xl font-bold text-lavender--600 mb-5 block">
          New Cover Offertory
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Cover Offertory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Offertory <span className="text-red-500">*</span>
            </label>

            <select
              value={offertoryType}
              onChange={(e) => handleOffertoryChange(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Cover Offertory</option>
              {offertories.map((o) => (
                <option key={o.offeringName} value={o.offeringName}>
                  {o.offeringName}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>

            <input
              type="text"
              value={day}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-0"

            />
          </div>




        </div>


        {showOffertoryConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
                  !
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Change Cover Offertory?
                </h2>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Changing the Cover Offertory will clear all entered member and amount
                details. This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelOffertoryChange}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmOffertoryChange}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Yes, Continue
                </button>
              </div>
            </div>
          </div>
        )}


        {/* HEADER ROW */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  

<select
  value={offertoryType}
  onChange={(e) => handleOffertoryChange(e.target.value)}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
>
  <option value="">Select Cover Offertory</option>
  {offertories.map((o) => (
    <option key={o.offeringName} value={o.offeringName}>
      {o.offeringName}
    </option>
  ))}
</select>







<div>


                    <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        // className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />

                    </div>


                    <div>


                    <input        
                        
                        value={day}
                        // className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-0"

                    readOnly
                    />
                    </div>
                </div> */}


        {/* TABLE */}
        {offertoryType && date && (
          <div className="relative mt-6">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {[
                    "S.No",
                    "Member ID",
                    "Member Name",
                    ...(isMonthlyOffertory ? ["Month"] : []),
                    "Amount",
                    "Action"
                  ].map((h) => (
                    <th key={h} className="p-2 text-center font-bold text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, rowIndex) => {

                  const currentMonth = currentMonthLabel();

                  // Ledger rows (saved entries)
                  const ledgerEntries = r.entries;

                  return (
                    <React.Fragment key={rowIndex}>

                      {/* ================= EDITOR ROW (ALWAYS FIRST) ================= */}
                      <tr className="border-t">

                        <td className="p-2 text-center">{rowIndex + 1}</td>

                        {/* MEMBER ID */}
                        <td className="p-2 relative">

                          <input
                            value={r.member_id}
                            onFocus={closeMonthPicker}
                            onChange={(e) => {
                              const value = e.target.value;

                              // 🔴 ONLY when fully cleared → reset months
                              if (!value.trim()) {
                                updateRow(rowIndex, {
                                  member: "",
                                  member_id: "",
                                  member_name: "",
                                  member_type: "",
                                  primaryMonth: null,
                                  primaryAmount: "",
                                  entries: [],
                                  activeDropdown: null,
                                  highlightIndex: 0,
                                });
                                return;
                              }

                              // ✅ typing/searching → DO NOT TOUCH months
                              updateRow(rowIndex, {
                                member: "",
                                member_id: value,
                                member_name: "",
                                member_type: "",
                                activeDropdown: "id",
                                highlightIndex: 0,
                              });

                              searchMemberById(value, rowIndex);
                            }}
                            onKeyDown={(e) =>
                              handleKeyDown(e, r, rowIndex, r.idResults)
                            }
                            className="border px-3 py-2 text-sm block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none"
                          />


                          {/* ID DROPDOWN */}
                          {r.activeDropdown === "id" && r.idResults.length > 0 && (
                            <div

                              className="
    absolute left-0 w-full mt-1
    bg-white border border-gray-200
    rounded-lg shadow-xl z-[9999]

    max-h-56
    overflow-y-auto
    overflow-x-hidden

    scrollbar-thin
    scrollbar-thumb-gray-300
    scrollbar-track-transparent
  "


                            >

                              {r.idResults.map((m, idx) => (
                                <div
                                  key={m.member_id}
                                  ref={(el) => {
                                    dropdownItemRefs.current[idx] = el;

                                    // ✅ auto-scroll when highlighted
                                    if (idx === r.highlightIndex && el) {
                                      el.scrollIntoView({ block: "nearest" });
                                    }
                                  }}

                                  onMouseEnter={() =>
                                    updateRow(rowIndex, { highlightIndex: idx })
                                  }
                                  className={`
          flex justify-between items-center
          px-3 py-2 cursor-pointer text-sm
          transition

          ${idx === r.highlightIndex
                                      ? "bg-lavender--600 text-white"
                                      : "hover:bg-gray-100"}
        `}
                                  onClick={() => {
                                    updateRow(rowIndex, {
                                      member: m._id,
                                      member_id: m.member_id,
                                      member_name: m.member_name,
                                      member_type: m.member_type,
                                      activeDropdown: null,

                                      // ✅ only initialize once
                                      ...(r.primaryMonth
                                        ? {}
                                        : {
                                          ...(isMonthlyOffertory && {
                                            primaryMonth: currentMonthLabel(),
                                            primaryAmount: ""
                                          }),
                                        }),
                                      idResults: [],
                                      nameResults: [],

                                      entries: r.entries ?? [],
                                    });

                                    setTimeout(() => {
                                      amountInputRefs.current[rowIndex]?.focus();
                                    }, 0);
                                  }}



                                >

                                  {/* MEMBER ID */}
                                  <span className="font-semibold text-gray-800">
                                    {m.member_id}
                                  </span>

                                  {/* MEMBER NAME */}
                                  <span className="text-gray-500 text-xs">
                                    {m.member_name}
                                  </span>

                                </div>
                              ))}

                            </div>
                          )}

                        </td>


                        {/* MEMBER NAME */}
                        <td className="p-2 relative">


                          <input
                            value={r.member_name}
                            onFocus={closeMonthPicker}
                            onChange={(e) => {
                              const value = e.target.value;

                              // 🔴 ONLY when fully cleared → reset months
                              if (!value.trim()) {
                                updateRow(rowIndex, {
                                  member: "",
                                  member_name: "",
                                  member_id: "",
                                  member_type: "",
                                  primaryMonth: null,
                                  primaryAmount: "",
                                  entries: [],
                                  activeDropdown: null,
                                  highlightIndex: 0,
                                });
                                return;
                              }

                              // ✅ typing/searching → DO NOT TOUCH months
                              updateRow(rowIndex, {
                                member: "",
                                member_name: value,
                                member_id: "",
                                member_type: "",
                                activeDropdown: "name",
                                highlightIndex: 0,
                              });

                              searchMemberByName(value, rowIndex);
                            }}
                            onKeyDown={(e) =>
                              handleKeyDown(e, r, rowIndex, r.nameResults)
                            }
                            className="border px-3 py-2 text-sm block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none"
                          />


                          {/* NAME DROPDOWN */}
                          {r.activeDropdown === "name" && r.nameResults.length > 0 && (
                            <div

                              className="
    absolute left-0 w-full mt-1
    bg-white border border-gray-200
    rounded-lg shadow-xl z-[9999]

    max-h-56
    overflow-y-auto
    overflow-x-hidden

    scrollbar-thin
    scrollbar-thumb-gray-300
    scrollbar-track-transparent
  "



                            >

                              {r.nameResults.map((m, idx) => (
                                <div
                                  key={m.member_id}
                                  ref={(el) => {
                                    dropdownItemRefs.current[idx] = el;

                                    // ✅ auto-scroll when highlighted
                                    if (idx === r.highlightIndex && el) {
                                      el.scrollIntoView({ block: "nearest" });
                                    }
                                  }}

                                  onMouseEnter={() =>
                                    updateRow(rowIndex, { highlightIndex: idx })
                                  }
                                  className={`
          flex justify-between items-center
          px-3 py-2 cursor-pointer text-sm
          transition

          ${idx === r.highlightIndex
                                      ? "bg-lavender--600 text-white"
                                      : "hover:bg-gray-100"}
        `}
                                  onClick={() => {
                                    updateRow(rowIndex, {
                                      member: m._id,
                                      member_id: m.member_id,
                                      member_name: m.member_name,
                                      member_type: m.member_type,

                                      activeDropdown: null,
                                      idResults: [],
                                      nameResults: [],

                                      ...(r.primaryMonth
                                        ? {}
                                        : {
                                          ...(isMonthlyOffertory && {
                                            primaryMonth: currentMonthLabel(),
                                            primaryAmount: ""
                                          }),
                                        }),
                                      entries: r.entries ?? [],
                                    });

                                    setTimeout(() => {
                                      amountInputRefs.current[rowIndex]?.focus();
                                    }, 0);
                                  }}
                                >

                                  {/* MEMBER NAME */}
                                  <span className="font-semibold text-gray-800">
                                    {m.member_name}
                                  </span>

                                  {/* MEMBER ID */}
                                  <span className="text-gray-500 text-xs">
                                    {m.member_id}
                                  </span>

                                </div>
                              ))}

                            </div>
                          )}

                        </td>


                        {/* MONTH PICKER */}
                        {isMonthlyOffertory && (
                          <td className="p-2 text-center relative">
                            <span
                              onClick={() => toggleMonthPicker(rowIndex)}
                              className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded bg-lavender--600 text-white cursor-pointer shadow-sm"
                            >
                              {getCurrentButtonLabel(r)}

                            </span>






                            {r.showMonthPicker && (
                              <div
                                ref={(el) => {
                                  monthPickerRefs.current[rowIndex] = el;
                                }}
                                className="
      absolute bottom-full left-1/2 -translate-x-1/2 mt-2
      bg-white border shadow-md rounded-md
      z-[9999]

      flex items-center gap-1
      px-2 py-1

      w-[70vw] max-w-[520px]
      overflow-x-auto overflow-y-hidden
      whitespace-nowrap

      scrollbar-thin scrollbar-thumb-gray-300
    "
                              >



                                {monthsList.map(({ label }) => {
                                  const isSelected =
                                    r.primaryMonth === label ||
                                    r.entries.some(e => e.month === label);

                                  return (
                                    <button
                                      key={label}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMonthToggle(rowIndex, label);
                                      }}
                                      className={`
        px-3 py-1 text-xs border rounded flex-shrink-0
        ${isSelected
                                          ? "bg-lavender--600 text-white"
                                          : "bg-white hover:bg-gray-100"}
      `}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}

                              </div>
                            )}


                          </td>

                        )}


                        {/* ACTIVE AMOUNT */}
                        <td className="p-2">
                          {/* {r.member_id && r.primaryMonth && ( */}
                          {(r.member || r.member_id) && (

                            <input
                              // value={r.primaryAmount}
                              value={
                                isMonthlyOffertory
                                  ? r.primaryAmount
                                  : r.primaryAmount || ""
                              }
                              onFocus={closeMonthPicker}
                              ref={(el) => {
                                amountInputRefs.current[rowIndex] = el;
                              }}

                              onChange={(e) =>
                                updateRow(rowIndex, {
                                  primaryAmount: e.target.value.replace(/[^0-9]/g, ""),
                                })
                              }
                              className="
        border border-gray-300
        rounded-md px-3 py-2 text-sm shadow-sm w-28

        focus:outline-none
        focus:ring-0
        focus:border-gray-300    "

                            />
                          )}
                        </td>





                        {/* ADD BUTTON */}
                        <td className="p-2 text-center">
                          {/* {r.member_id && ( */}
                          {r.member && (
                            <div className="flex justify-center items-center gap-3">

                              <td className="p-2 text-center">
                                {r.member_id && rowIndex === rows.length - 1 && (
                                  <FaPlus
                                    className="text-green-600 cursor-pointer"
                                    onClick={() => handleSmartAdd(rowIndex)}
                                  />
                                )}
                              </td>


                              <FaTrash
                                className="text-red-600 cursor-pointer"
                                title="Delete Member"
                                onClick={() => deleteMemberRow(rowIndex)}
                              />

                            </div>
                          )}
                        </td>





                      </tr>


                      {/* ================= LEDGER ROWS ================= */}
                      {isMonthlyOffertory &&
                        ledgerEntries.map((e, entryIndex) => {
                          const isLastLedgerRow =
                            entryIndex === ledgerEntries.length - 1 &&
                            rowIndex === rows.length - 1;

                          return (
                            <tr key={`${e.month}-${entryIndex}`} className="border-t bg-gray-50">

                              <td className="p-2 text-center"></td>
                              <td className="p-2"></td>
                              <td className="p-2"></td>

                              <td className="p-2">{e.month}</td>

                              <td className="p-2">
                                <input
                                  value={e.amount}
                                  onChange={(ev) =>
                                    updateMonthAmount(rowIndex, e.month, ev.target.value)
                                  }
                                  className="
            border border-gray-300 rounded-md
            px-3 py-2 text-sm w-28
            focus:outline-none focus:ring-0
          "
                                />
                              </td>

                              {/* ACTION COLUMN */}
                              <td className="p-2">
                                <div className="flex justify-center items-center gap-3">

                                  {/* PLUS — ONLY ON LAST LEDGER ROW */}
                                  {isLastLedgerRow && (
                                    <FaPlus
                                      className="text-green-600 cursor-pointer"
                                      onClick={() => handleSmartAdd(rowIndex)}
                                    />
                                  )}

                                  {/* DELETE MONTH */}
                                  <FaTrash
                                    className="text-red-500 cursor-pointer"
                                    onClick={() => handleMonthToggle(rowIndex, e.month)}
                                  />


                                </div>
                              </td>

                            </tr>
                          );
                        })}


                    </React.Fragment>
                  );
                })}
              </tbody>



            </table>
          </div>

        )}



        {/* SAVE */}
        {offertoryType && date && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={!canSave() || saving}
              className={`px-6 py-2 rounded-md text-white flex items-center gap-2
              ${!canSave() || saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

        )}


        {!offertoryType && (
          <div className="mt-6 p-4 text-sm text-gray-500 bg-gray-50 border rounded-md">
            Please select <strong>Cover Offertory</strong> and <strong>Date</strong> to add member offerings.
          </div>
        )}

      </div>

      {response && (
        response.status === "Success" ? (
          <SuccessMessage key={response.time} Message={response.message} />
        ) : (
          <FailedMessage key={response.time} Message={response.message} />
        )
      )}

    </div>
  );
};

export default CoverAddOffering;








