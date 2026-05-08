
import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaHeading } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import SmallSizedModal from '../../Components/Expense/SmallSizedModal';
import { PiLetterCircleHBold } from 'react-icons/pi';

export const AddNewMember = () => {
  const navigate = useNavigate();
  const [isHead, setIsHead] = useState(true);
  const [familyId, setFamilyId] = useState("");
  const [headName, setHeadName] = useState("");
  const [relation, setRelation] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [aadharError, setAadharError] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [contactNumbers, setContactNumbers] = useState("");
  const [email, setEmail] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryEmailError, setPrimaryEmailError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [isDualMember, setIsDualMember] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [presentPincode, setPresentPincode] = useState("");
  const [permanentPincode, setPermanentPincode] = useState("");
  const [sameAddress, setSameAddress] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [zoneError, setZoneError] = useState("");
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [areaError, setAreaError] = useState("");
  const [baptism, setBaptism] = useState("");
  const [communion, setCommunion] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  // Personal Details
  const [memberId, setMemberId] = useState("VKDMBR");
  const [memberType, setMemberType] = useState("");
  const isPreparatory = memberType === "Preparatory/Unpaid Member";
  const [memberName, setMemberName] = useState("");
  const [memberTamilName, setMemberTamilName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");

  const [gender, setGender] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [qualification, setQualification] = useState("");
  const [occupation, setOccupation] = useState("");
  const [community, setCommunity] = useState("");
  const [nationality, setNationality] = useState("");

  // Dual Membership
  const [dualMemberId, setDualMemberId] = useState("");
  const [churchName, setChurchName] = useState("");


  const [saving, setSaving] = useState(false);
  // Spiritual Info
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismBy, setBaptismBy] = useState("");
  const [baptismChurch, setBaptismChurch] = useState("");

  const [communionDate, setCommunionDate] = useState("");
  const [communionBy, setCommunionBy] = useState("");

  const [confirmationDate, setConfirmationDate] = useState("");
  const [confirmationBy, setConfirmationBy] = useState("");
  const [confirmationChurch, setConfirmationChurch] = useState("");

  // Marital Info
  const [marriageDate, setMarriageDate] = useState("");
  const [marriagePlace, setMarriagePlace] = useState("");
  const [headIdSearch, setHeadIdSearch] = useState("");      // ⭐ ADD
  const [headDropdown, setHeadDropdown] = useState([]);      // ⭐ ADD

  const [headValidationMsg, setHeadValidationMsg] = useState("");
  const [headValidationType, setHeadValidationType] = useState("");
  const [title, setTitle] = useState("");
  const [tamilTitle, setTamilTitle] = useState("");

  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [activeTamilField, setActiveTamilField] = useState(null);

  // refs + state (add near other useState/useRef)
  const tamilInputWrapperRef = useRef(null);   // wrapper around the tamil input
  const tamilInputRef = useRef(null);          // actual input element
  // New fields
  const [addOfficialAddress, setAddOfficialAddress] = useState(false);
  const [membershipFrom, setMembershipFrom] = useState("");
  const [officialAddress, setOfficialAddress] = useState("");
  const [officialPincode, setOfficialPincode] = useState("");
  const [showHeadHint, setShowHeadHint] = useState(false);


  const [aadharNumber, setAadharNumber] = useState("");





  // const showHeadFields = ["Wife", "Son", "Daughter"].includes(relation);
  const showHeadFields = !isHead;
  const showFamilyId = true;

  const [showChildHeadError, setShowChildHeadError] = useState(false);


  const [isHeadLoading, setIsHeadLoading] = useState(false);
  const [headSelected, setHeadSelected] = useState(false);

  const isFullMember = memberType === "Full Member";
  const isNonCommunical = memberType === "Non - Communical Member";
  const [primaryContact, setPrimaryContact] = useState("");
  const [primaryContactError, setPrimaryContactError] = useState("");

  const [headLocked, setHeadLocked] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);






  const today = new Date().toISOString().split("T")[0];


  const relationGenderMap = {
    Husband: "Male",
    Son: "Male",
    Wife: "Female",
    Daughter: "Female",

  };

  const refs = {
    memberName: useRef(null),
    memberType: useRef(null),
    relation: useRef(null),
    gender: useRef(null),
  };




  // close when clicking outside (same UX as dropdown)  //Tamil keyboard function - onmousedown
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







  useEffect(() => {

    const fetchPreview = async () => {
      try {
        const res = await axios.get(
          `${URL}/new-members/preview-member-id`,
          {
            params: {
              member_type: memberType,
              relationship: relation,
              head_member_id: headIdSearch,
              is_head: isHead
            },
            headers: { Authorization: token }
          }
        );

        setMemberId(res.data.preview_id || "");
        setFamilyId(res.data.family_id || "");

      } catch (err) {
        console.log("Preview error", err);
      }
    };

    /* HEAD MEMBER → always generate */
    if (isHead && relation) {
      fetchPreview();
      return;
    }

    /* NON HEAD → require head */
    if (!isHead && headIdSearch) {
      fetchPreview();
    }

  }, [memberType, relation, headIdSearch, isHead]);


  useEffect(() => {
    setFamilyId("");
    setMemberId("");
    setHeadIdSearch("");
    setHeadName("");
  }, [isHead]);


  useEffect(() => {
    if (memberType === "Non - Communical Member") {
      setIsHead(false);
    }
  }, [memberType]);


  useEffect(() => {
    if (memberType === "Non - Communical Member") {
      setShowHeadHint(true);

      const timer = setTimeout(() => {
        setShowHeadHint(false);
      }, 2000); // hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [memberType]);

  useEffect(() => {
    if (relation === "Son" || relation === "Daughter") {

      setIsHead(false);

      // show temporary message
      setShowChildHeadError(true);

      const timer = setTimeout(() => {
        setShowChildHeadError(false);
      }, 3000); // hide after 3 seconds

      return () => clearTimeout(timer);
    }

  }, [relation]);

  const getTitle = (age, gender, maritalStatus) => {
    if (!age || !gender) return "";

    const a = Number(age);

    if (gender === "Male") {
      return a < 13 ? "Master" : "Mister";
    }

    if (gender === "Female") {
      if (a < 13) return "Miss";
      if (maritalStatus === "Married") return "Mrs";
      return "Miss";
    }

    return "";
  };
  useEffect(() => {
    const newTitle = getTitle(age, gender, maritalStatus);
    setTitle(newTitle);
  }, [age, gender, maritalStatus]);

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
        setMemberTamilName("");
        return;
      }

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setMemberTamilName(tamil);
      }
    } catch (error) {
      console.error("Tamil Transliteration Error:", error);
    }
  };

  useEffect(() => {
    transliterateTamil(memberName);
  }, [memberName]);

  const handleTamilKey = (val) => {
    if (activeTamilField === "memberTamilName") {
      if (val === "BACKSPACE") {
        setMemberTamilName((prev) => prev.slice(0, -1));
      } else {
        setMemberTamilName((prev) => prev + val);
      }
    }
  };



  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    // BACKSPACE handling
    if (letter === "BACKSPACE") {
      if (start === end && start > 0) {
        const newValue =
          memberTamilName.slice(0, start - 1) +
          memberTamilName.slice(end);

        setMemberTamilName(newValue);

        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();   // ⭐ Force focus again
        });
      }
      return;
    }

    // Insert letter
    const before = memberTamilName.slice(0, start);
    const after = memberTamilName.slice(end);
    const newValue = before + letter + after;

    setMemberTamilName(newValue);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + letter.length;
      input.focus();   // ⭐ Always keep input focused
    });
  };

  // ⭐ Fetch Next Auto-Increment Family ID
  const fetchNextFamilyId = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/next-family-id`, {
        headers: { Authorization: token }
      });
      return res.data.familyId;
    } catch (err) {
      console.error("Failed to fetch next Family ID", err);
      return "";
    }
  };



  const TamilKeyboardDropdown = ({ onSelect, onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
      "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண",
      "த", "ந", "ப", "ம", "ய", "ர",
      "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ", "ஜ",
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









  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // search by ID and Name 
  const debouncedHeadSearch = useRef(
    debounce(async (val) => {
      if (headLocked) return;

      // ✅ hide dropdown if input empty or only spaces
      if (!val || !val.trim()) {
        setHeadDropdown([]);
        return;
      }

      try {
        const res = await axios.get(
          `${URL}/new-members/search-head?query=${encodeURIComponent(val)}`,
          { headers: { Authorization: token } }
        );

        const data = res.data || [];

        if (data.length === 0) {
          setHeadDropdown([
            { member_id: "none", member_name: "No Head Found", isDisabled: true }
          ]);
        } else {
          setHeadDropdown(data);
        }

      } catch (err) {
        setHeadDropdown([
          { member_id: "none", member_name: "No Head Found", isDisabled: true }
        ]);
      }
    }, 300)
  ).current;




  const calculateAge = (selectedDob) => {
    const dobDate = new Date(selectedDob);
    const today = new Date();

    let calculatedAge = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();

    // Fix age if birthday hasn't come yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      calculatedAge--;
    }

    setAge(calculatedAge >= 0 ? calculatedAge : 0);
  };


  const handleAadharChange = (value) => {
    // Remove non-numeric characters
    let numeric = value.replace(/\D/g, "").slice(0, 12);

    // Format XXXX XXXX XXXX
    const formatted = numeric
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

    setAadharNumber(formatted);

    // Validation rules
    if (numeric.length === 0) {
      setAadharError(""); // hide error when empty
    } else if (numeric.length === 12) {
      setAadharError(""); // valid
    } else {
      setAadharError("Aadhar must be 12 digits");
    }
  };


  const handleContactChange = (e) => {
    let value = e.target.value;

    // Remove all characters except digits, commas, and spaces
    value = value.replace(/[^0-9, ]/g, "");

    // ❌ Remove spaces BEFORE comma
    value = value.replace(/ \,/g, ",");

    // ✅ Fix spacing AFTER comma → exactly one space
    value = value.replace(/,\s*/g, ", ");

    // ❌ Prevent leading space at start
    value = value.replace(/^\s+/, "");

    setContactNumbers(value);
  };



  const validateEmail = (value) => {
    // Remove spaces
    const cleaned = value.trim();

    // Email regex (strong + commonly used)
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (cleaned === "") {
      setEmail("");
      setEmailError("");
      return;
    }

    setEmail(cleaned);

    if (!pattern.test(cleaned)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };


  const validatePrimaryEmail = (value) => {
    const cleaned = value.trim();

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (cleaned === "") {
      setPrimaryEmail("");
      setPrimaryEmailError("");
      return;
    }

    setPrimaryEmail(cleaned);

    if (!pattern.test(cleaned)) {
      setPrimaryEmailError("Enter a valid primary email");
    } else {
      setPrimaryEmailError("");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setPhoto(null);
      setPhotoError("Only JPG, JPEG, and PNG formats are allowed.");
      return;
    }

    setPhoto(file);
    setPhotoError("");
  };

  const handleSameAddress = () => {
    if (!presentAddress && !presentPincode) return;

    const newValue = !sameAddress;
    setSameAddress(newValue);

    if (newValue) {
      setPermanentAddress(presentAddress);
      setPermanentPincode(presentPincode);
    } else {
      setPermanentAddress("");
      setPermanentPincode("");
    }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${URL}/zones/all`, {
        headers: { Authorization: token },
      });

      setZones(res.data);
    } catch (err) {
      console.error("Zones Fetch Error:", err);
      setZones([]);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSaveZone = async () => {
    if (!newZoneName.trim()) {
      // ❗ Validation toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Zone name is required",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/zones/add`,
        { zone: newZoneName },
        {
          headers: { Authorization: token },
        }
      );

      // 🟢 Success toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Zone added successfully",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Reset UI
      setNewZoneName("");
      setIsZoneModalOpen(false);

      fetchZones();

    } catch (err) {
      console.error("Add Zone Error:", err);

      // 🔴 Error toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Something went wrong",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const fetchAreas = async (zone) => {
    try {
      const res = await axios.get(
        `${URL}/zones/areas/${zone}`,
        { headers: { Authorization: token } }
      );
      setAreas(res.data);
    } catch (err) {
      console.error("Area Fetch Error:", err);
      setAreas([]);
    }
  };

  useEffect(() => {
    if (selectedZone) {
      fetchAreas(selectedZone);
    } else {
      setAreas([]);
    }
  }, [selectedZone]);

  const handleSaveArea = async () => {
    if (!selectedZone) {
      setAreaError("Please select a Zone first.");
      return;
    }

    if (!newAreaName.trim()) {
      setAreaError("Area name is required.");
      return;
    }

    try {
      await axios.post(
        `${URL}/zones/area/add`,
        { zone: selectedZone, area: newAreaName },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Area added successfully" });

      // Reset
      setNewAreaName("");
      setAreaError("");
      setIsAreaModalOpen(false);

      fetchAreas(selectedZone);

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error adding area",
      });
    }

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // Auto ID Generate
  // const handleMemberIdChange = (e) => {
  //   let value = e.target.value.toUpperCase();

  //   if (!value.startsWith("MBR")) value = "MBR";

  //   let suffix = value.slice(3).replace(/[^0-9]/g, "");

  //   const newId = "MBR" + suffix;
  //   setMemberId(newId);

  //   // Auto-update family ID if this member is husband


  // };







  const showMarriageField =
    memberType === "Non - Communical Member" &&
    (relation === "Husband" || relation === "Wife");

  useEffect(() => {
    if (
      memberType === "Non - Communical Member" &&
      (relation === "Husband" || relation === "Wife")
    ) {
      setMaritalStatus("Married");
    }
  }, [memberType, relation]);



  const validateRequiredFields = () => {
    const newErrors = {};

    if (!memberType) newErrors.memberType = "Member Type is required";
    if (!relation) newErrors.relation = "Relationship is required";
    if (!memberName) newErrors.memberName = "Member Name is required";
    if (!gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);

    // 🔥 Scroll to first error
    const firstKey = Object.keys(newErrors)[0];
    if (firstKey && refs[firstKey]?.current) {
      refs[firstKey].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      refs[firstKey].current.focus();
    }

    return Object.keys(newErrors).length === 0;
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


    // ✅ DOB compulsory for Son / Daughter
    if (
      (relation === "Son" || relation === "Daughter") &&
      !dob
    ) {
      setResponse({
        status: "Failed",
        message: `Date of Birth is required for ${relation}`,
      });

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return;
    }

    
    if (!validateRequiredFields()) return;
    if (saving) return;
    try {
      setSaving(true);
      /* =========================
         🔐 FRONTEND VALIDATION
      ========================== */
      if (!memberName) throw new Error("Member Name is required");
      if (!familyId) throw new Error("Family Id is required");
      if (!memberType) throw new Error("Member Type is required");
      if (!relation) throw new Error("Relationship is required");
      if (!memberName) throw new Error("Member Name is required");
      if (!gender) throw new Error("Gender is required");

      if (relation !== "Husband" && !familyId) {
        throw new Error("Family ID is required");
      }

      /* =========================
         📦 FORM DATA
      ========================== */
      const formData = new FormData();

      if (photo) formData.append("photo", photo);



      const payload = {
        member_type: memberType,
        relationship: relation,
        is_head: isHead,
        ...(!isHead && { family_id: familyId }),

        // 🔑 REQUIRED
        member_name: memberName,
        gender,                          // ❗ REQUIRED
        marital_status: maritalStatus || "",

        // 🔑 OPTIONAL BUT IN SCHEMA
        member_title: title || "",
        member_tamil_name: memberTamilName || "",
        member_tamil_title: tamilTitle || "",
        father_name: fatherName || "",
        mother_name: motherName || "",

        dob: dob || "",
        age: age || 0,
        place_of_birth: placeOfBirth || "",



        aadhar_number: aadharNumber || "",
        blood_group: bloodGroup || "",
        joining_date: joiningDate || "",
        email: email || "",
        primary_email: primaryEmail || "",
        qualification: qualification || "",
        occupation: occupation || "",
        community: community || "",
        nationality: nationality || "",
        contact_numbers: contactNumbers || [],

        primary_contact: primaryContact || "",


        present_address: presentAddress || "",
        permanent_address: permanentAddress || "",
        present_pincode: presentPincode || "",
        permanent_pincode: permanentPincode || "",
        zone: selectedZone || "",
        area: selectedArea || "",

        membership_from: membershipFrom || "",
        official_address: officialAddress || "",
        official_pincode: officialPincode || "",

        baptism: baptism || "",
        baptism_date: baptismDate || "",
        baptism_by: baptismBy || "",
        baptism_church: baptismChurch || "",

        confirmation: confirmation || "",
        confirmation_date: confirmationDate || "",
        confirmation_by: confirmationBy || "",
        confirmation_church: confirmationChurch || "",

        marriage_date: marriageDate || "",
        marriage_place: marriagePlace || "",
      };


      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });

      /* =========================
         🚀 API CALL (FIXED)
      ========================== */
      const res = await axios.post(
        `${URL}/new-members/add`,
        formData,
        { headers: { Authorization: token } }
      );

      // ✅ SAFE ACCESS
      setMemberId(res.data.data.member_id);
      setFamilyId(res.data.data.family_id);

      setResponse({
        status: "Success",
        message: "Member Added Successfully!",
      });

      setTimeout(() => navigate("/admin/memberlist"), 600);

    } catch (err) {
      console.error("❌ SAVE ERROR:", err);

      setResponse({
        status: "Failed",
        message:
          err.response?.data?.message ||
          err.message ||
          "Error saving member",
      });
    }
    finally {
      setSaving(false);
    }
  };



  // ⭐ Fetch full family members for parent auto-fill
  const fetchFamilyMembers = async (famId) => {
    try {
      const res = await axios.get(`${URL}/family/${famId}`, {
        headers: { Authorization: token }
      });
      return res.data; // contains members array + head info
    } catch (err) {
      console.log("Family fetch error:", err);
      return null;
    }
  };



  const handleSelectHead = async (m) => {

    if (!m?.family_id) {
      setHeadValidationMsg("Invalid Family Head");
      setHeadValidationType("error");
      return;
    }

    setHeadLocked(true);
    setHeadSelected(true);
    setHeadDropdown([]);
    setIsHeadLoading(true);

    /* =========================
       BASIC HEAD INFO
    ========================== */

    setHeadIdSearch(m.member_id);
    setFamilyId(m.family_id);
    setHeadName(m.member_name);

    setHeadValidationMsg("Family Head verified successfully");
    setHeadValidationType("success");

    /* =========================
       FETCH FAMILY DATA
    ========================== */

    const family = await fetchFamilyMembers(m.family_id);

    if (!family) {
      setIsHeadLoading(false);
      return;
    }

    /* =========================
       FIND HEAD MEMBER OBJECT
    ========================== */

    const headMember =
      family.members.find(
        mem => mem.member_id === family.head_member_id
      ) || family.members[0];

    /* =========================
       ADDRESS AUTO FILL
    ========================== */

    setPresentAddress(headMember.present_address || "");
    setPermanentAddress(headMember.permanent_address || "");
    setPresentPincode(headMember.present_pincode || "");
    setPermanentPincode(headMember.permanent_pincode || "");

    setOfficialAddress(headMember.official_address || "");
    setOfficialPincode(headMember.official_pincode || "");

    /* =========================
       CONTACT AUTO FILL
    ========================== */

    if (Array.isArray(headMember.contact_numbers)) {
      setContactNumbers(headMember.contact_numbers.join(", "));
    } else {
      setContactNumbers("");
    }

    setPrimaryContact(headMember.primary_contact || "");

    /* =========================
       RELATION RULES
    ========================== */

    if (relation === "Husband") {

      setFatherName("");
      setMotherName("");

      setMaritalStatus("Married");

      setMarriageDate(headMember.marriage_date || "");
      setMarriagePlace(headMember.marriage_place || "");

    }

    if (relation === "Wife") {

      setFatherName("");
      setMotherName("");

      setMaritalStatus("Married");

      setMarriageDate(headMember.marriage_date || "");
      setMarriagePlace(headMember.marriage_place || "");

    }

    if (relation === "Son" || relation === "Daughter") {

      const father =
        family.members.find(m => m.relationship === "Husband") ||
        family.members.find(m => m.is_head && m.gender === "Male");

      const mother =
        family.members.find(m => m.relationship === "Wife") ||
        family.members.find(m => m.is_head && m.gender === "Female");

      setFatherName(father?.member_name || "");
      setMotherName(mother?.member_name || "");

      setMaritalStatus("");
      setMarriageDate("");
      setMarriagePlace("");
    }

    setIsHeadLoading(false);
  };


  useEffect(() => {

    if (!isHead) return;

    if (relation === "Husband") {
      setMaritalStatus("Married");
      setFatherName("");
      setMotherName("");
    }

    if (relation === "Wife") {
      setMaritalStatus("Married");
      setFatherName("");
      setMotherName("");
      setMarriageDate("");
      setMarriagePlace("");
    }

    if (relation === "Son") {
      setFatherName("");
      setMotherName("");
      setMaritalStatus("");
    }

    if (relation === "Daughter") {
      setFatherName("");
      setMotherName("");
      setMaritalStatus("");
    }

  }, [relation, isHead]);

  useEffect(() => {

    if (!relation) return;

    const map = {
      Husband: "Male",
      Wife: "Female",
      Son: "Male",
      Daughter: "Female"
    };

    setGender(map[relation] || "");

  }, [relation]);


  useEffect(() => {
    if (!headIdSearch) {
      setHeadSelected(false);
    }
  }, [headIdSearch]);





  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-500 ml-1">*</span>
    </label>
  );



  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title='Back'
          onClick={() => navigate("/admin/memberlist")}
          className="cursor-pointer mb-4"
        />



        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Add Member
        </h1>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Membership Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>

              <RequiredLabel>Member ID</RequiredLabel>
              <input
                type="text"
                value={memberId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>


              <RequiredLabel> Member Type</RequiredLabel>



              <select
                ref={refs.memberType}
                value={memberType}
                required
                onChange={(e) => {
                  const type = e.target.value;
                  setMemberType(type);
                  setErrors((prev) => ({ ...prev, memberType: null }));

                  if (type === "Full Member") {
                    setMembershipFrom(today);
                    setJoiningDate(today);
                  }

                  if (type === "Non - Communical Member") {
                    setMembershipFrom("");
                    setJoiningDate(today);
                  }

                  // hard rule
                  if (type === "Non - Communical Member" && relation === "Husband") {
                    setRelation("");
                  }
                }}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.memberType ? "border-red-500" : "border-gray-300"}`}
              >

                <option value="">Select Member Type</option>
                <option value="Full Member">Full Member</option>
                <option value="Non - Communical Member">Non - Communical Member</option>
              </select>

              {errors.memberType && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.memberType}
                </p>
              )}

            </div>



            <div>


              <RequiredLabel>Member Name</RequiredLabel>

              <div className="mt-1 w-full  relative">
                {/* INPUT ROW */}
                <div className="flex items-center w-full">
                  {/* 10% Title */}
                  <span
                    className={`border bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md shadow-sm
        ${errors.memberName ? "border-red-500" : "border-gray-300"}`}
                    style={{ width: "10%", minWidth: "60px", height: "38px" }}
                  >
                    {title}
                  </span>

                  {/* 90% Editable Name */}
                  <input

                    ref={refs.memberName}
                    type="text"
                    value={memberName}
                    onFocus={() => setActiveField("memberName")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("memberName", val)) {
                        setMemberName(val);
                      }

                      // setErrors((prev) => ({ ...prev, memberName: null }));
                    }}



                    className={`rounded-r-md shadow-sm sm:text-sm px-3 py-2 w-full
        ${errors.memberName ? "border-red-500" : "border-gray-300"}
        border`}



                    placeholder="Enter Member Name"
                    style={{ height: "38px" }}
                  />

                  <CharCounter
                    value={memberName}
                    max={50}
                    show={activeField === "memberName"}
                  />

                </div>

                {/* ERROR MESSAGE (BELOW INPUT) */}
                {errors.memberName && (
                  <p className="text-xs text-red-500 mt-1 ml-[10%]">
                    {errors.memberName}
                  </p>
                )}
              </div>



            </div>




            <div className="relative" ref={tamilInputWrapperRef}>
              <label className="block text-sm font-medium text-gray-700">
                Member Tamil Name
              </label>




              <div className="flex items-center mt-1 w-full relative">

                <span
                  className={`border bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md
        ${errors.memberTamilName ? "border-red-500" : "border-gray-300"}`}
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {tamilTitle}
                </span>

                <input
                  type="text"
                  ref={tamilInputRef}
                  className="border border-gray-300 rounded-r-md shadow-sm sm:text-sm px-3 py-2"
                  style={{ width: "90%", height: "38px" }}
                  value={memberTamilName}




                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateMaxLength("memberTamilName", val, 50)) {
                      setMemberTamilName(val);
                    }
                  }}
                  onFocus={() => {
                    setActiveTamilField("memberTamilName");
                    setActiveField("memberTamilName");
                    setShowTamilKeyboard(true);
                  }}

                  onBlur={() => setActiveField(null)}
                  placeholder="உறுப்பினர் பெயரை உள்ளிடவும்"
                />
              </div>

              {/* 🔴 Error below input */}
              {errors.memberTamilName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.memberTamilName}
                </p>
              )}

              <CharCounter
                value={memberTamilName}
                max={50}
                show={activeField === "memberTamilName"}
              />


              {showTamilKeyboard && (
                <TamilKeyboardDropdown
                  onSelect={handleTamilKey}
                  onClose={() => setShowTamilKeyboard(false)}
                />
              )}
            </div>



            {/* IS HEAD TOGGLE */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is Head <span className="text-red-500">*</span>
              </label>

              {/* <div className="flex justify-center"> */}
              {/* <div className={`flex justify-center ${isNonCommunical ? "opacity-50 cursor-not-allowed" : ""}`}> */}
              <div
                className={`flex justify-center 
  ${relation === "Son" || relation === "Daughter"
                    ? "opacity-50 cursor-not-allowed"
                    : ""}
  `}
              >
                <div className="relative flex bg-gray-200 rounded-full p-1 w-[280px]">

                  {/* Sliding background */}
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 4px)",
                      transform: isHead ? "translateX(0)" : "translateX(100%)",
                    }}
                  />

                  {/* YES */}
                  <button
                    type="button"
                    // onClick={() => setIsHead(true)}
                    // onClick={() => {
                    //   if (relation === "Son" || relation === "Daughter") return;
                    //   if (!isNonCommunical) setIsHead(true);
                    // }}


                    onClick={() => {
                      if (relation === "Son" || relation === "Daughter") return;

                      // if (isNonCommunical) {
                      //   setShowHeadHint(true);

                      //   setTimeout(() => {
                      //     setShowHeadHint(false);
                      //   }, 3000);

                      //   return;
                      // }

                      setIsHead(true);
                    }}
                    className={`relative flex-1 text-center py-1.5 rounded-full text-sm font-medium
        ${isHead ? "text-white" : "text-gray-700"}`}
                  >
                    Yes
                  </button>

                  {/* NO */}
                  <button
                    type="button"
                    // onClick={() => setIsHead(false)}
                    onClick={() => {
                      setIsHead(false);
                    }}
                    className={`relative flex-1 text-center py-1.5 rounded-full text-sm font-medium
        ${!isHead ? "text-white" : "text-gray-700"}`}
                  >
                    No
                  </button>

                </div>


              </div>



              {showChildHeadError && (
                <p className="text-xs text-orange-500 animate-pulse mt-1">
                  Son and Daughter cannot be family head
                </p>
              )}
            </div>


            {/* ================= RELATIONSHIP ROW ================= */}
            <div>

              <RequiredLabel>Relationship</RequiredLabel>



              <select
                ref={refs.relation}
                value={relation}
                required
                disabled={!memberType}
                onChange={(e) => {
                  const rel = e.target.value;
                  setRelation(rel);
                  setErrors((prev) => ({ ...prev, relation: null }));


                  // reset family/head related state
                  setFamilyId("");
                  setHeadIdSearch("");
                  setHeadName("");
                  setHeadDropdown([]);

                  setHeadValidationMsg("");
                  setHeadValidationType("");

                  setContactNumbers("");
                  setPresentAddress("");
                  setPermanentAddress("");
                  setPresentPincode("");
                  setPermanentPincode("");
                  // setMaritalStatus("");


                  if (
                    memberType === "Non - Communical Member" &&
                    (rel === "Husband" || rel === "Wife")
                  ) {
                    setMaritalStatus("Married");
                  } else {
                    setMaritalStatus("");
                  }


                  if (relationGenderMap[rel]) {
                    setGender(relationGenderMap[rel]);
                  }
                }}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.relation ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Relation</option>
                {/* FULL MEMBER ONLY */}


                {/* FULL MEMBER ONLY */}
                {memberType === "Full Member" && (
                  <>
                    <option value="Husband">Father</option>
                    <option value="Wife">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                )}

                {/* NON-COMMUNICAL ONLY */}
                {/* {memberType === "Non - Communical Member" && (
                  <>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                )} */}


                {memberType === "Non - Communical Member" && (
                  <>
                    <option value="Husband">Father</option>
                    <option value="Wife">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                )}


              </select>

              {errors.relation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.relation}
                </p>
              )}

              {/* {!memberType && (
                <p className="text-xs text-red-500 mt-1">
                  Please select Member Type first
                </p>
              )} */}

            </div>

            {/* ================= RIGHT SIDE OF ROW 1 ================= */}
            {isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Family ID
                </label>
                <input
                  type="text"
                  value={familyId}
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}

            {showHeadFields && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Head's Member Id or Name
                </label>

                <input
                  type="text"
                  placeholder="Enter Family Head ID or Name"
                  value={headIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;

                    setHeadIdSearch(val);

                    // 🔓 If user clears input → unlock selection
                    if (!val) {
                      setHeadLocked(false);
                      setHeadSelected(false);
                      setHeadDropdown([]);
                      setHeadName("");
                      setFamilyId("");

                      setFatherName("");
                      setMotherName("");

                      setHeadValidationMsg("");
                      setHeadValidationType("");

                      // reset auto-filled fields

                      // ✅ marriage auto-fill
                      setMaritalStatus("");
                      setMarriageDate("");
                      setMarriagePlace("");
                      setContactNumbers("");
                      setPrimaryContact("");
                      setPresentAddress("");
                      setPermanentAddress("");
                      setPresentPincode("");
                      setPermanentPincode("");
                      // setMaritalStatus("");

                      if (!(memberType === "Non - Communical Member")) {
                        setMaritalStatus("");
                      }

                      return;
                    }

                    // typing new value → allow debounce again
                    if (headLocked) return;
                    setHeadSelected(false);

                    setHeadValidationMsg("");
                    setHeadValidationType("");
                    setHeadName("");

                    setContactNumbers("");
                    setPresentAddress("");
                    setPermanentAddress("");
                    setPresentPincode("");
                    setPermanentPincode("");
                    setPrimaryContact("");

                    debouncedHeadSearch(val);
                  }}

                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />

                {headValidationMsg && (
                  <small
                    className={`mt-1 block text-xs ${headValidationType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {headValidationMsg}
                  </small>
                )}

                {/* Dropdown */}
                {headDropdown.length > 0 && headIdSearch.trim() !== "" && (
                  <ul className="absolute z-[9999] w-full bg-white mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {headDropdown.map((m) => (
                      <li
                        key={m.member_id}
                        onMouseDown={(e) => {
                          if (m.isDisabled) return;
                          e.preventDefault();
                          handleSelectHead(m);
                        }}

                        className={`px-3 py-2 flex text-sm 
      ${m.isDisabled
                            ? "text-gray-400 cursor-default"
                            : "cursor-pointer hover:bg-indigo-50"
                          }`}
                      >
                        <span className="w-[140px] font-medium flex items-center">
                          {m.member_id}
                          <span className="ml-1 text-green-600">
                            <PiLetterCircleHBold size={20} />
                          </span>
                        </span>
                        <span className="ml-4 text-gray-800">{m.member_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ================= SECOND ROW (ONLY FOR WIFE / CHILD) ================= */}
            {showHeadFields && (
              <>
                <div>

                  <RequiredLabel> Family ID</RequiredLabel>
                  <input
                    type="text"
                    value={familyId}
                    readOnly
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Head's Name
                  </label>
                  <input
                    type="text"
                    value={headName}
                    readOnly
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </>
            )}



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-full">

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Membership From
                </label>


                <input
                  type="date"
                  value={membershipFrom}
                  readOnly
                  className="block w-full mt-1  cursor-not-allowed  rounded-md shadow-sm sm:text-sm"
                />
              </div>




              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  readOnly
                  className="block w-full mt-1  cursor-not-allowed  rounded-md shadow-sm sm:text-sm"
                />
              </div>

            </div>

          </div>
        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Personal Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">




            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Father Name</label>
              <input
                type="text"
                value={fatherName}
                // onChange={(e) => setFatherName(e.target.value)}

                onFocus={() => setActiveField("fatherName")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("fatherName", val)) {
                    setFatherName(val);
                  }
                }}
                placeholder="Enter Father Name"

                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.fatherName ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={fatherName}
                max={50}
                show={activeField === "fatherName"}
              />

              {errors.fatherName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fatherName}
                </p>
              )}
            </div>

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Mother Name</label>
              <input
                type="text"
                value={motherName}
                onFocus={() => setActiveField("motherName")}
                onBlur={() => setActiveField(null)}

                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("motherName", val)) {
                    setMotherName(val);
                  }
                }}
                placeholder="Enter Mother Name"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.motherName ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={motherName}
                max={50}
                show={activeField === "motherName"}
              />

              {errors.motherName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.motherName}
                </p>
              )}
            </div>

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">
                Primary Contact Number

              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                value={primaryContact}
                onFocus={() => setActiveField("primaryContact")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");

                  setPrimaryContact(val);

                  if (val.length === 0) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.primaryContact;
                      return copy;
                    });
                    return;
                  }

                  if (val.length !== 10) {
                    setErrors((prev) => ({
                      ...prev,
                      primaryContact: "Mobile number must be exactly 10 digits",
                    }));

                    setTimeout(() => {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.primaryContact;
                        return copy;
                      });
                    }, 4000);
                  } else {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.primaryContact;
                      return copy;
                    });
                  }
                }}

                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.primaryContact ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={primaryContact}
                max={10}
                show={activeField === "primaryContact"}
              />


              {/* {errors.primaryContact && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.primaryContact}
                </p>
              )} */}
            </div>



            {/* 
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Numbers</label>
              <input
                type="text"
                value={contactNumbers}
                onChange={handleContactChange}
                
                placeholder='Enter Contact Numbers'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div> */}

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">
                Contact Numbers

              </label>

              <input
                type="text"
                value={contactNumbers}
                onFocus={() => setActiveField("contactNumbers")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("contactNumbers", val, 60)) {
                    handleContactChange(e);
                  }
                }}
                placeholder="Enter Contact Numbers"
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.contactNumbers ? "border-red-500" : "border-gray-300"}`}
              />
              <CharCounter
                value={contactNumbers}
                max={60}
                show={activeField === "contactNumbers"}
              />


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
                  const value = e.target.value;
                  setDob(value);
                  calculateAge(value);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="text"
                placeholder='Select Date of Birth'
                value={age}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>

              <RequiredLabel>Gender</RequiredLabel>
              <select
                ref={refs.gender}
                value={gender}
                // onChange={(e) => setGender(e.target.value)}
                onChange={(e) => {
                  setGender(e.target.value);
                  setErrors((prev) => ({ ...prev, gender: null }));
                }}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.gender}
                </p>
              )}

            </div>

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
              <input
                type="text"
                value={placeOfBirth}
                // onChange={(e) => setPlaceOfBirth(e.target.value)}
                onFocus={() => setActiveField("placeOfBirth")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("placeOfBirth", val, 50)) {
                    setPlaceOfBirth(val);
                  }
                }}
                placeholder='Enter Place'
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.placeOfBirth ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={placeOfBirth}
                max={50}
                show={activeField === "placeOfBirth"}
              />

              {errors.placeOfBirth && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.placeOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select

                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>

                <option value="A1+">A1+</option>
                <option value="A1-">A1-</option>
                <option value="A1B+">A1B+</option>
                <option value="AB1+">AB1+</option>
                <option value="AB1-">AB1-</option>
                <option value="AB2+">AB2+</option>
                <option value="AB2-">AB2-</option>
                <option value="A2B+">A2B+</option>
                <option value="A2B-">A2B-</option>
              </select>
            </div>

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
              <input
                type="text"
                value={aadharNumber}
                placeholder="XXXX XXXX XXXX"
                onChange={(e) => handleAadharChange(e.target.value)}

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm ${aadharError ? "border-red-500" : ""
                  }`}
              />

              {aadharError && (
                <p className="text-red-500 text-xs mt-1">{aadharError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Email
              </label>

              <input
                type="text"
                value={primaryEmail}
                onChange={(e) => validatePrimaryEmail(e.target.value)}
                placeholder="Enter Primary Email"
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
      ${primaryEmailError ? "border-red-500" : "border-gray-300"}`}
              />

              {primaryEmailError && (
                <p className="text-red-500 text-xs mt-1">{primaryEmailError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>



            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input
                type="text"
                value={qualification}
                // onChange={(e) => setQualification(e.target.value)}

                onFocus={() => setActiveField("qualification")}
                onBlur={() => setActiveField(null)}

                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("qualification", val, 50)) {
                    setQualification(val);
                  }
                }}
                placeholder='Enter Qualification'
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm   ${errors.qualification ? "border-red-500" : "border-gray-300"}`}

              />

              <CharCounter
                value={qualification}
                max={50}
                show={activeField === "qualification"}
              />

              {errors.qualification && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.qualification}
                </p>
              )}
            </div>
            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                value={occupation}
                // onChange={(e) => setOccupation(e.target.value)}
                onFocus={() => setActiveField("occupation")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("occupation", val, 50)) {
                    setOccupation(val);
                  }
                }}
                placeholder='Enter Profession'


                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm   ${errors.occupation ? "border-red-500" : "border-gray-300"}`}
              />
              <CharCounter
                value={occupation}
                max={50}
                show={activeField === "occupation"}
              />

              {errors.occupation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.occupation}
                </p>
              )}
            </div>







            <div>
              <label className="block text-sm font-medium text-gray-700">Member Photo</label>
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                onChange={handlePhotoUpload}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

              {photoError && (
                <p className="text-red-500 text-xs mt-1">{photoError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg text-lavender--600 font-semibold">Address</h1>
            <div className='flex items-center gap-3'>

              <button
                type="button"
                disabled={!presentAddress}
                onClick={() => handleSameAddress()}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
    ${sameAddress
                    ? "bg-lavender--600 text-white"
                    : "bg-gray-200 text-gray-700"}
    ${!presentAddress ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
  `}
              >
                Same as Residential Address
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !addOfficialAddress;
                  setAddOfficialAddress(next);

                  if (!next) {
                    setOfficialAddress("");
                    setOfficialPincode("");
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
    ${addOfficialAddress
                    ? "bg-lavender--600 text-white"
                    : "bg-gray-200 text-gray-700"}
  `}
              >
                Add Official Address
              </button>

            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">

            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">
                Residential Address
              </label>
              <textarea
                rows={9}
                placeholder="Enter Residential Address"
                value={presentAddress}
                // onChange={(e) => {
                //   setPresentAddress(e.target.value);
                //   if (sameAddress) setPermanentAddress(e.target.value);
                // }}

                onFocus={() => setActiveField("presentAddress")}
                onBlur={() => setActiveField(null)}

                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("presentAddress", val, 250)) {
                    setPresentAddress(val);
                    if (sameAddress) setPermanentAddress(val);
                  }
                }}


                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto
      ${errors.presentAddress ? "border-red-500" : "border-gray-300"}`}
              />

              <CharCounter
                value={presentAddress}
                max={250}
                show={activeField === "presentAddress"}
              />



              {errors.presentAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.presentAddress}
                </p>
              )}

            </div>
            <div className='relative'>
              <label className="block text-sm font-medium text-gray-700">
                Permanent Address
              </label>
              <textarea
                rows={9}
                placeholder="Enter Permanent Address"
                value={permanentAddress}
                // onChange={(e) => {
                //   setPermanentAddress(e.target.value);
                // }}

                onFocus={() => setActiveField("permanentAddress")}
                onBlur={() => setActiveField(null)}


                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("permanentAddress", val, 250)) {
                    setPermanentAddress(val);

                  }
                }}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto
      ${errors.permanentAddress ? "border-red-500" : "border-gray-300"}`}
                readOnly={sameAddress}
              />

              <CharCounter
                value={permanentAddress}
                max={250}
                show={activeField === "permanentAddress"}
              />


              {errors.permanentAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.permanentAddress}
                </p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Residential Pincode</label>
              <input
                type="text"
                value={presentPincode}
                onChange={(e) => {
                  const val = e.target.value;

                  // ✅ Allow only digits & max 6 characters
                  if (/^\d{0,6}$/.test(val)) {
                    setPresentPincode(val);

                    // ✅ Auto-fill permanent if checkbox checked
                    if (sameAddress) setPermanentPincode(val);
                  }
                }}
                placeholder="Enter Residential Pincode"
                maxLength={6}
                inputMode="numeric"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Permanent Pincode</label>
              <input
                type="text"
                value={permanentPincode}
                onChange={(e) => {
                  const val = e.target.value;

                  // ✅ Allow only digits & max 6 characters
                  if (/^\d{0,6}$/.test(val)) {
                    setPermanentPincode(val);
                  }
                }}
                placeholder="Enter Permanent Pincode"
                maxLength={6}
                inputMode="numeric"
                readOnly={sameAddress}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>


          </div>
          {addOfficialAddress && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div className='relative'>
                <label className="block text-sm font-medium text-gray-700">
                  Official Address
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter Official Address"
                  value={officialAddress}
                  // onChange={(e) => setOfficialAddress(e.target.value)}


                  onFocus={() => setActiveField("officialAddress")}
                  onBlur={() => setActiveField(null)}


                  onChange={(e) => {
                    const val = e.target.value;

                    if (validateMaxLength("officialAddress", val, 250)) {
                      setOfficialAddress(val);

                    }
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
                />


                <CharCounter
                  value={officialAddress}
                  max={250}
                  show={activeField === "officialAddress"}
                />


                {errors.officialAddress && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.officialAddress}
                  </p>
                )}

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Official Pincode</label>
                <input
                  type="text"
                  placeholder="Enter Official Pincode"
                  value={officialPincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,6}$/.test(val)) setOfficialPincode(val);
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Zone
                </label>

                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600"
                >
                  + Add Zone
                </button>
              </div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Zone --</option>
                {zones.map((z) => (
                  <option key={z._id} value={z.zone}>
                    {z.zone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600"
                >
                  + Add Area
                </button>
              </div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Area --</option>
                {areas.map((a, index) => (
                  <option key={index} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SmallSizedModal
            isOpen={isZoneModalOpen}
            onClose={() => {
              setIsZoneModalOpen(false);
              setZoneError("");
              setNewZoneName("");
            }}
            title="Add New Zone"
          >
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter Zone Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />

                {zoneError && (
                  <p className="text-red-500 text-xs mt-1">{zoneError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleSaveZone}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </SmallSizedModal>

          <SmallSizedModal
            isOpen={isAreaModalOpen}
            onClose={() => {
              setIsAreaModalOpen(false);
              setAreaError("");
              setNewAreaName("");
            }}
            title="Add New Area"
          >
            <div className="grid grid-cols-1 gap-4 mb-2">

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">-- Select Zone --</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z.zone}>
                      {z.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Area Name</label>
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Enter Area"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {areaError && (
                  <p className="text-red-500 text-xs mt-1">{areaError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleSaveArea}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </SmallSizedModal>
        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Spiritual Information</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-8 border-b border-gray-400">

            {/* Confirmation Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmation</label>
              <select
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">--Select--</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* SHOW ONLY IF YES */}
            {confirmation === "Yes" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmed Date</label>
                  <input
                    type="date"
                    value={confirmationDate}
                    onChange={(e) => setConfirmationDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div className='relative'>
                  <label className="block text-sm font-medium text-gray-700">Confirmed By</label>
                  <input
                    type="text"
                    value={confirmationBy}
                    // onChange={(e) => setConfirmationBy(e.target.value)}

                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("confirmationBy", val)) {
                        setConfirmationBy(val);
                      }
                    }}

                    onFocus={() => setActiveField("confirmationBy")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Enter Pastor Name"
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.confirmationBy ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={confirmationBy}
                    max={50}
                    show={activeField === "confirmationBy"}
                  />


                  {errors.confirmationBy && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmationBy}
                    </p>
                  )}
                </div>
                <div className='relative'>
                  <label className="block text-sm font-medium text-gray-700">Confirmed Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={confirmationChurch}
                    // onChange={(e) => setConfirmationChurch(e.target.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("confirmationChurch", val, 50)) {
                        setConfirmationChurch(val);
                      }
                    }}

                    onFocus={() => setActiveField("confirmationChurch")}
                    onBlur={() => setActiveField(null)}
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.confirmationChurch ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={confirmationChurch}
                    max={50}
                    show={activeField === "confirmationChurch"}
                  />


                  {errors.confirmationChurch && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmationChurch}
                    </p>
                  )}
                </div>
              </>
            )}

          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ">

            {/* Baptism Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Baptism</label>
              <select
                value={baptism}
                onChange={(e) => setBaptism(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">--Select--</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Show only if YES */}
            {baptism === "Yes" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Baptized Date</label>
                  <input
                    type="date"
                    value={baptismDate}
                    onChange={(e) => setBaptismDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div className='relative'>
                  <label className="block text-sm font-medium text-gray-700">Baptized By</label>
                  <input
                    type="text"
                    value={baptismBy}
                    // onChange={(e) => setBaptismBy(e.target.value)}
                    onFocus={() => setActiveField("baptismBy")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("baptismBy", val)) {
                        setBaptismBy(val);
                      }
                    }}
                    placeholder="Enter Pastor Name"

                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.baptismBy ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={baptismBy}
                    max={50}
                    show={activeField === "baptismBy"}
                  />


                  {errors.baptismBy && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.baptismBy}
                    </p>
                  )}
                </div>
                <div className='relative'>
                  <label className="block text-sm font-medium text-gray-700">Baptized Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={baptismChurch}
                    // onChange={(e) => setBaptismChurch(e.target.value)}

                    onFocus={() => setActiveField("baptismChurch")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("baptismChurch", val, 50)) {
                        setBaptismChurch(val);
                      }
                    }}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.baptismChurch ? "border-red-500" : "border-gray-300"}`}
                  />


                  <CharCounter
                    value={baptismChurch}
                    max={50}
                    show={activeField === "baptismChurch"}
                  />

                  {errors.baptismChurch && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.baptismChurch}
                    </p>
                  )}
                </div>
              </>
            )}

          </div>

        </div>



        {(
          memberType === "Full Member" ||
          (
            memberType === "Non - Communical Member" &&
            (relation === "Husband" || relation === "Wife")
          )
        ) && (
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
              <h1 className="text-lg text-lavender--600 font-semibold mb-2">Marital Information</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  >
                    <option value="">--Select--</option>
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widow</option>
                  </select>
                </div>

                {/* Show only when Married */}
                {(
                  ["Married", "Divorced", "Widowed"].includes(maritalStatus) ||
                  (
                    memberType === "Non - Communical Member" &&
                    (relation === "Husband" || relation === "Wife")
                  )
                ) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
                        <input
                          type="date"
                          value={marriageDate}
                          onChange={(e) => setMarriageDate(e.target.value)}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className='relative'>
                        <label className="block text-sm font-medium text-gray-700">Marriage Place</label>
                        <input
                          type="text"
                          value={marriagePlace}
                          // onChange={(e) => setMarriagePlace(e.target.value)}

                          onFocus={() => setActiveField("marriagePlace")}
                          onBlur={() => setActiveField(null)}

                          onChange={(e) => {
                            const val = e.target.value;
                            if (validateMaxLength("marriagePlace", val, 50)) {
                              setMarriagePlace(val);
                            }
                          }}
                          placeholder="Enter Marriage Place"
                          // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                          className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.marriagePlace ? "border-red-500" : "border-gray-300"}`}
                        />

                        <CharCounter
                          value={marriagePlace}
                          max={50}
                          show={activeField === "marriagePlace"}
                        />


                        {errors.marriagePlace && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.marriagePlace}
                          </p>
                        )}
                      </div>
                    </>
                  )}

              </div>
            </div>

          )}





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
            {saving ? "Saving..." : "Save"}
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
  )
}





