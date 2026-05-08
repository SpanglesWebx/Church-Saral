import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

export const EditPastor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
    const token = window.sessionStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [pastorPhoto, setPastorPhoto] = useState(null);

  // All fields same as AddPastor
  const [pastorId, setPastorId] = useState("");
  const [pastorFamilyId, setPastorFamilyId] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [pastorTamilName, setPastorTamilName] = useState("");
  const [title, setTitle] = useState("");
  const [tamilTitle, setTamilTitle] = useState("");
  const [pastorRole, setPastorRole] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);

  // NEW FIELDS
  const [status, setStatus] = useState("Active");
  const [leftDate, setLeftDate] = useState("");
  const [inactiveReason, setInactiveReason] = useState("");


  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [activeTamilField, setActiveTamilField] = useState(null);
  const tamilInputWrapperRef = useRef(null);
  const tamilInputRef = useRef(null);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [emailError, setEmailError] = useState("");

  const [primaryContact, setPrimaryContact] = useState("");
  const [primaryContactError, setPrimaryContactError] = useState("");


  // saving lock
  const [saving, setSaving] = useState(false);

  // validation helpers
  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);



  // ✔️ Function to calculate age
  const calculateAge = (date) => {
    const today = new Date();
    const birthDate = new Date(date);

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  const getTitle = (age, gender) => {
    if (!age || !gender) return "";

    const a = Number(age);

    if (gender === "Male") {
      return a < 13 ? "Master" : "Mister";
    }

    if (gender === "Female") {
      if (a < 13) return "Miss";
      return "Mrs";
    }

    return "";
  };

  useEffect(() => {
    setTitle(getTitle(age, gender));
  }, [age, gender]);

  const getTamilTitle = (title) => {
    switch (title) {
      case "Master": return "மாஸ்டர்";
      case "Mister": return "மிஸ்டர்";
      case "Miss": return "மிஸ்";
      case "Mrs": return "மிசஸ்";
      default: return "";
    }
  };

  useEffect(() => {
    setTamilTitle(getTamilTitle(title));
  }, [title]);

  const transliterateTamil = async (text) => {
    try {
      if (!text.trim()) {
        setPastorTamilName("");
        return;
      }

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setPastorTamilName(tamil);
      }
    } catch (err) {
      console.log("Tamil Transliteration Error:", err);
    }
  };

  useEffect(() => {
    transliterateTamil(pastorName);
  }, [pastorName]);

  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (letter === "BACKSPACE") {
      if (start === end && start > 0) {
        setPastorTamilName(
          pastorTamilName.slice(0, start - 1) + pastorTamilName.slice(end)
        );
        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();
        });
      }
      return;
    }

    const updated =
      pastorTamilName.slice(0, start) + letter + pastorTamilName.slice(end);

    setPastorTamilName(updated);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + letter.length;
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

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
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


  // Fetch pastor details
  useEffect(() => {
    const fetchPastor = async () => {
      try {
        const res = await axios.get(`${URL}/pastors/${id}`, {
          headers: { Authorization: token }
        });

        const p = res.data.data;

        setPastorId(p.pastor_id);
        setPastorFamilyId(p.pastor_family_id);
        setPastorName(p.pastor_name);
        setPastorTamilName(p.pastor_tamil_name);
        setTitle(p.title);
        setTamilTitle(p.tamil_title);
        setPastorRole(p.pastor_role);

        setContactNumbers(p.contact_numbers || []);
           setPrimaryContact(p.primary_contact || "");
        setContactInput((p.contact_numbers || []).join(","));

        setDob(p.dob);
        setAge(p.age);
        setGender(p.gender);
        setAadhar(p.aadhar_number);
        setJoiningDate(p.joining_date);
        setMarriageDate(p.marriage_date);
        setEmail(p.email);
        setAddress(p.residential_address);

        setStatus(p.status);
        setLeftDate(p.left_date || "");
        setInactiveReason(p.inactive_reason || "");

        setLoading(false);
      } catch (err) {
        console.log("Error loading pastor:", err);
      }
    };

    fetchPastor();
  }, [id]);

  const handleUpdate = async () => {
    if (saving) return;

    
    try {

      setSaving(true);
      const fd = new FormData();


      


      fd.append("pastor_name", pastorName);
      fd.append("pastor_tamil_name", pastorTamilName);
      fd.append("title", title);
      fd.append("tamil_title", tamilTitle);
      fd.append("pastor_role", pastorRole);
          fd.append("primary_contact", primaryContact);

      fd.append("contact_numbers", contactNumbers.join(","));
      fd.append("dob", dob);
      fd.append("age", age);
      fd.append("gender", gender);
      fd.append("aadhar_number", aadhar);
      fd.append("joining_date", joiningDate);
      fd.append("marriage_date", marriageDate);
      fd.append("email", email);
      fd.append("residential_address", address);

      fd.append("status", status);
      fd.append("left_date", status === "Inactive" ? leftDate : "");
      fd.append("inactive_reason", status === "Inactive" ? inactiveReason : "");

      if (pastorPhoto) {
        fd.append("pastor_photo", pastorPhoto);
      }

      await axios.put(`${URL}/pastors/update/${id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token
        }
      });

      // 🟢 SUCCESS TOAST
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Pastor updated successfully!",
        });
      }, 10);

      // Auto-hide & navigate after 3 sec
      setTimeout(() => {
        setResponse({ status: null, message: "" });
        navigate("/admin/pastorlist");
      }, 3000);

    } catch (err) {
      console.log("Update Error:", err);

      // 🔴 BACKEND ERROR TOAST (FULLY SAFE)
      const backendMessage =
        err.response?.data?.message ||          // API validation / multer
        err.response?.data?.error ||            // custom error
        err.message ||                          // axios error
        "Failed to update pastor";              // fallback


      // 🔴 ERROR TOAST
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: backendMessage,
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
    finally {
      // 🔓 ALWAYS UNLOCK SAVE
      setSaving(false);
    }
  };

  const validateMaxLength = (name, value, max = 50) => {
    if (value.length > max) {
      setErrors(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));

      setTimeout(() => {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 4000);

      return false;
    }

    setErrors(prev => {
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



  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <>

      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft size={18} className="cursor-pointer mb-4" onClick={() => navigate(-1)} />



        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Edit  Pastor
        </h1>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Personal Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>

              <RequiredLabel>Pastor ID</RequiredLabel>

              <input
                type="text"
                value={pastorId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>

              <RequiredLabel>Pastor Family ID</RequiredLabel>
              <input
                type="text"
                value={pastorFamilyId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            {/* <div>
             

              <RequiredLabel>Pastor Name</RequiredLabel>


              <div className="flex items-center mt-1 w-full">
                <span
                  className="border border-gray-300 bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md shadow-sm"
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {title}
                </span>

                <input
                  type="text"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  placeholder="Enter Pastor Name"
                  className="border border-gray-300 rounded-r-md shadow-sm sm:text-sm px-3 py-2"
                  style={{ width: "90%", height: "38px" }}
                />
              </div>
            </div> */}

            <div className="relative">
              <RequiredLabel>Pastor Name</RequiredLabel>

              <div className="flex items-center mt-1 w-full relative">
                {/* TITLE PREFIX */}
                <span
                  className={`border bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md shadow-sm
        ${errors.pastorName ? "border-red-500" : "border-gray-300"}`}
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {title}
                </span>

                {/* INPUT */}
                <input
                  type="text"
                  value={pastorName}
                  onFocus={() => setActiveField("pastorName")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateMaxLength("pastorName", val, 50)) {
                      setPastorName(val);
                    }
                  }}
                  placeholder="Enter Pastor Name"
                  className={`rounded-r-md shadow-sm sm:text-sm px-3 py-2 w-full border
        ${errors.pastorName ? "border-red-500" : "border-gray-300"}`}
                  style={{ height: "38px" }}
                />

                {/* CHARACTER COUNTER */}
                <CharCounter
                  value={pastorName}
                  max={50}
                  show={activeField === "pastorName"}
                />
              </div>

              {/* ERROR MESSAGE BELOW INPUT */}
              {errors.pastorName && (
                <p className="text-xs text-red-500 mt-1 ml-[10%]">
                  {errors.pastorName}
                </p>
              )}
            </div>


            {/* <div className="relative" ref={tamilInputWrapperRef}>

              <RequiredLabel>Pastor Tamil Name</RequiredLabel>
              <div className="flex items-center mt-1 w-full">
                <span
                  className="border border-gray-300 bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md shadow-sm"
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {tamilTitle}
                </span>

                <input
                  type="text"
                  ref={tamilInputRef}
                  value={pastorTamilName}
                  onChange={(e) => setPastorTamilName(e.target.value)}
                  onFocus={() => {
                    setActiveTamilField("pastorTamilName");
                    setShowTamilKeyboard(true);
                  }}
                  placeholder="பாஸ்டர் பெயர்"
                  className="border border-gray-300 rounded-r-md shadow-sm sm:text-sm px-3 py-2"
                  style={{ width: "90%", height: "38px" }}
                />
              </div>

              {showTamilKeyboard && (
                <TamilKeyboardDropdown onClose={() => setShowTamilKeyboard(false)} />
              )}
            </div> */}

            <div className="relative" ref={tamilInputWrapperRef}>
              <RequiredLabel>Pastor Tamil Name</RequiredLabel>

              <div className="flex items-center mt-1 w-full relative">
                <span
                  className={`border bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md shadow-sm
        ${errors.pastorTamilName ? "border-red-500" : "border-gray-300"}`}
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {tamilTitle}
                </span>

                <input
                  type="text"
                  ref={tamilInputRef}
                  value={pastorTamilName}
                  onFocus={() => {
                    setActiveTamilField("pastorTamilName");
                    setActiveField("pastorTamilName");
                    setShowTamilKeyboard(true);
                  }}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateMaxLength("pastorTamilName", val, 50)) {
                      setPastorTamilName(val);
                    }
                  }}
                  placeholder="பாஸ்டர் பெயர்"
                  className={`rounded-r-md shadow-sm sm:text-sm px-3 py-2 w-full border
        ${errors.pastorTamilName ? "border-red-500" : "border-gray-300"}`}
                  style={{ height: "38px" }}
                />

                {/* CHARACTER COUNTER */}
                <CharCounter
                  value={pastorTamilName}
                  max={50}
                  show={activeField === "pastorTamilName"}
                />
              </div>

              {/* ERROR MESSAGE BELOW INPUT */}
              {errors.pastorTamilName && (
                <p className="text-xs text-red-500 mt-1 ml-[10%]">
                  {errors.pastorTamilName}
                </p>
              )}

              {showTamilKeyboard && (
                <TamilKeyboardDropdown onClose={() => setShowTamilKeyboard(false)} />
              )}
            </div>


            <div>


              <RequiredLabel> Pastor Role</RequiredLabel>


              <select
                value={pastorRole}
                onChange={(e) => setPastorRole(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Pastor Role</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
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

                  setPrimaryContact(val);

                  if (val.length === 0) {
                    setPrimaryContactError("");
                    return;
                  }

                  if (val.length !== 10) {
                    setPrimaryContactError("Mobile number must be exactly 10 digits");
                  } else {
                    setPrimaryContactError("");
                  }
                }}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${primaryContactError ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Character counter */}
              {activeField === "primaryContact" && (
                <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                  {primaryContact.length}/10
                </span>
              )}

              {/* 🔴 Error */}
              {primaryContactError && (
                <p className="text-xs text-red-500 mt-1">
                  {primaryContactError}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>

              <input
                type="text"
                value={contactInput}

                onFocus={() => setActiveField("contactNumbers")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9,]/g, "");

                  if (!validateMaxLength("contactNumbers", val, 60)) return;


                  setContactInput(val);

                  // Keep empty values only for display, NOT for DB
                  const arr = val
                    .split(",")
                    .map(n => n.trim())
                    .filter(n => n.length > 0);

                  setContactNumbers(arr);
                }}

                placeholder="Enter Contact Number(s)"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"


                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.contactNumbers ? "border-red-500" : "border-gray-300"}`}
              />


              {/* 🔢 Character counter */}
              <CharCounter
                value={contactInput}
                max={60}
                show={activeField === "contactNumbers"}
              />

              {/* 🔴 Error text */}
              {errors.contactNumbers && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactNumbers}
                </p>
              )}


            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  const selected = e.target.value;
                  setDob(selected);

                  if (selected) {
                    setAge(calculateAge(selected));
                  } else {
                    setAge("");
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="text"
                readOnly
                value={age}
                placeholder='Enter date of birth'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>


              <RequiredLabel> Gender</RequiredLabel>


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
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
              <input
                type="text"
                value={aadhar}
                onChange={(e) => {
                  let val = e.target.value;

                  // Remove all non-digits
                  val = val.replace(/\D/g, "");

                  // Limit to 12 digits
                  val = val.slice(0, 12);

                  // Add spacing: XXXX XXXX XXXX
                  val = val.replace(/(\d{4})(?=\d)/g, "$1 ");

                  setAadhar(val);
                }}
                placeholder='xxxx xxxx xxxx'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
              <input
                type="date"
                value={marriageDate}
                onChange={(e) => setMarriageDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Email</label>

              <input
                type="text"
                value={email}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  // 🔢 length validation first
                  if (!validateMaxLength("email", val, 60)) return;

                  setEmail(val);

                  // ✅ existing email validation (same as Add Pastor)
                  if (val.trim() === "") {
                    setEmailError("Email is required");
                  } else if (!validateEmail(val)) {
                    setEmailError("Invalid email format");
                  } else {
                    setEmailError("");
                  }
                }}
                placeholder="Enter your Email Address"
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm px-3 py-2
      ${emailError || errors.email ? "border-red-500" : "border-gray-300"}`}
              />

              {/* 🔢 Character Counter */}
              <CharCounter
                value={email}
                max={60}
                show={activeField === "email"}
              />

              {/* 🔴 Length Error */}
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}

              {/* 🔴 Email Format Error */}
              {emailError && (
                <p className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pastor Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPastorPhoto(e.target.files[0])}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>


          </div>
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Address</h1>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Residential Address</label>
              <textarea
                rows={6}
                value={address}
                // onChange={(e) => setAddress(e.target.value)}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                placeholder='Enter You Address'



                onFocus={() => setActiveField("address")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("address", val, 250)) {
                    setAddress(val);
                  }
                }}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
      ${errors.address ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={address}
                max={250}
                show={activeField === "address"}
              />

              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

          {/* Status Section */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex gap-4 mt-1">
              <label>
                <input
                  type="radio"
                  checked={status === "Active"}
                  onChange={() => setStatus("Active")}
                />
                <span className="ml-2">Active</span>
              </label>

              <label>
                <input
                  type="radio"
                  checked={status === "Inactive"}
                  onChange={() => setStatus("Inactive")}
                />
                <span className="ml-2">Inactive</span>
              </label>
            </div>
          </div>

          {status === "Inactive" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Left Date</label>
                <input
                  type="date"
                  value={leftDate}
                  onChange={(e) => setLeftDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input
                  type="text"
                  value={inactiveReason}
                  onChange={(e) => setInactiveReason(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          )}



        </div>
        <div className="flex justify-end gap-3 mt-6">
     

          <button
            onClick={handleUpdate}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
  `}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Updating..." : "Update Pastor"}
          </button>

        </div>


      </div>
    </>
  );
};
