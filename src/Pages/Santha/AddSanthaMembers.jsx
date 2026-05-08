
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { URL } from "../../App";
import BackButton from "../../Components/Button/BackButton";

import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";


const emptyRow = () => ({
  member: "",
  member_id: "",
  member_name: "",
  idResults: [],
  nameResults: [],
  activeDropdown: null,
  highlightIndex: 0,

  aprAmount: "",
  sepAmount: "",
});

const AddSanthaMembers = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [day, setDay] = useState(moment(today).format("dddd"));

  const [rows, setRows] = useState([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const lastRequestRef = useRef(0);

  /* ================= DATE ================= */
  const handleDateChange = (d) => {
    setDate(d);
    setDay(moment(d).format("dddd"));
  };

  /* ================= UPDATE ROW ================= */
  const updateRow = (i, data) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...data } : r))
    );
  };

  /* ================= MEMBER SEARCH ================= */

  const searchById = async (value, rowIndex) => {
    if (!value) {
      updateRow(rowIndex, {
        member_name: "",
        idResults: [],
        activeDropdown: null,
      });
      return;
    }

    const reqId = ++lastRequestRef.current;

    const res = await axios.get(`${URL}/member-search/by-id`, {
      params: { id: value },
      headers: { Authorization: token },
    });

    if (reqId !== lastRequestRef.current) return;

    updateRow(rowIndex, {
      idResults: res.data || [],
      nameResults: [],
      activeDropdown: "id",
      highlightIndex: 0,
    });
  };

  const searchByName = async (value, rowIndex) => {
    if (!value) {
      updateRow(rowIndex, {
        member_id: "",
        nameResults: [],
        activeDropdown: null,
      });
      return;
    }

    const reqId = ++lastRequestRef.current;

    const res = await axios.get(`${URL}/member-search`, {
      params: { name: value },
      headers: { Authorization: token },
    });

    if (reqId !== lastRequestRef.current) return;

    updateRow(rowIndex, {
      nameResults: res.data || [],
      idResults: [],
      activeDropdown: "name",
      highlightIndex: 0,
    });
  };

  /* ================= SELECT MEMBER ================= */

  const selectMember = (rowIndex, m) => {
    updateRow(rowIndex, {
      member: m._id,
      member_id: m.member_id,
      member_name: m.member_name,
      idResults: [],
      nameResults: [],
      activeDropdown: null,
    });
  };

  /* ================= ADD ROW ================= */

  const addRow = (i) => {
    const r = rows[i];

    if (!r.member) return;

    if (i === rows.length - 1) {
      setRows((prev) => [...prev, emptyRow()]);
    }
  };

  /* ================= DELETE ROW ================= */

  const deleteRow = (i) => {
    const updated = rows.filter((_, idx) => idx !== i);
    setRows(updated.length ? updated : [emptyRow()]);
  };

  /* ================= VALIDATION ================= */

  const isRowComplete = (r) => {
    return (
      r.member &&
      (Number(r.aprAmount) > 0 || Number(r.sepAmount) > 0)
    );
  };

  const canSave = () => {
    return rows.some(isRowComplete);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (saving || !canSave()) return;



    // ❌ Check rows where member selected but no amount
    const invalidRow = rows.some(
      (r) =>
        r.member &&
        Number(r.aprAmount) <= 0 &&
        Number(r.sepAmount) <= 0
    );

    if (invalidRow) {
      setResponse({
        status: "Failed",
        message: "Enter at least one amount (Apr or Sep)",
      });
      return;
    }

    // ❌ No valid rows at all
    if (saving || !canSave()) {
      setResponse({
        status: "Failed",
        message: "Please enter at least one valid entry",
      });
      return;
    }

    try {
      setSaving(true);

      // ✅ BUILD PAYLOAD (MISSING BEFORE)
      const payload = rows
        .filter(isRowComplete)
        .map((r) => ({
          member: r.member,
          entries: [
            ...(r.aprAmount
              ? [{
                month: `Apr ${moment(date).format("YY")}`,
                amount: Number(r.aprAmount),
              }]
              : []),
            ...(r.sepAmount
              ? [{
                month: `Sep ${moment(date).format("YY")}`,
                amount: Number(r.sepAmount),
              }]
              : []),
          ],
        }));

      const res = await axios.post(
        `${URL}/santha/add`,
        {
          date,
          day,
          rows: payload,
        },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data.message,
      });

      setTimeout(() => {
        navigate("/admin/santha/members");
      }, 1200);

    } catch (err) {
      setResponse({
        status: "Failed",
        message:
          err?.response?.data?.message ||
          "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  return (

    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""} p-2`}>

        {/* HEADER */}

        <BackButton />


        <div className="p-4 mx-1 bg-white shadow-md rounded-xl">

          {/* HEADER ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">

            {/* LEFT → TITLE */}
            <span className="text-xl font-bold text-lavender--600">
              Add Santha
            </span>

            {/* RIGHT → DATE + DAY */}
            <div className="flex items-center gap-4 mt-4 sm:mt-0">

              {/* DATE */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-8 text-sm border-gray-300 rounded-md shadow-sm px-2"
                />
              </div>

              {/* DAY */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Day</label>
                <div className="h-8 flex items-center text-sm text-gray-900 px-2 bg-gray-100 rounded-md">
                  {day}
                </div>
              </div>

            </div>

          </div>

          {/* TABLE */}
          <table className="w-full text-sm text-gray-500">
            <thead>
              <tr>
                {["S.No", "Member ID", "Member Name", "Apr", "Sep", "Action"].map((h) => (
                  <th key={h} className="p-2 text-center font-bold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b text-center">

                  <td className="p-2">{i + 1}</td>

                  {/* MEMBER ID */}
                  <td className="p-2 relative">
                    <input
                      value={r.member_id}
                      onChange={(e) => {
                        const value = e.target.value;

                        updateRow(i, {
                          member_id: value,
                          member_name: "",
                          member: "",

                          // ✅ RESET AMOUNTS
                          aprAmount: "",
                          sepAmount: "",
                        });

                        searchById(value, i);
                      }}
                      className="border px-3 py-2 text-sm block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />

                    {r.activeDropdown === "id" && r.idResults.length > 0 && (
                      <div className="
    absolute left-0 w-full mt-1
    bg-white border border-gray-200
    rounded-lg shadow-lg z-[9999]

    max-h-52 overflow-y-auto
  ">
                        {r.idResults.map((m, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectMember(i, m)}
                            className="
          px-3 py-2 text-sm cursor-pointer
          flex justify-between items-center
          hover:bg-blue-100
        "
                          >
                            <span className="font-medium text-gray-800">
                              {m.member_id}
                            </span>
                            <span className="text-xs text-gray-500">
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
                      onChange={(e) => {
                        const value = e.target.value;

                        updateRow(i, {
                          member_name: value,
                          member_id: "",
                          member: "",

                          // ✅ RESET AMOUNTS
                          aprAmount: "",
                          sepAmount: "",
                        });

                        searchByName(value, i);
                      }}
                      className="border px-3 py-2 text-sm block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />

                    {r.activeDropdown === "name" && r.nameResults.length > 0 && (
                      <div className="
    absolute left-0 w-full mt-1
    bg-white border border-gray-200
    rounded-lg shadow-lg z-[9999]

    max-h-52 overflow-y-auto
  ">
                        {r.nameResults.map((m, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectMember(i, m)}
                            className="
          px-3 py-2 text-sm cursor-pointer
          flex justify-between items-center
          hover:bg-blue-100
        "
                          >
                            <span className="font-medium text-gray-800">
                              {m.member_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {m.member_id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* APR */}
                  <td className="p-2">
                    <input
                      value={r.aprAmount}
                      disabled={!r.member}
                      onChange={(e) =>
                        updateRow(i, {
                          aprAmount: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-28
    ${!r.member ? "bg-gray-100 cursor-not-allowed" : ""}
    focus:outline-none focus:ring-0 focus:border-gray-300`}
                    />
                  </td>

                  {/* SEP */}
                  <td className="p-2">
                    <input
                      value={r.sepAmount}
                      disabled={!r.member}
                      onChange={(e) =>
                        updateRow(i, {
                          sepAmount: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm w-28
    ${!r.member ? "bg-gray-100 cursor-not-allowed" : ""}
    focus:outline-none focus:ring-0 focus:border-gray-300`}
                    />
                  </td>

                  {/* ACTION */}
                  <td className="p-2 flex justify-center gap-3">

                    {i === rows.length - 1 && r.member && (
                      <FaPlus
                        size={16}
                        className="text-green-600 cursor-pointer"
                        onClick={() => addRow(i)}
                      />
                    )}

                    {/* ✅ SHOW TRASH ONLY FOR NON-LAST ROWS */}
                    {rows.length > 1 && i !== rows.length - 1 && (
                      <FaTrash
                        size={16}
                        className="text-red-600 cursor-pointer"
                        onClick={() => deleteRow(i)}
                      />

                    )}

                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* SAVE */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={!canSave() || saving}
              className={`px-6 py-2 rounded-md text-white
            ${!canSave() ? "bg-gray-400" : "bg-lavender--600"}`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

        </div>



      </div>


      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}

    </>
  );
};

export default AddSanthaMembers;

