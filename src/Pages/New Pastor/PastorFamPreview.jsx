import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaEye, FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { TbTransferIn } from "react-icons/tb";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";

export const PastorFamPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);


  const [pastor, setPastor] = useState(null);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All");

  const [memberId, setMemberId] = useState("MBR");
  const [memberType, setMemberType] = useState("");
  const isPreparatory = memberType === "Preparatory/Unpaid Member";

  const [selectedMember, setSelectedMember] = useState(null);

  const [familyId, setFamilyId] = useState("");
  const [headIdSearch, setHeadIdSearch] = useState("");
  const [headName, setHeadName] = useState("");
  const [relation, setRelation] = useState("");

  const [headDropdown, setHeadDropdown] = useState([]);
  const [headValidationMsg, setHeadValidationMsg] = useState("");
  const [headValidationType, setHeadValidationType] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");

  const [isHead, setIsHead] = useState(true);

  const [rowsPerPage, setRowsPerPage] = useState(25); 
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  // debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // 🔥 debounced head search (same logic as AddNewMember.jsx)
  const debouncedHeadSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setHeadDropdown([]);
        return;
      }

      try {
        const res = await axios.get(
          `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        setHeadDropdown(res.data || []);
      } catch (err) {
        setHeadDropdown([
          { member_id: "none", member_name: "No Members Found" }
        ]);
      }
    }, 300)
  ).current;

  // 🔥 Fetch family members (needed for Son/Daughter auto-fill)
  const fetchFamilyMembers = async (famId) => {
    if (!famId) return null;

    try {
      const res = await axios.get(`${URL}/family/${famId}`, {
        headers: { Authorization: token }
      });
      return res.data; // { head_member_id, members: [...] }
    } catch (err) {
      console.log("Family fetch error:", err);
      return null;
    }
  };

  // ⭐ Auto-fill Father / Mother for Son or Daughter (SAME AS AddNewMember)
  const autoFillParents = (family) => {
    if (!family || !family.members) return;

    const members = family.members;
    const headId = family.head_member_id;

    const headMember = members.find(m => m.member_id === headId);
    if (!headMember) return;

    let father = "";
    let mother = "";

    // If Head is Male → Father = Head
    if (headMember.gender === "Male") {
      father = headMember.member_name;

      const wife = members.find(m => m.relation_with_head === "Wife");
      if (wife) mother = wife.member_name;

    } else {
      // If Head is Female → Mother = Head
      mother = headMember.member_name;

      const husband = members.find(m => m.relation_with_head === "Husband");
      if (husband) father = husband.member_name;
    }

    setFatherName(father);
    setMotherName(mother);
  };




  useEffect(() => {
    axios
      .get(`${URL}/pastors/${id}`, {
        headers: { Authorization: token }
      })
      .then((res) => setPastor(res.data.data))
      .catch((err) => console.log("Pastor Fetch Error:", err));


  }, [id]);

  useEffect(() => {
    // axios
    //   .get(
    //     `${URL}/pastors/family-members/${id}?page=${CurrentPage}&search=${searchTerm}&status=${statusFilter}`,
    //     { headers: { Authorization: token } }
    //   )
    //   .then((res) => {
    //     setPastor((prev) => prev || {}); // keep top card data from earlier fetch
    //     setMembers(res.data.data);
    //     setTotalPages(res.data.total_pages);
    //   })



    axios.get(`${URL}/pastors/family-members/${id}`, {
      params: {
        page: CurrentPage,
        limit: rowsPerPage,      // ⭐ REQUIRED
        search: searchTerm,
        status: statusFilter
      },
      headers: { Authorization: token }
    })
      .then((res) => {
        setMembers(res.data.data || []);
        setTotalPages(res.data.totalPages || res.data.total_pages || 1);
      })

      .catch((err) => console.log("Fetch Error:", err));
  }, [id, CurrentPage, searchTerm, statusFilter, rowsPerPage]);


  const resetTransferForm = () => {
    setMemberId("MBR");
    setMemberType("");
    setIsHead(true);
    setFamilyId("");
    setHeadIdSearch("");
    setHeadName("");
    setRelation("");
    setHeadDropdown([]);
    setHeadValidationMsg("");
    setHeadValidationType("");
  };

  useEffect(() => {
    if (isTransferModalOpen) {
      axios.get(`${URL}/new-members/init`, {
        headers: { Authorization: token }
      })
        .then((res) => {
          setMemberId(res.data.memberId);
        })
        .catch(() => setMemberId("MBR"));
    }
  }, [isTransferModalOpen]);

  // const handleMemberTypeChange = async (value) => {
  //   setMemberType(value);

  //   if (value === "Preparatory/Unpaid Member") {
  //     // Preparatory member CANNOT be head
  //     setIsHead(false);
  //     setFamilyId("");
  //     return;
  //   }

  //   // For all other member types → Head by default
  //   setIsHead(true);

  //   // Auto-generate family ID immediately when member type is selected
  //   const nextFamId = await fetchNextFamilyId();
  //   setFamilyId(nextFamId);
  // };

  const getBaseId = (id) => id.split("/")[0]; // helper

  const handleMemberTypeChange = async (value) => {
    setMemberType(value);

    // Important: Take BASE from current auto-generated MBRxxxx (from init)
    const base = getBaseId(memberId);

    // ⭐ Preparatory Member = /2 + isHead = false
    if (value === "Preparatory/Unpaid Member") {
      setIsHead(false);
      setFamilyId(""); // No family ID for child yet
      setMemberId(base + "/2");
      return;
    }

    // ⭐ All other members = /1 + isHead = true
    setIsHead(true);
    setMemberId(base + "/1");

    // Fetch new family ID
    const nextFamId = await fetchNextFamilyId();
    setFamilyId(nextFamId);
  };




  const handleMemberIdChange = (e) => {
    let value = e.target.value;

    if (!value.startsWith("MBR")) return;

    let numeric = value.replace("MBR", "").replace(/[^0-9/]/g, "");
    let parts = numeric.split("/");

    if (parts[0].length > 5) parts[0] = parts[0].slice(0, 5);
    if (parts[1] && parts[1].length > 1) parts[1] = parts[1].slice(0, 1);

    let formatted = "MBR" + parts.join("/");
    setMemberId(formatted);
  };

  const handleFamilyIdChange = (e) => {
    let value = e.target.value.toUpperCase();

    // Must start with FAM
    if (!value.startsWith("FAM")) {
      value = "FAM";
    }

    // Extract digits only
    let numeric = value.replace("FAM", "").replace(/[^0-9]/g, "");

    // Limit to 5 digits
    if (numeric.length > 5) numeric = numeric.slice(0, 5);

    setFamilyId("FAM" + numeric);
  };

  // const validateHead = async (headId) => {
  //   try {
  //     const res = await axios.post(
  //       `${URL}/new-members/validate-head`,
  //       {
  //         headMemberId: headId,
  //         isPreparatory: memberType === "Preparatory/Unpaid Member"
  //       },
  //       { headers: { Authorization: token } }
  //     );

  //     // ✅ SAME AS AddNewMember.jsx
  //     setFamilyId(res.data.familyId);
  //     setHeadName(res.data.headName);
  //     setMemberId(res.data.nextMemberId);   // ⭐ THIS IS THE MISSING LINE

  //     setHeadValidationMsg("Family Head validated successfully");
  //     setHeadValidationType("success");

  //     setTimeout(() => {
  //       setHeadValidationMsg("");
  //       setHeadValidationType("");
  //     }, 3000);

  //   } catch (err) {
  //     setHeadName("");
  //     setHeadValidationMsg(
  //       err.response?.data?.message || "Invalid Family Head ID"
  //     );
  //     setHeadValidationType("error");

  //     setTimeout(() => {
  //       setHeadValidationMsg("");
  //       setHeadValidationType("");
  //     }, 3000);
  //   }
  // };

  const validateHead = async (headId) => {
    try {
      const res = await axios.post(
        `${URL}/new-members/validate-head`,
        {
          headMemberId: headId,
          isPreparatory: memberType === "Preparatory/Unpaid Member"
        },
        { headers: { Authorization: token } }
      );

      // ⭐ SAME AS AddNewMember
      setFamilyId(res.data.familyId);
      setHeadName(res.data.headName);
      setMemberId(res.data.nextMemberId);

      // ⭐ Fetch family & auto-fill parents if Son/Daughter
      fetchFamilyMembers(res.data.familyId).then((family) => {
        if (family && (relation === "Son" || relation === "Daughter")) {
          autoFillParents(family);
        }
      });

      setHeadValidationType("success");
      setHeadValidationMsg("Family Head validated successfully");

      setTimeout(() => {
        setHeadValidationMsg("");
        setHeadValidationType("");
      }, 3000);

    } catch (err) {
      setHeadName("");
      setHeadValidationType("error");
      setHeadValidationMsg(
        err.response?.data?.message || "Invalid Family Head ID"
      );

      setTimeout(() => {
        setHeadValidationMsg("");
        setHeadValidationType("");
      }, 3000);
    }
  };

  const fetchNextFamilyId = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/next-family-id`, {
        headers: { Authorization: token }
      });
      return res.data.familyId;
    } catch (err) {
      console.log("Family ID Fetch Error:", err);
      return "";
    }
  };


  const handleTransferSubmit = async () => {
    if (!selectedMember) {
      return setResponse({ status: "Failed", message: "No member selected" });
    }

    if (!memberId || !memberType) {
      return setResponse({ status: "Failed", message: "Fill all required fields" });
    }

    const payload = {
      member_id: memberId,
      member_type: memberType,
      isHead: isHead ? "Yes" : "No",
      family_id: familyId,
      relation_with_head: isHead ? "Head" : relation
    };

    // ⭐ Detect if transferring the PASTOR
    const isPastor = selectedMember.relation === "Pastor";

    // ⭐ Build correct URL
    const transferUrl = isPastor
      ? `${URL}/pastors/transfer-family-member/${id}`
      : `${URL}/pastors/transfer-family-member/${id}/${selectedMember._id}`;

    try {
      await axios.post(transferUrl, payload, {
        headers: { Authorization: token }
      });

      setIsTransferModalOpen(false);
      setIsModalOpen(false);

      setResponse({
        status: "Success",
        message: "Member transferred successfully"
      });


    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Transfer failed"
      });
    }
  };




  if (!pastor) return <p className="text-center mt-10">Loading...</p>;






  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate("/admin/pastorlist")}
        className="cursor-pointer mb-4"
      />

      {/* TOP INFO CARD */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[12px] border-2 border-lavender--600">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 w-full items-start text-center">


          {/* Pastor ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-id-card text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Pastor ID</p>
            </div>
            <p className="font-semibold text-gray-900">{pastor.pastor_id}</p>
          </div>

          {/* Pastor Family ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-people-roof text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Pastor Family ID</p>
            </div>
            <p className="font-semibold text-gray-900">{pastor.pastor_family_id}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-house text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Address</p>
            </div>
            <p className="font-semibold text-gray-900 text-center">
              {pastor.residential_address || "No Address"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-id-card text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Status</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-center font-semibold text-xs 
                        ${pastor.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
            >
              {pastor.status}
            </span>
          </div>

        </div>
      </div>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Pastor Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => navigate(`/admin/pastorlist/addpastorfamily/${id}`)}
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Add Family Member
          </button>

        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Relation</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-400">
                    No Family Members Found
                  </td>
                </tr>
              ) : (
                members.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2 text-center">  {(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center">{m.member_id}</td>
                    <td className="p-2 text-left">{m.name}</td>
                    <td className="p-2 text-center">{m.relation}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs 
                        ${m.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2 text-center flex justify-center gap-3">
                      {m.relation === "Pastor" ? (
                        <FaEye
                          size={18}
                          onClick={() => navigate(`/admin/pastorlist/viewpastor/${pastor._id}`)}
                          className="text-lavender--600 cursor-pointer"
                        />
                      ) : (
                        <FaEye
                          size={18}
                          onClick={() => navigate(`/admin/pastorlist/viewpastorfammem/${id}/${m._id}`)}
                          className="text-lavender--600 cursor-pointer"
                        />
                      )}

                      {/* <TbTransferIn
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => {
                          setSelectedMember(m);
                          resetTransferForm();
                          setIsModalOpen(true);
                        }}
                      /> */}
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

        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

  

    
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
