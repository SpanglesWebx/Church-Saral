import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import BackButton from "../../Components/Button/BackButton";

export const FamilyMemberView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");

  const [member, setMember] = useState(null);


  const fetchMember = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/${id}`, {
        headers: { Authorization: token },
      });
      setMember(res.data.data);
    } catch (err) {
      console.error("Fetch Member Error:", err);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const shortTitle = (title) => {
    switch (title) {
      case "Mister": return "Mr";
      case "Miss": return "Ms";      // or return "Miss" if you prefer
      case "Master": return "Master";
      case "Mrs": return "Mrs";
      default: return title || "";
    }
  };

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
        return relation || "-";
    }
  };



  const hasTransferDetails =
    member?.old_member_id ||
    member?.old_member_type ||
    member?.old_family_id;




  const getMemberPhotoUrl = (photo) => {
    if (!photo) return "";
    return `${URL}/${photo}`;
  };




  if (!member) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>

      <BackButton />

      {member.status === "Active" && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate(`/admin/memberlist/editmember/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-lavender--600 font-semibold rounded-md"
          >
            <span>Edit</span>
            <CiEdit size={20} />
          </button>
        </div>
      )}



      <div className="flex justify-end mb-3">
        <div className="w-32 h-40 border rounded-md flex items-center justify-center overflow-hidden bg-gray-100">
          {member.photo ? (
            <img
              // src={`${URL}${member.photo}`}
              src={getMemberPhotoUrl(member.photo)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center px-2">
              No Photo Uploaded
            </span>
          )}

        </div>
      </div>

      {/* ✅ MEMBERSHIP DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Membership Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

          {/* Member ID */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member ID</span>
            <span className="text-gray-800">{member.member_id}</span>
          </div>

          {/* Member Type */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member Type</span>
            <span className="text-gray-800">{member.member_type}</span>
          </div>

          {/* Member Name */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member Name</span>
            <span className="text-gray-800">
              {(member.member_title ? shortTitle(member.member_title) + " " : "") +
                (member.member_name || "-")}
            </span>
          </div>

          {/* Member Tamil Name */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member Tamil Name</span>
            <span className="text-gray-800">
              {(member.member_tamil_title ? member.member_tamil_title + " " : "") +
                (member.member_tamil_name || "-")}
            </span>
          </div>



          {/* Head Status */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Head</span>
            <span className="text-gray-800">
              {member.isHead === "Yes" ? "Yes" : "No"}
            </span>
          </div>


          {/* Family ID (if HEAD) */}
          {member.isHead === "Yes" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Family ID</span>
              <span className="text-gray-800">{member.family_id}</span>
            </div>
          )}

          {/* Family Head ID (if NOT head) */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Family ID</span>
              <span className="text-gray-800">{member.family_id}</span>
            </div>
          )}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Head's Member Id</span>
              <span className="text-gray-800">{member.head_member_id}</span>
            </div>
          )}

          {/* Head Name – requires fetching family info */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Head's Name</span>
              <span className="text-gray-800">{member.head_name || "-"}</span>
            </div>
          )}

          {/* Relation */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Relation With Head</span>
              <span className="text-gray-800">{getDisplayRelation(member.relation_with_head)}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Membership From</span>
            <span className="text-gray-800">{member.membership_from
              ? moment(member.membership_from).format("DD/MM/YYYY")
              : "-"}</span>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Joining Date</span>
            <span className="text-gray-800">{member.joining_date
              ? moment(member.joining_date).format("DD/MM/YYYY")
              : "-"}</span>
          </div>




        </div>
      </div>


      {/* ✅ TRANSFER DETAILS */}
      {hasTransferDetails && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-3">
            Transfer Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

            {member?.old_family_id && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Old Family ID
                  </span>
                  <span className="text-gray-800">
                    {member.old_family_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Family Changed At
                  </span>
                  <span className="text-gray-800">
                    {member.family_changed_at
                      ? moment(member.family_changed_at).format(
                        "DD/MM/YYYY hh:mm:ss A"
                      )
                      : "-"}
                  </span>
                </div>
              </>
            )}

            {member?.old_member_id && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Old Member ID
                  </span>
                  <span className="text-gray-800">
                    {member.old_member_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Member ID Changed At
                  </span>
                  <span className="text-gray-800">
                    {member.old_member_id_changed_at
                      ? moment(member.old_member_id_changed_at).format(
                        "DD/MM/YYYY hh:mm:ss A"
                      )
                      : "-"}
                  </span>
                </div>
              </>
            )}

            {member?.old_member_type && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Old Member Type
                  </span>
                  <span className="text-gray-800">
                    {member.old_member_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <span className="text-md font-bold text-gray-600">
                    Member Type Changed At
                  </span>
                  <span className="text-gray-800">
                    {member.old_member_type_changed_at
                      ? moment(member.old_member_type_changed_at).format(
                        "DD/MM/YYYY hh:mm:ss A"
                      )
                      : "-"}
                  </span>
                </div>
              </>
            )}

          </div>
        </div>
      )}




      {/* ✅ PERSONAL DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Personal Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
          {[


            { label: "Father Name", value: member.father_name },
            { label: "Mother Name", value: member.mother_name },
            { label: "Gender", value: member.gender || "-" },
            {
              label: "Date of Birth",
              value: member.dob ? moment(member.dob).format("DD-MMM-YYYY") : "-",
            },
            { label: "Age", value: member.age ?? "-" },
            { label: "Place of Birth", value: member.place_of_birth || "-" },

            { label: "Primary Contact Number", value: member.primary_contact || "-" },
            {
              label: "Contact Numbers",
              value: Array.isArray(member.contact_numbers)
                ? member.contact_numbers.join(", ")
                : member.contact_numbers || "-"
            },
            { label: "Primary Email", value: member.primary_email || "-" },

            { label: "Email", value: member.email || "-" },
            { label: "Aadhar Number", value: member.aadhar_number || "-" },
            { label: "Blood Group", value: member.blood_group || "-" },

            { label: "Qualification", value: member.qualification || "-" },
            { label: "Occupation", value: member.occupation || "-" },

            {
              label: "Status",
              value: member.status,
              isStatus: true,
            },
            {
              label: "Membership Status",
              value: (
                <span
                  className={
                    member.membership_status === "Unhold"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {member.membership_status}
                </span>
              ),
              isRaw: true
            },

            ...(member.member_status === "Inactive"
              ? [{ label: "Inactive Reason", value: member.inactive_reason || "-" }]
              : [])
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>

              <span
                className={
                  item.isStatus
                    ? item.value === "Active"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                    : "text-gray-800"
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>



      {/* ✅ ADDRESS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Address</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Zone", value: member.zone || "-" },
            { label: "Area", value: member.area || "-" },
            { label: "Residential Address", value: member.present_address || "-" },
            { label: "Permanent Address", value: member.permanent_address || "-" },
            { label: "Official Address", value: member.official_address || "-" },
            { label: "Official Pincode", value: member.official_pincode || "-" },
            { label: "Residential Pincode", value: member.present_pincode || "-" },
            { label: "Permanent Pincode", value: member.permanent_pincode || "-" },


          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800 whitespace-pre-wrap">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SPIRITUAL INFORMATION */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Spiritual Information</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3 pb-8 border-b border-gray-400">
          {[
            { label: "Baptism Status", value: member.baptism || "-" },
            {
              label: "Baptism Date",
              value: member.baptism_date
                ? moment(member.baptism_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Baptized By", value: member.baptism_by || "-" },
            { label: "Baptized Church", value: member.baptism_church || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Confirmation Status", value: member.confirmation || "-" },
            {
              label: "Confirmation Date",
              value: member.confirmation_date
                ? moment(member.confirmation_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Confirmed By", value: member.confirmation_by || "-" },
            { label: "Confirmed Church", value: member.confirmation_church || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ MARITAL INFORMATION */}

      {(
        member.member_type === "Full Member" ||

        (
          member.member_type === "Non - Communical Member" &&
          [ "Husband", "Wife"].includes(
            member.relationship
          )
        )
      ) && (
          <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
            <h1 className="text-lg text-lavender--600 font-semibold mb-3">Marital Information</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">

              {/* Marital Status */}
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">
                  Marital Status
                </span>
                <span className="text-gray-800">
                  {member.marital_status || "-"}
                </span>
              </div>

              {/* Hide for Single */}
              {member.marital_status !== "Single" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-md font-bold text-gray-600">
                      Marriage Date
                    </span>
                    <span className="text-gray-800">
                      {member.marriage_date
                        ? moment(member.marriage_date).format("DD-MMM-YYYY")
                        : "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-md font-bold text-gray-600">
                      Marriage Place
                    </span>
                    <span className="text-gray-800">
                      {member.marriage_place || "-"}
                    </span>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
    </>
  );
};
