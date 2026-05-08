import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const EditPastorFamMem = () => {
  const navigate = useNavigate();
  const { pastorId, memberId } = useParams();
  const token = window.sessionStorage.getItem("token");

  const [member, setMember] = useState(null);
  const [pastor, setPastor] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [tamilName, setTamilName] = useState("");
  const [relation, setRelation] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [aadhar, setAadhar] = useState("");
  const [email, setEmail] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);
  const [memberPhoto, setMemberPhoto] = useState(null);

  const [Response, setResponse] = useState({ status: null, message: "" });

  const [isTamilManuallyEdited, setIsTamilManuallyEdited] = useState(true);
  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);

  const tamilInputRef = useRef(null);
  const tamilInputWrapperRef = useRef(null);

  const [primaryContact, setPrimaryContact] = useState("");
  const [primaryContactError, setPrimaryContactError] = useState("");
  const [activeField, setActiveField] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const transliterateTamil = async (text) => {
    try {
      if (!text.trim()) return;

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(
          text
        )}&itc=ta-t-i0-und&num=1`
      );

      if (res.data[0] === "SUCCESS") {
        setTamilName(res.data[1][0][1][0]);
      }
    } catch (err) {
      console.log("Tamil Transliteration Error:", err);
    }
  };

  useEffect(() => {
    if (!isTamilManuallyEdited) {
      transliterateTamil(name);
    }
  }, [name]);



  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (letter === "BACKSPACE") {
      if (start > 0) {
        const updated =
          tamilName.slice(0, start - 1) + tamilName.slice(end);
        setTamilName(updated);
        setIsTamilManuallyEdited(true);

        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();
        });
      }
      return;
    }

    const updated =
      tamilName.slice(0, start) + letter + tamilName.slice(end);

    setTamilName(updated);
    setIsTamilManuallyEdited(true);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd =
        start + letter.length;
      input.focus();
    });
  };


  const getCharacterCount = (text) => {
    return [...text].length;
  };

  const validateMaxLength = (field, value, max = 60) => {
    const charCount = [...value].length; // ✅ correct counting

    if (charCount > max) {
      setErrors(prev => ({
        ...prev,
        [field]: `Maximum ${max} characters allowed`
      }));

      return false;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });

    return true;
  };


  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-500 ml-1">*</span>
    </label>
  );





  const CharCounter = ({ value = "", max = 50, show }) => {
    if (!show) return null;

    const charCount = [...value].length;

    return (
      <span
        className={`absolute bottom-1 right-2 text-[10px]
      ${charCount > max ? "text-red-500" : "text-gray-400"}`}
      >
        {charCount}/{max}
      </span>
    );
  };


  const TamilKeyboardDropdown = ({ onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம",
      "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ",
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ];

    return (
      <div className="absolute z-50 w-full bg-white mt-1 border rounded-md shadow-lg p-3">
        <div className="flex flex-wrap gap-1 justify-center">
          {keys.map(k => (
            <button
              key={k}
              onClick={() => insertTamilAtCursor(k)}
              className="px-2 py-1 text-xs bg-blue-200 rounded"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-3">
          <button
            onClick={() => insertTamilAtCursor("BACKSPACE")}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Backspace
          </button>

          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        tamilInputWrapperRef.current &&
        !tamilInputWrapperRef.current.contains(e.target)
      ) {
        setShowTamilKeyboard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Auto Age Calculation
  const handleDob = (value) => {
    setDob(value);
    if (!value) return setAge("");

    const today = new Date();
    const birth = new Date(value);

    let years = today.getFullYear() - birth.getFullYear();
    const mdiff = today.getMonth() - birth.getMonth();

    if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }

    setAge(years);
  };

  // Fetch Member Data
  useEffect(() => {
    axios
      .get(`${URL}/pastors/${pastorId}`, { headers: { Authorization: token } })
      .then((res) => {
        setPastor(res.data.data);

        const found = res.data.data.family_members.find(
          (m) => m._id === memberId
        );

        if (!found) navigate(-1);

        setMember(found);

        // Prefill Fields
        setName(found.name);
        setTamilName(found.tamil_name);
        setRelation(found.relation);
        setGender(found.gender);
        setDob(found.dob);
        setAge(found.age);
        setAadhar(found.aadhar_number);
        setEmail(found.email);
        setContactInput(found.contact_numbers.join(", "));
        setContactNumbers(found.contact_numbers);
        setPrimaryContact(found.primary_contact || "");
      })
      .catch((err) => console.log(err));
  }, [pastorId, memberId]);

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


  // Update Handler
  const handleUpdate = async () => {
    if (saving) return;

    if (!name.trim()) {
      setResponse({ status: "Failed", message: "Name is required" });
      return;
    }

    if (!gender) {
      setResponse({ status: "Failed", message: "Gender is required" });
      return;
    }

    if (!relation) {
      setResponse({ status: "Failed", message: "Relationship is required" });
      return;
    }

    if (primaryContact && primaryContact.length !== 10) {
      setResponse({
        status: "Failed",
        message: "Primary contact must be 10 digits",
      });
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();

      fd.append("name", name);
      fd.append("tamil_name", tamilName);
      fd.append("relation", relation);
      fd.append("gender", gender);
      fd.append("dob", dob);
      fd.append("age", age);
      fd.append("email", email);
      fd.append("aadhar_number", aadhar);
      fd.append("contact_numbers", contactNumbers.join(","));
      fd.append("primary_contact", primaryContact);

      if (memberPhoto) fd.append("member_photo", memberPhoto);

      await axios.put(
        `${URL}/pastors/update-family-member/${pastorId}/${memberId}`,
        fd,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResponse({
        status: "Success",
        message: "Family Member Updated Successfully!",
      });

      setTimeout(() => {
        navigate(`/admin/pastorlist/viewpastorfammem/${pastorId}/${memberId}`);
      }, 1500);

    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update family member";

      setResponse({
        status: "Failed",
        message: backendMessage,
      });

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

    } finally {
      setSaving(false);
    }
  };


  if (!member) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>

      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title="Back"
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-4"
        />

        <h1 className="text-lg font-semibold"></h1>

        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Edit Pastor Family Member
        </h1>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-3">
            Personal Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Member Name */}
            <div className="relative">
              <RequiredLabel>Name</RequiredLabel>
              <input
                type="text"
                value={name}
          
                onFocus={() => setActiveField("name")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("name", val, 50)) {
                    setName(val);
                    setIsTamilManuallyEdited(false);
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />


              <CharCounter
                value={name}
                max={50}
                show={activeField === "name"}
              />

              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Tamil Name */}
            <div ref={tamilInputWrapperRef} className="relative">

              <RequiredLabel>Tamil Name</RequiredLabel>

              <input
                ref={tamilInputRef}
                type="text"
                value={tamilName}
                // onFocus={() => setShowTamilKeyboard(true)}
                // // onChange={(e) => setTamilName(e.target.value)}
                // onChange={(e) => {
                //   setTamilName(e.target.value);
                //   setIsTamilManuallyEdited(true);
                // }}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"




                onFocus={() => {
                  setShowTamilKeyboard(true);
                  setActiveField("tamilName");
                }}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("tamilName", val, 50)) {
                    setTamilName(val);
                    setIsTamilManuallyEdited(true);
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.tamilName ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Live Character Counter */}
              <CharCounter
                value={tamilName}
                max={50}
                show={activeField === "tamilName"}
              />

              {/* ❌ Error Message */}
              {errors.tamilName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.tamilName}
                </p>
              )}

              {showTamilKeyboard && (
                <TamilKeyboardDropdown
                  onClose={() => setShowTamilKeyboard(false)}
                />
              )}
            </div>

            {/* Gender */}
            <div>

              <RequiredLabel>Gender</RequiredLabel>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Relation */}
            <div>
              <RequiredLabel>Relationship</RequiredLabel>

              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option>Wife</option>
                <option>Husband</option>
                <option>Son</option>
                <option>Daughter</option>
              </select>
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => handleDob(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium">Age</label>
              <input
                type="text"
                value={age}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div className="relative">
              <RequiredLabel>Primary Contact Number</RequiredLabel>

              <input
                type="text"
                inputMode="numeric"
                value={primaryContact}
                placeholder="Enter 10 digit mobile number"
                onFocus={() => setActiveField("primaryContact")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");

                  if (validateMaxLength("primaryContact", val, 10)) {
                    setPrimaryContact(val);
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.primaryContact ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Character Counter */}
              <CharCounter
                value={primaryContact}
                max={10}
                show={activeField === "primaryContact"}
              />

              {/* ❌ Error Message */}
              {errors.primaryContact && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.primaryContact}
                </p>
              )}
            </div>




            {/* Contact Numbers */}
            <div className="relative">
              <label className="text-sm font-medium">Contact Numbers</label>

              <input
                type="text"
                value={contactInput}
                onFocus={() => setActiveField("contactNumbers")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("contactNumbers", val, 60)) {
                    setContactInput(val);
                    setContactNumbers(
                      val.split(",").map((n) => n.trim()).filter((n) => n)
                    );
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.contactNumbers ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Character Counter */}
              <CharCounter
                value={contactInput}
                max={60}
                show={activeField === "contactNumbers"}
              />

              {/* ❌ Error Message */}
              {errors.contactNumbers && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactNumbers}
                </p>
              )}
            </div>


            {/* Aadhar */}
            <div>
              <label className="text-sm font-medium">Aadhar</label>
              <input
                type="text"
                value={aadhar}
                onChange={(e) =>
                  setAadhar(
                    e.target.value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1 ")
                  )
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="text-sm font-medium">Email</label>

              <input
                type="text"
                value={email}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("email", val, 60)) {
                    setEmail(val);
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Character Counter */}
              <CharCounter
                value={email}
                max={60}
                show={activeField === "email"}
              />

              {/* ❌ Error Message */}
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>



            {/* Photo */}
            <div>
              <label className="text-sm font-medium">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMemberPhoto(e.target.files[0])}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end gap-3 mt-6">
    
          <button
            onClick={handleUpdate}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Updating..." : "Update Member"}
          </button>

        </div>

        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}


      </div>
    </>
  );
};
