import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const AddPastorFamily = () => {
  const [nextMemberId, setNextMemberId] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");

  // Pastor data
  const [pastor, setPastor] = useState(null);

  // Form values
  const [name, setName] = useState("");
  const [tamilName, setTamilName] = useState("");
  const [relation, setRelation] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);

  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [gender, setGender] = useState("");
  const [aadhar, setAadhar] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [memberPhoto, setMemberPhoto] = useState(null);

  const [Response, setResponse] = useState({ status: null, message: "" });


  const [isTamilManuallyEdited, setIsTamilManuallyEdited] = useState(false);
  const tamilInputRef = useRef(null);
  const tamilInputWrapperRef = useRef(null);

  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [primaryContact, setPrimaryContact] = useState("");
  const [primaryContactError, setPrimaryContactError] = useState("");
  const [activeField, setActiveField] = useState(null);


  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});




  // Email Validator
  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  // Fetch Pastor Details
  useEffect(() => {
    axios
      .get(`${URL}/pastors/${id}`, { headers: { Authorization: token } })
      .then((res) => {
        setPastor(res.data.data);

        // fetch next family member ID
        return axios.get(`${URL}/pastors/next-member-id/${id}`, {
          headers: { Authorization: token }
        });
      })
      .then((res) => setNextMemberId(res.data.next_member_id))
      .catch((err) => console.log(err));
  }, [id]);

  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Backspace
    if (letter === "BACKSPACE") {
      if (start === end && start > 0) {
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




  const TamilKeyboardDropdown = ({ onSelect, onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
      "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண",
      "த", "ந", "ப", "ம", "ய", "ர",
      "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ",
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ];

    const highlightKeys = new Set([
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ]);

    return (
      <div
        className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-3"
        onClick={(e) => e.stopPropagation()}
      >

        <div
          className="
          flex 
          flex-wrap 
          justify-center 
          gap-1 
        "
          style={{
            height: "120px",
            alignContent: "space-between"
          }}
        >
          {keys.map((k) => {
            const isHighlight = highlightKeys.has(k);
            return (
              <button
                key={k}
                className={`px-2 py-1 rounded text-xs font-semibold
                ${isHighlight
                    ? "bg-indigo-400 hover:bg-indigo-500"
                    : "bg-blue-200 hover:bg-blue-300"}
              `}
                onClick={() => insertTamilAtCursor(k)}
              >
                {k}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between mt-3">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => insertTamilAtCursor("BACKSPACE")

            }

          >
            Backspace
          </button>

          <button
            className="bg-lavender--600 text-white px-3 py-1 rounded text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showTamilKeyboard) return;

      if (
        tamilInputWrapperRef.current &&
        !tamilInputWrapperRef.current.contains(e.target)
      ) {
        setShowTamilKeyboard(false);
        setActiveTamilField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTamilKeyboard]);

  const transliterateTamil = async (text) => {
    try {
      if (!text.trim()) {
        setTamilName("");
        return;
      }

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(
          text
        )}&itc=ta-t-i0-und&num=1`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setTamilName(tamil);
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



  // Age Auto Calculation
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

  // Contact numbers (split by comma)
  const handleContact = (value) => {
    setContactInput(value);

    const arr = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    setContactNumbers(arr);
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






  // SAVE FUNCTION
  const handleSave = async () => {

    if (saving) return;
    if (!name.trim()) {
      setResponse({ status: "Failed", message: "Enter member name" });
      return;
    }


    if (!primaryContact || primaryContact.length !== 10) {
      setPrimaryContactError("Primary contact number is required");
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
      fd.append("aadhar_number", aadhar);
      fd.append("email", email);
      fd.append("primary_contact", primaryContact);

      fd.append("contact_numbers", contactNumbers.join(","));
      if (memberPhoto) fd.append("member_photo", memberPhoto);

      const res = await axios.post(
        `${URL}/pastors/add-family-member/${id}`,
        fd,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResponse({ status: "Success", message: "Family Member Added!" });

      setTimeout(() => {
        navigate(`/admin/pastorlist/pastorfampreview/${id}`);
      }, 1500);
    }

    catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE DATA:", err.response?.data);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong";

      setResponse({ status: "Failed", message: backendMessage });

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }

    finally {
      setSaving(false);
    }
  };


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

    // remove error when fixed
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
      <span
        className={`absolute bottom-1 right-2 text-[10px]
      ${value.length > max ? "text-red-500" : "text-gray-400"}`}
      >
        {value.length}/{max}
      </span>
    );
  };


  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-500 ml-1">*</span>
    </label>
  );

  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        {/* Back Button */}
        <FaArrowLeft
          size={18}
          title="Back"
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-4"
        />



        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Add Pastor Family Member
        </h1>

        {/* Form */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">
            Personal Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

            <div>

              <RequiredLabel>Pastor ID</RequiredLabel>
              <input
                type="text"
                value={nextMemberId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>

              <RequiredLabel>Pastor Family ID</RequiredLabel>
              <input
                type="text"
                value={pastor?.pastor_family_id || ""}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Member Name */}
            <div className="relative">
              <RequiredLabel>Member Name</RequiredLabel>
              <input
                type="text"
                value={name}
                // onChange={(e) => setName(e.target.value)}
                // onChange={(e) => {
                //   setName(e.target.value);
                //   setIsTamilManuallyEdited(false); // 🔥 allow auto translate again
                // }}
                placeholder="Enter Name"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"


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
              {/* 🔢 Live Character Counter */}
              <CharCounter
                value={name}
                max={50}
                show={activeField === "name"}
              />

              {/* ❌ Error Message */}
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name}
                </p>
              )}

            </div>

            {/* Tamil Name */}
            <div ref={tamilInputWrapperRef} className="relative">
              <RequiredLabel>Member Tamil Name</RequiredLabel>
              <input
                ref={tamilInputRef}
                type="text"
                // onFocus={() => setShowTamilKeyboard(true)}
                value={tamilName}
                // onChange={(e) => setTamilName(e.target.value)}
                // onChange={(e) => {
                //   setTamilName(e.target.value);
                //   setIsTamilManuallyEdited(true); // 🛑 stop auto translate
                // }}
                placeholder="உறுப்பினர் பெயர்"

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
                    setIsTamilManuallyEdited(true); // stop auto translate
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
                <option value="">Select Gender</option>
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
                <option value="">Select Relation</option>

                {pastor?.gender === "Male" ? (
                  <>
                    <option value="Wife">Wife</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                ) : (
                  <>
                    <option value="Husband">Husband</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                )}
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
                maxLength={10}
                value={primaryContact}
                placeholder="Enter 10 digit mobile number"
                onFocus={() => setActiveField("primaryContact")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");

                  // 🔹 max length validation (10 digits)
                  if (!validateMaxLength("primaryContact", val, 10)) return;

                  setPrimaryContact(val);

                  // 🔹 exact length validation
                  if (val.length === 0) {
                    setPrimaryContactError("");
                  } else if (val.length !== 10) {
                    setPrimaryContactError("Mobile number must be exactly 10 digits");
                  } else {
                    setPrimaryContactError("");
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.primaryContact || primaryContactError
                    ? "border-red-500"
                    : "border-gray-300"
                  }`}
              />

              {/* 🔢 Reusable Character Counter */}
              <CharCounter
                value={primaryContact}
                max={10}
                show={activeField === "primaryContact"}
              />

              {/* 🔴 Max length error */}
              {errors.primaryContact && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.primaryContact}
                </p>
              )}

              {/* 🔴 Exact length error */}
              {primaryContactError && (
                <p className="text-xs text-red-500 mt-1">
                  {primaryContactError}
                </p>
              )}
            </div>




            {/* Contact */}
            <div className="relative">
              <label className="text-sm font-medium">
                Contact Numbers
              </label>

              <input
                type="text"
                value={contactInput}
                placeholder="Enter phone numbers (comma separated)"
                onFocus={() => setActiveField("contactNumbers")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9,]/g, "");

                  // ✅ Max length validation (60)
                  if (!validateMaxLength("contactNumbers", val, 60)) return;

                  setContactInput(val);

                  const arr = val
                    .split(",")
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);

                  setContactNumbers(arr);
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
              <label className="text-sm font-medium">Aadhar Number</label>
              <input
                type="text"
                value={aadhar}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                  v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setAadhar(v);
                }}
                placeholder="xxxx xxxx xxxx"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="text"
                value={email}
                placeholder="Enter Email"
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (!validateMaxLength("email", val, 60)) return;

                  setEmail(val);

                  if (val && !validateEmail(val)) {
                    setEmailError("Invalid Email");
                  } else {
                    setEmailError("");
                  }
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
      ${errors.email || emailError ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={email}
                max={60}
                show={activeField === "email"}
              />

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}

              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>


            {/* Photo */}
            <div>
              <label className="text-sm font-medium">Member Photo</label>
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
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Adding..." : "Add Pastor Family Member"}
          </button>

        </div>

        {/* Toasts */}
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































