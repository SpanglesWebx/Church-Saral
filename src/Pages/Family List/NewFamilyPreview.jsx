import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import Pagination from "../../Components/Helpers/Pagination";
import axios from "axios";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import { PiLetterCircleHBold } from "react-icons/pi";

export const NewFamilyPreview = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [family, setFamily] = useState(null);
  const location = useLocation();
  const familyId = location.state?.familyId;
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [familyPhoto, setFamilyPhoto] = useState(null);
  const [isPhotoHover, setIsPhotoHover] = useState(false);




  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");


  const fetchFamilyMembers = async (
    page = 1,
    searchVal = ""
  ) => {
    try {

      const res = await axios.get(`${URL}/family/${familyId}`, {
        params: {
          page,
          limit: rowsPerPage,
          search: searchVal
        },
        headers: { Authorization: token }
      });

      setFamily(res.data);
      setCurrentPage(res.data.currentPage || page);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.log("Family Fetch Error:", err);
    }
  };

  // useEffect(() => {
  //   if (!familyId) return;

  //   const token = window.sessionStorage.getItem("token");

  //   axios
  //     .get(`${URL}/family/${familyId}`, { headers: { Authorization: token } })
  //     .then(res => setFamily(res.data))
  //     .catch(err => console.log("Family Fetch Error:", err));
  // }, [familyId]);


  useEffect(() => {
    if (!familyId) return;

    fetchFamilyMembers(CurrentPage, searchTerm);

  }, [familyId, CurrentPage, searchTerm, rowsPerPage]);



  // const getOrderedMembers = (members = []) => {
  //   if (!members.length) return [];

  //   const head = members.find(m => m.relationship === "Head");
  //   const wife = members.find(m => m.relationship === "Wife");

  //   const children = members
  //     .filter(m => ["Son", "Daughter"].includes(m.relationship))
  //     .sort((a, b) =>
  //       (a.child_label || "").localeCompare(b.child_label || "")
  //     );

  //   return [
  //     ...(head ? [head] : []),
  //     ...(wife ? [wife] : []),
  //     ...children,
  //   ];
  // };


  const getOrderedMembers = (members = []) => {
    if (!members.length) return [];

    const head = members.find(m => m.relationship === "Head");

    const husband = members.find(m => m.relationship === "Husband");
    const wife = members.find(m => m.relationship === "Wife");

    const children = members
      .filter(m => ["Son", "Daughter"].includes(m.relationship))
      .sort((a, b) =>
        (a.child_label || "").localeCompare(b.child_label || "")
      );

    return [
      ...(head ? [head] : []),
      ...(husband ? [husband] : []),
      ...(wife ? [wife] : []),
      ...children
    ];
  };

  const hasTransferDetails =
    Array.isArray(family?.transfer_details) &&
    family.transfer_details.length > 0;



  useEffect(() => {

    if (!familyPhoto) return;

    const uploadPhoto = async () => {

      const formData = new FormData();
      formData.append("photo", familyPhoto);

      try {

        const res = await axios.post(
          `${URL}/family/${familyId}/upload-photo`,
          formData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        setFamily(prev => ({
          ...prev,
          family_photo: res.data.family_photo
        }));

      } catch (err) {
        console.log("Photo Upload Error:", err);
      }

    };

    uploadPhoto();

  }, [familyPhoto]);



  const getDisplayRelation = (relation) => {
    switch (relation) {
      case "Husband":
        return "Father";
      case "Wife":
        return "Mother";
      case "Son":
        return "Son";
      case "Daughter":
        return "Daughter";
      default:
        return relation;
    }
  };


  return (
    <>
      <FaArrowLeft
        size={18}
        title='Back'
        onClick={() => navigate("/admin/familylist")}
        className="cursor-pointer mb-4"
      />
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[12px] border-2 border-lavender--600">

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 w-full items-start text-center">

          {/* Family Head */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-regular fa-user text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Family Head</p>
            </div>
            <p className="font-semibold text-gray-900">{family?.head_member_name}</p>
          </div>

          {/* Family ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-sitemap text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Family ID</p>
            </div>
            <p className="font-semibold text-gray-900">{family?.family_id}</p>
          </div>

          {/* Address */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-house text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Address</p>
            </div>
            <p className="font-semibold text-gray-900 text-center">
              {family?.address || "No Address"}
            </p>
          </div>



          {/* Family Photo */}
          <div className="flex flex-col items-center w-full">

            <div
              className="relative h-[6rem] w-40 border rounded-md overflow-hidden bg-gray-100 cursor-pointer"
              onMouseEnter={() => setIsPhotoHover(true)}
              onMouseLeave={() => setIsPhotoHover(false)}
            >

              {family?.family_photo ? (
                <>
                  {/* Image */}
                  <img
                    src={`${URL}/${family.family_photo}?t=${Date.now()}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Family"
                  />

                  {/* Dark Hover Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 transition duration-300 ${isPhotoHover ? "opacity-100" : "opacity-0"
                      }`}
                  />

                  {/* Edit Icon */}
                  <label
                    htmlFor="familyPhotoUpload"
                    title='Edit Photo'
                    className={`
            absolute bottom-2 right-2 z-20
            bg-black text-white
            p-2 rounded-full shadow-lg
            cursor-pointer
            transition-all duration-200
            ${isPhotoHover ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          `}
                  >
                    <CiEdit className='text-lavender--600' size={18} />
                  </label>
                </>
              ) : (

                <div className="flex flex-col items-center justify-center h-full text-center px-2">

                  <span className="text-xs text-gray-500">
                    No Photo Uploaded
                  </span>

                  <label
                    htmlFor="familyPhotoUpload"
                    className="text-xs text-lavender--600 font-medium mt-1 cursor-pointer"
                  >
                    Add Family Photo
                  </label>

                </div>

              )}

              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setFamilyPhoto(e.target.files[0])}
                className="hidden"
                id="familyPhotoUpload"
              />

            </div>

          </div>






          {hasTransferDetails && showTransferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-3 border-b">
                  <h2 className="text-lg font-semibold text-lavender--600">
                    Transfer Details
                  </h2>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="text-gray-500 hover:text-gray-800 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-4 text-sm">
                  {family.transfer_details.map((t, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6">

                        <span className="text-gray-600 font-medium">Member</span>
                        <span className="text-gray-900">
                          {t.member_name} ({t.member_id})
                        </span>

                        <span className="text-gray-600 font-medium">Old Family ID</span>
                        <span className="text-gray-900">{t.old_family_id}</span>

                        <span className="text-gray-600 font-medium">Relationship</span>
                        {/* <span className="text-gray-900">
                          {t.old_relationship}
                          {t.child_label && (
                            <span className="inline-flex ml-2 items-center justify-center
                    w-5 h-5 rounded-full bg-lavender--600
                    text-white text-xs font-semibold">
                              {t.child_label}
                            </span>
                          )}
                          {" "}→{" "}
                          <span className="font-semibold">{t.new_relationship}</span>
                        </span> */}


                        <span className="text-gray-900 flex items-center gap-1">
                          {t.old_relationship}

                          {t.child_label && (
                            <span
                              className="inline-flex ml-2 items-center justify-center
      w-5 h-5 rounded-full bg-lavender--600
      text-white text-xs font-semibold"
                            >
                              {t.child_label}
                            </span>
                          )}

                          <span className="mx-1">→</span>

                          <span className="font-semibold flex items-center gap-1">
                            {/* {t.member?.relationship} */}
                            {getDisplayRelation(t.member?.relationship)}

                            {t.member?.is_head && (
                              <PiLetterCircleHBold
                                className="text-green-600 font-bold"
                                size={18}
                              />
                            )}
                          </span>
                        </span>

                        <span className="text-gray-600 font-medium">Transferred At</span>
                        <span className="text-gray-700">
                          {new Date(t.family_changed_at).toLocaleString()}
                        </span>

                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}


              </div>
            </div>
          )}



        </div>


      </div>



      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">


          <h1 className="text-xl font-bold capitalize text-lavender--600">
            Family
          </h1>
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search by Name or ID"
              value={searchTerm}
              // onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button onClick={() => navigate('/admin/memberlist/addnewmember')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Member
          </button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Tamil Name</th>
                <th className="p-2 text-left">Relation</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>

              {/* {getOrderedMembers(family?.members).map((m, index) => ( */}
              {getOrderedMembers(family?.members || []).map((m, index) => (
                <tr key={m.member_id} className="border-b">
                  <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2 text-center">{m.member_id}</td>
                  <td className="p-2 text-left">{m.member_name}</td>
                  <td className="p-2 text-left">{m.member_tamil_name}</td>

                  <td className="p-2">
                    <div className="flex items-center">


                      <div className="w-8 flex justify-center">
                        {["Son", "Daughter"].includes(m.relationship) && m.child_label && (
                          <span className="w-6 h-6 flex items-center justify-center
                     rounded-full bg-lavender--600
                     text-white font-semibold text-xs">
                            {m.child_label}
                          </span>
                        )}
                      </div>


                      {/* RELATION TEXT */}
                      <span className="ml-2 flex items-center gap-1">

                        {/* RELATION TEXT */}
                        {getDisplayRelation(m.relationship)}

                        {/* HEAD SYMBOL */}
                        {m.is_head && (
                          <PiLetterCircleHBold
                            className="text-green-600 font-bold"
                            size={18}
                          />
                        )}

                      </span>
                    </div>
                  </td>




                  <td className="p-2 text-center">
                    <span className={m.status === "Active" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {m.status}
                    </span>
                  </td>


                  <td className="p-2 text-center ">
                    <FaEye
                      size={18}
                      className="text-lavender--600 cursor-pointer mx-auto"
                      onClick={() =>
                        navigate(`/admin/familylist/familymemberslist/familymemberview/${m._id}`)
                      }

                    />
                  </td>
                </tr>
              ))}
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
          defaultRows={10}
        />
      </div>





      {hasTransferDetails && (
        <div className="p-3 mx-1 mt-4 bg-white shadow-md rounded-[10px] border">
          <h1 className="text-lg font-semibold mb-3 flex items-center gap-2">

            Transfer Details
          </h1>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead className="border-b text-gray-700">
                <tr>
                  <th className="p-2 text-center">Sl No.</th>
                  <th className="p-2 text-center">Member ID</th>
                  <th className="p-2 text-left">Member Name</th>
                  <th className="p-2 text-left">Relation</th>
                  <th className="p-2 text-center">Old Family</th>
                  <th className="p-2 text-center">Date</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {family.transfer_details.map((t, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-center">{i + 1}</td>

                    <td className="p-2 text-center">
                      {t.member?.member_id}
                    </td>

                    <td className="p-2 text-left">
                      {t.member?.member_name}
                    </td>

                    <td className="p-2 text-left">
                      <div className="flex items-center gap-2">
                        {t.child_label && (
                          <span className="mx-1 inline-flex items-center justify-center
        w-5 h-5 rounded-full bg-lavender--600 text-white text-xs font-semibold">
                            {t.child_label}
                          </span>
                        )}
                        {/* {t.old_relationship} → <span className="font-semibold">{t.new_relationship}</span> */}
                        <span className="flex items-center gap-1 font-semibold ">

                          {t.old_relationship}

                          <span>→</span>

                          <span className="font-semibold flex items-center gap-1">
                            {getDisplayRelation(t.member?.relationship)}

                            {t.member?.is_head && (
                              <PiLetterCircleHBold
                                className="text-green-600 font-bold"
                                size={18}
                              />
                            )}
                          </span>

                        </span>
                      </div>
                    </td>

                    <td className="p-2 text-center">{t.old_family_id}</td>

                    {/* <td className="p-2 text-center">
                      {new Date(t.family_changed_at).toLocaleString()}
                    </td> */}

                    <td className="p-2 text-center">
                      {new Date(t.family_changed_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                      })}
                    </td>

                    <td className="p-2 text-center">
                      <span className={t.member?.status === "Active"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"}>
                        {t.member?.status}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer mx-auto"
                        onClick={() =>
                          navigate(`/admin/familylist/familymemberslist/familymemberview/${t.member?._id}`)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



    </>
  )
}
