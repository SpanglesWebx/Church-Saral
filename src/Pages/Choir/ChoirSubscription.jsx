import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaEye, FaRupeeSign } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import DetailModal from "../../Components/Expense/detailsModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { useForm } from "react-hook-form";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Helpers/Pagination";


export const ChoirSubscription = () => {
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const [memberIdSearch, setmemberIdSearch] = useState("");
  const [memberNameSearch, setmemberNameSearch] = useState("");
  const [memberMobileSearch, setmemberMobileSearch] = useState("");

  const [memberDropdown, setmemberDropdown] = useState([]);
  const [search, setSearch] = useState("");

  const [subscriptions, setSubscriptions] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewPage, setViewPage] = useState(1);
  const [viewRowsPerPage, setViewRowsPerPage] = useState(10);
  const [viewRowsInput, setViewRowsInput] = useState("");
  const [viewJumpInput, setViewJumpInput] = useState("");

  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState("");
  const [amountHistory, setAmountHistory] = useState(null);



  const [savingSubscription, setSavingSubscription] = useState(false);
  const [savingRequiredAmount, setSavingRequiredAmount] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");


    const token = window.sessionStorage.getItem("token");

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      memberObjectId: "",
      amount: "",
      date: new Date().toLocaleDateString("en-GB"), // dd/mm/yyyy
    },
  });

  /* ---------------- TOAST ---------------- */
  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  /* ---------------- FETCH SUBSCRIPTIONS ---------------- */

  const fetchSubscriptions = async (page = 1, searchVal = "", statusVal = "All") => {
    try {
      const res = await axios.get(`${URL}/choir-subscription`, {
        params: {
          page,
          limit: rowsPerPage,
          search: searchVal,
          status: statusVal !== "All" ? statusVal : undefined
        },
        headers: { Authorization: token }
      });

      setSubscriptions(res.data.data || []);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch {
      showToast("Error", "Failed to fetch subscriptions");
    }
  };

  useEffect(() => {
    fetchSubscriptions(CurrentPage, search, statusFilter);
  }, [CurrentPage, search, rowsPerPage, statusFilter]);

  /* ---------------- DEBOUNCE ---------------- */
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  /* ---------------- SEARCH BY ID ---------------- */
  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setmemberDropdown([]);
      const res = await axios.get(
        // `${URL}/member-search/choir-by-id?member_id=${val}`,
        `${URL}/member-search/by-id?id=${val}`,
        { headers: { Authorization: token } }
      );
      setmemberDropdown(res.data || []);
    }, 300)
  ).current;

  /* ---------------- SEARCH BY NAME ---------------- */
  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setmemberDropdown([]);
      const res = await axios.get(

        `${URL}/member-search?name=${val}`,
        // `${URL}/member-search/choir-by-name?member_name=${val}`,
        { headers: { Authorization: token } }
      );
      setmemberDropdown(res.data || []);
    }, 300)
  ).current;

  /* ---------------- SEARCH BY MOBILE ---------------- */
  const debouncedSearchByMobile = useRef(
    debounce(async (val) => {
      if (!val) return setmemberDropdown([]);
      const res = await axios.get(
        `${URL}/member-search/choir-by-mobile?mobile_number=${val}`,
        { headers: { Authorization: token } }
      );
      setmemberDropdown(res.data || []);
    }, 300)
  ).current;



  useEffect(() => {
    const blockRefresh = (e) => {
      if (savingSubscription || savingRequiredAmount) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [savingSubscription, savingRequiredAmount]);


  /* ---------------- SAVE SUBSCRIPTION ---------------- */
  const onSubmit = async (data) => {
    if (savingSubscription) return;
    if (!data.memberObjectId) {
      showToast("Error", "Please select a member");
      return;
    }
    try {
      setSavingSubscription(true);
      await axios.post(
        `${URL}/choir-subscription/add`,
        {
          member: data.memberObjectId,   // 🔥 send ObjectId only
          amount: Number(data.amount),
          date: new Date(),
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Subscription amount added");

      await fetchSubscriptions(CurrentPage, search);

      reset({
        memberId: "",
        memberName: "",
        memberPhone: "",
        amount: "",
        date: new Date().toLocaleDateString("en-GB"),
      });

      setmemberIdSearch("");
      setmemberNameSearch("");
      setmemberMobileSearch("");
      setmemberDropdown([]);

    } catch {
      showToast("Error", "Failed to add subscription");
    }
    finally {
      setSavingSubscription(false);
    }
  };



  const handleView = async (memberId) => {
    if (!memberId) {
      showToast("Error", "Invalid member");
      return;
    }
    try {
      const res = await axios.get(
        `${URL}/choir-subscription/by-member`,
        {
          params: { member: memberId },
          headers: { Authorization: token }
        }
      );

      setViewData(res.data);

      setViewPage(1);
      setViewRowsPerPage(10);
      setViewRowsInput("");
      setViewJumpInput("");

      setIsViewModalOpen(true);

    } catch {
      showToast("Error", "Failed to load subscription details");
    }
  };



  const fetchRequiredAmountHistory = async () => {
    try {
      const res = await axios.get(
        `${URL}/choir-subscription/required-amount`,
        { headers: { Authorization: token } }
      );

      setAmountHistory(res.data.data || null);
    } catch (err) {
      console.log(err);
    }
  };



  useEffect(() => {
    if (isAmountModalOpen) {
      fetchRequiredAmountHistory();
    }
  }, [isAmountModalOpen]);



  const handleSaveRequiredAmount = async () => {
    if (savingRequiredAmount) return;

    if (!requiredAmount || requiredAmount <= 0) {
      showToast("Error", "Enter valid amount");
      return;
    }

    try {
      setSavingRequiredAmount(true);
      const res = await axios.post(
        `${URL}/choir-subscription/required-amount`,
        {
          requiredAmount: Number(requiredAmount),
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Required amount updated");

      setRequiredAmount("");
      setIsAmountModalOpen(false);

      // Optional: refresh history
      fetchRequiredAmountHistory();

    } catch (err) {
      showToast("Error", "Failed to update amount");
    }
    finally {
      setSavingRequiredAmount(false);
    }
  };



  return (
    <>

      <div className="p-3 sm:p-5 mx-1 sm:mx-3 mt-3 bg-white shadow-md rounded-xl">

        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}




        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">

          {/* Title */}
          <h1 className="text-lg sm:text-xl font-bold text-lavender--600">
            Choir Subscription
          </h1>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">

            {/* Search */}
            <input
              type="search"
              className="w-full sm:w-56 px-3  border  block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
              placeholder="Search by Name or ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-40 px-3  border  block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Required Amount Button */}
            <button
              onClick={() => setIsAmountModalOpen(true)}
              className="flex justify-center items-center gap-2 h-10 px-4 py-2 bg-lavender--600 text-white rounded-lg w-full sm:w-auto"
              title="Required Amount"
            >
              <FaRupeeSign />
            </button>

            {/* Add Amount Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex justify-center items-center gap-2 h-10 px-4 py-2 bg-lavender--600 text-white rounded-lg w-full sm:w-auto"
            >
              <FaPlus /> Add Amount
            </button>

          </div>

        </div>



        <DetailModal
          isOpen={isAmountModalOpen}
          onClose={() => setIsAmountModalOpen(false)}
          title="Set Required Choir Amount"
          loading={savingRequiredAmount}
        >

          <div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] gap-3 items-end mb-6">


            {/* Input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Required Amount
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={requiredAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setRequiredAmount(value);
                }}
                placeholder="Enter Required Amount"
                className="  block w-full px-3 py-2  text-sm border border-gray-300 rounded-md shadow-sm
                     focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>

            {/* Button */}
            <button
              onClick={handleSaveRequiredAmount}
              disabled={savingRequiredAmount}
              className={`h-[40px] px-4 rounded text-white flex items-center justify-center gap-2
      ${savingRequiredAmount
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"}
    `}
            >
              {savingRequiredAmount && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {savingRequiredAmount ? "Saving..." : "Save"}
            </button>

          </div>



          {/* Show History */}
          {/* Show History */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Current Year Required Amount
            </h3>

            {amountHistory ? (
              <div className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                {/* Amount */}
                <div className="text-lg font-semibold text-lavender--600">
                  ₹ {Number(amountHistory.requiredAmount).toLocaleString()}
                </div>

                {/* Updated Date */}
                <div className="text-xs text-gray-500">
                  Updated on{" "}
                  {new Date(amountHistory.updatedAt).toLocaleString("en-GB")}
                </div>

              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-500">
                No required amount set for this year
              </div>
            )}
          </div>

        </DetailModal>


        <div className="overflow-x-auto mt-4">
          <table className="min-w-[750px] w-full text-sm text-gray-500">

            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>

                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Phone</th>
                <th className="p-2 text-center">Total</th>
                <th className="p-2 text-center">Status</th>

                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>



            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((s, i) => (
                  <tr key={s._id} className="text-center border-b">
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + i + 1}

                    </td>


                    <td className="p-2">{s.memberData?.member_name}</td>
                    <td className="p-2">{s.memberData?.member_id}</td>
                    <td className="p-2">{s.memberData?.primary_contact}</td>
                    <td className="p-2 ">
                      ₹ {s.totalAmount || 0}
                    </td>
                    {/* 🔥 STATUS */}
                    <td className="p-2">
                      {s.status === "Completed" ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Pending
                        </span>
                      )}
                    </td>


                    <td className="p-2 text-center flex justify-center gap-3">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        title="View Subscription"
                        onClick={() => handleView(s.memberData?._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>

          </table>


          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title="Choir Subscription Details"
          >
            {viewData && (
              <>
                {/* 🔹 HEADER – Key Value Row */}
                <div className="flex flex-col pt-5 ps-5 space-y-6 max-h-[650px] overflow-y-auto">

                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Member ID</span>
                      <span className="text-sm font-medium text-gray-800">
                        {viewData.member?.member_id}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-800">
                        {viewData.member?.member_name}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Phone</span>
                      <span className="text-sm font-medium text-gray-800">
                        {viewData.member?.primary_contact}
                      </span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                    {/* Status */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Status</span>
                      {viewData.status === "Completed" ? (
                        <span className="text-green-600 font-semibold">
                          Completed
                        </span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Total Paid */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Total Paid</span>
                      <span className="text-lg font-semibold text-gray-800">
                        ₹ {viewData.totalAmount || 0}
                      </span>
                    </div>

                    {/* Status Updated At */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Status Updated At</span>
                      <span className="text-sm font-medium text-gray-800">
                        {viewData.statusUpdatedAt
                          ? new Date(viewData.statusUpdatedAt).toLocaleString("en-GB")
                          : "-"}
                      </span>
                    </div>

                  </div>

                </div>




                {/* 🔹 TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-600">
                    <thead className="text-gray-700 text-sm">
                      <tr>
                        <th className="p-2 text-center">Sl No.</th>
                        <th className="p-2 text-center">Date & Time Added</th>
                        <th className="p-2 text-center">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {viewData.subscriptions
                        ?.slice(
                          (viewPage - 1) * viewRowsPerPage,
                          viewPage * viewRowsPerPage
                        )
                        .map((sub, idx) => (
                          <tr key={sub._id} className="border-b text-center">
                            <td className="p-2">
                              {(viewPage - 1) * viewRowsPerPage + idx + 1}
                            </td>

                            {/* ⭐ DATE + TIME */}
                            <td className="p-2">
                              {new Date(sub.date)
                                .toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })
                                .toUpperCase()}
                            </td>


                            <td className="p-2 font-medium">
                              ₹ {sub.amount}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* 🔹 PAGINATION */}
                <Pagination
                  currentPage={viewPage}
                  totalPages={Math.ceil(
                    viewData.subscriptions.length / viewRowsPerPage
                  )}
                  rowsPerPage={viewRowsPerPage}
                  rowsInput={viewRowsInput}
                  jumpInput={viewJumpInput}
                  setCurrentPage={setViewPage}
                  setRowsPerPage={setViewRowsPerPage}
                  setRowsInput={setViewRowsInput}
                  setJumpInput={setViewJumpInput}
                />




              </>
            )}
          </Modal>

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

      {/* ---------------- MODAL ---------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Subscription Amount"
      >
        <div className={`${savingSubscription ? "pointer-events-none opacity-60" : ""}`}>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ROW 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">

              {/* Member ID */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Member ID
                </label>
                <input
                  type="text"
                  placeholder="Search by Member ID"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
                     focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                  value={memberIdSearch}
                  onChange={(e) => {
                    setmemberIdSearch(e.target.value);
                    debouncedSearchById(e.target.value);
                  }}
                />
              </div>

              {/* Member Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Member Name
                </label>
                <input
                  type="text"
                  placeholder="Search by Member Name"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
                     focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                  value={memberNameSearch}
                  onChange={(e) => {
                    setmemberNameSearch(e.target.value);
                    debouncedSearchByName(e.target.value);
                  }}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Search by Mobile Number"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
                     focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                  value={memberMobileSearch}
                  onChange={(e) => {
                    setmemberMobileSearch(e.target.value);
                    debouncedSearchByMobile(e.target.value);
                  }}
                />
              </div>

              {/* Dropdown */}
              {memberDropdown.length > 0 && (
                <ul className="absolute left-0 mt-[90px] w-full bg-white border border-gray-200
                       rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {memberDropdown.map((m) => (
                    <li
                      key={m._id}
                      className="flex px-3 py-2 text-sm text-gray-700
                         hover:bg-indigo-50 cursor-pointer transition"
                      onClick={() => {
                        setValue("memberObjectId", m._id);
                        setValue("memberId", m.member_id);
                        setValue("memberName", m.member_name);
                        setValue("memberPhone", m.mobile_number);

                        setmemberIdSearch(m.member_id);
                        setmemberNameSearch(m.member_name);
                        setmemberMobileSearch(m.mobile_number);

                        setmemberDropdown([]);
                      }}
                    >
                      <span className="w-[220px] font-medium">
                        {m.member_id}
                      </span>
                      <span className="flex-1">
                        {m.member_name}
                      </span>
                      <span className="w-[150px] text-gray-500">
                        {m.mobile_number}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>


                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Amount"
                  {...register("amount")}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                      e.preventDefault();
                    }
                  }}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
             focus:ring-1 focus:ring-lavender--600 focus:border-lavender--600"
                />

              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  readOnly
                  {...register("date")}
                  className="block w-full px-3 py-2 text-sm border  rounded-md shadow-sm
                     "
                />
              </div>
            </div>

            <input
              type="hidden"
              {...register("memberObjectId", { required: true })}
            />


            {/* ACTION */}
            <div className="flex justify-end gap-3 mt-6">
              {/* <button
              type="submit"
              className="px-4 py-2 bg-lavender--600 text-white rounded-md
                   hover:bg-lavender--700 transition"
            >
              Save
            </button> */}
              <button
                type="submit"
                disabled={savingSubscription}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${savingSubscription ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
              >
                {savingSubscription && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {savingSubscription ? "Saving..." : "Save"}
              </button>

            </div>
          </form>
        </div>
      </Modal>

    </>
  );
};
