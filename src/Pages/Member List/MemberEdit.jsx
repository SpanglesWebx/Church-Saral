



import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import BackButton from "../../Components/Button/BackButton";


export const MemberEdit = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");

  // --- Membership states
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
  const [emailError, setEmailError] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryEmailError, setPrimaryEmailError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
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
  const [memberId, setMemberId] = useState("");
  const [memberType, setMemberType] = useState("");
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
  const [dualMemberId, setDualMemberId] = useState("");
  const [churchName, setChurchName] = useState("");
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismBy, setBaptismBy] = useState("");
  const [baptismChurch, setBaptismChurch] = useState("");
  const [confirmationDate, setConfirmationDate] = useState("");
  const [confirmationBy, setConfirmationBy] = useState("");
  const [confirmationChurch, setConfirmationChurch] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [marriagePlace, setMarriagePlace] = useState("");
  const [headMemberId, setHeadMemberId] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("Unhold");
  const [holdReason, setHoldReason] = useState("");
  const [memberStatus, setMemberStatus] = useState("Active");
  const [inactiveReason, setInactiveReason] = useState("");
  const [inactiveDescription, setInactiveDescription] = useState("");
  const [oldFamilyId, setOldFamilyId] = useState("");

  // --- Head-switch modal states
  const [showHeadSwitchModal, setShowHeadSwitchModal] = useState(false);
  // value: "same" or "new" (or "")
  const [headSwitchOption, setHeadSwitchOption] = useState("");
  // relation to apply to the old head when making same-family swap
  const [oldHeadRelation, setOldHeadRelation] = useState("");

  const [title, setTitle] = useState("");
  const [tamilTitle, setTamilTitle] = useState("");

  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [activeTamilField, setActiveTamilField] = useState(null);

  const tamilInputWrapperRef = useRef(null);
  const tamilInputRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // new states
  const [transliterationRequested, setTransliterationRequested] = useState(false);
  const [userEditedTamil, setUserEditedTamil] = useState(false);
  const [addOfficialAddress, setAddOfficialAddress] = useState(false);
  const [membershipFrom, setMembershipFrom] = useState("");
  const [officialAddress, setOfficialAddress] = useState("");
  const [officialPincode, setOfficialPincode] = useState("");

  // --- Married confirmation modal
  const [showMarriedConfirm, setShowMarriedConfirm] = useState(false);
  const [marriedCreatesNewFamily, setMarriedCreatesNewFamily] = useState(null)

  const [saving, setSaving] = useState(false);


  // const showFamilyId = relation === "Husband" || ["Wife", "Son", "Daughter"].includes(relation);
  const todayISO = () => new Date().toISOString().split("T")[0];
  const [oldMemberType, setOldMemberType] = useState("");

  const [primaryContact, setPrimaryContact] = useState("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [originalState, setOriginalState] = useState(null);

  const [relationLocked, setRelationLocked] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);
  const familyIdRef = useRef(null);
  const refs = {
    memberType: useRef(null),
    memberName: useRef(null),
    relation: useRef(null),
    gender: useRef(null),
  };



  const isNonCommunicalParent =
    memberType === "Non - Communical Member" &&
    (relation === "Husband" || relation === "Wife");


  const showHeadReadonly =
    ["Wife", "Son", "Daughter"].includes(relation) && relation !== "Head";
  const showFamilyId =
    ["Head", "Husband", "Wife", "Son", "Daughter"].includes(relation);



  const getTitle = (age, gender, maritalStatus) => {
    if (!age || !gender) return "";
    const a = Number(age);

    if (gender === "Male") return a < 13 ? "Master" : "Mister";

    if (gender === "Female") {
      if (a < 13) return "Miss";
      return maritalStatus === "Married" ? "Mrs" : "Miss";
    }

    return "";
  };

  useEffect(() => {
    setTitle(getTitle(age, gender, maritalStatus));
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
    if (!text.trim()) {
      setMemberTamilName("");
      return;
    }
    try {
      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setMemberTamilName(tamil);
      }
    } catch (err) {
      console.log("Transliteration error:", err);
    }
  };





  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Handle Backspace
    if (letter === "BACKSPACE") {
      if (start > 0) {
        const newVal =
          memberTamilName.slice(0, start - 1) +
          memberTamilName.slice(end);

        setMemberTamilName(newVal);

        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();   // ⭐ Keep cursor focused always
        });
      }
      return;
    }

    // Insert Tamil letter
    const before = memberTamilName.slice(0, start);
    const after = memberTamilName.slice(end);
    const newVal = before + letter + after;

    setMemberTamilName(newVal);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + letter.length;
      input.focus();   // ⭐ Cursor never disappears
    });
  };

  const TamilKeyboardDropdown = ({ onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
      "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண",
      "த", "ந", "ப", "ம", "ய", "ர",
      "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ", "ஜ",
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ];

    const highlights = new Set([
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ]);

    return (
      <div
        className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex flex-wrap justify-center gap-1"
          style={{ height: "120px", alignContent: "space-between" }}
        >
          {keys.map((k) => (
            <button
              key={k}
              onMouseDown={(e) => e.preventDefault()}
              className={
                highlights.has(k)
                  ? "bg-indigo-400 hover:bg-indigo-500 px-2 py-1 rounded text-xs font-bold"
                  : "bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded text-xs"
              }
              onClick={() => insertTamilAtCursor(k)}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-3">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertTamilAtCursor("BACKSPACE")}

          >
            Backspace
          </button>

          <button
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Debounced transliteration — runs only when user actively requested it
  useEffect(() => {
    if (!transliterationRequested) return;

    // If user already edited Tamil manually, do not overwrite it.
    if (userEditedTamil) {
      setTransliterationRequested(false);
      return;
    }

    // debounce (200–400ms as you like)
    const t = setTimeout(() => {
      transliterateTamil(memberName);
      setTransliterationRequested(false);
    }, 300);

    return () => clearTimeout(t);
  }, [transliterationRequested, memberName, userEditedTamil]);


  // Convert MBR00023/1 → FAM00023
  const getFamilyIdFromMember = (memberId) => {
    if (!memberId) return "";
    const base = memberId.split("/")[0]; // MBR00023
    const number = base.replace("MBR", ""); // 00023
    return `FAM${number}`;
  };


  const getMemberPhotoUrl = (photo) => {
    if (!photo) return "";
    return `${URL}/${photo}`;
  };

  // --- Fetch member details
  const fetchMember = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/${id}`, {
        headers: { Authorization: token },
      });

      const m = res.data.data;

      // Set all states with existing data
      setMemberId(m.member_id || "");
      setMemberType(m.member_type || "");
      setIsHead(m.isHead === "Yes");
      setFamilyId(m.family_id || "");

      // setRelation(m.relationship || "");

      let rel =
        m.relationship ||
        m.relation_with_head ||
        "";

      /* =========================
         CONVERT HEAD RELATION
      ========================= */

      if (rel === "Head") {

        if (m.gender === "Male") {
          rel = "Husband";
        }

        if (m.gender === "Female") {
          rel = "Wife";
        }

        // optional child logic
        if (m.child_label === "Son") {
          rel = "Son";
        }

        if (m.child_label === "Daughter") {
          rel = "Daughter";
        }
      }

      setRelation(rel);

      setOriginalState({
        memberId: m.member_id,
        familyId: m.family_id,
        relationship: rel,
        maritalStatus: m.marital_status || "",
        memberType: m.member_type,
      });





      setOldMemberType(m.member_type || "");

      setMembershipFrom(m.membership_from || "");
      setJoiningDate(m.joining_date || "");


      setMemberName(m.member_name || "");
      setMemberTamilName(m.member_tamil_name || "");
      setFatherName(m.father_name || "");
      setMotherName(m.mother_name || "");
      setTransliterationRequested(false);
      setUserEditedTamil(false);
      setIsInitialLoad(false);
      setTitle(m.member_title || "");
      setTamilTitle(m.member_tamil_title || "");
      setIsInitialLoad(false);
      setGender(m.gender || "");
      setDob(m.dob ? m.dob.split("T")[0] : "");
      setAge(m.age ?? "");
      setPlaceOfBirth(m.place_of_birth || "");
      setAadhar(m.aadhar_number || "");
      setBloodGroup(m.blood_group || "");
      setJoiningDate(m.joining_date || "");
      setEmail(m.email || "");
      setPrimaryEmail(m.primary_email || "");
      setQualification(m.qualification || "");
      setOccupation(m.occupation || "");
      setCommunity(m.community || "");
      setNationality(m.nationality || "");
      setContactNumbers((m.contact_numbers || []).join ? (m.contact_numbers || []).join(",") : (m.contact_numbers || ""));
      setPrimaryContact(m.primary_contact || "");
      // setPhotoPreview(m.photo ? `${URL}${m.photo}` : "");
      setPhotoPreview(m.photo ? getMemberPhotoUrl(m.photo) : "");

      setIsDualMember(m.is_dual_member || "");
      setDualMemberId(m.dual_member_id || "");
      setChurchName(m.church_name || "");
      setPresentAddress(m.present_address || "");
      setPermanentAddress(m.permanent_address || "");
      setPresentPincode(m.present_pincode || "");
      setPermanentPincode(m.permanent_pincode || "");
      setSelectedZone(m.zone || "");
      setSelectedArea(m.area || "");
      setBaptism(m.baptism || "");
      setBaptismDate(m.baptism_date || "");
      setBaptismBy(m.baptism_by || "");
      setBaptismChurch(m.baptism_church || "");
      setConfirmation(m.confirmation || "");
      setConfirmationDate(m.confirmation_date || "");
      setConfirmationBy(m.confirmation_by || "");
      setConfirmationChurch(m.confirmation_church || "");
      setMaritalStatus(m.marital_status || "");
      setMarriageDate(m.marriage_date || "");
      setMarriagePlace(m.marriage_place || "");
      setHeadName(res.data.data.head_name || m.head_name || "");
      setHeadMemberId(m.head_member_id || "");
      setMembershipStatus(m.membership_status);
      setHoldReason(m.hold_reason || "");
      setMemberStatus(m.status || "Active");
      setInactiveReason(m.inactive_reason || "");
      setInactiveDescription(m.inactive_description || "");
      setOldFamilyId(m.old_family_id || "");
      setMembershipFrom(m.membership_from || "");
      setOfficialAddress(m.official_address || "");
      setOfficialPincode(m.official_pincode || "");
      if ((m.official_address && m.official_address.trim() !== "") ||
        (m.official_pincode && m.official_pincode.trim() !== "")) {
        setAddOfficialAddress(true);
      } else {
        setAddOfficialAddress(false);
      }


    } catch (err) {
      console.log("Fetch Member Error:", err);
    }
  };

  useEffect(() => {
    fetchMember();
    fetchZones();
  }, []);

  // --- Age calculation
  const calculateAge = (selectedDob) => {
    if (!selectedDob) {
      setAge("");
      return;
    }
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

  // --- Aadhar formatting & validation
  const handleAadharChange = (value) => {
    let numeric = value.replace(/\D/g, "");
    numeric = numeric.slice(0, 12);
    let formatted = numeric.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setAadhar(formatted);
    if (numeric.length === 12) setAadharError("");
    else setAadharError("Aadhar must be 12 digits");
  };

  // --- Contacts
  const handleContactChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9,]/g, "");
    setContactNumbers(cleaned);
  };

  // --- Email validation
  const validateEmail = (value) => {
    const cleaned = value.trim();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    if (cleaned === "") {
      setEmail("");
      setEmailError("");
      return;
    }
    setEmail(cleaned);
    if (!pattern.test(cleaned)) setEmailError("Enter a valid email address");
    else setEmailError("");
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

  // --- Zones & Areas
  const fetchZones = async () => {
    try {
      const res = await axios.get(`${URL}/zones/all`, { headers: { Authorization: token } });
      setZones(res.data || []);
    } catch (err) {
      console.error("Zones Fetch Error:", err);
      setZones([]);
    }
  };

  const handleSaveZone = async () => {
    if (!newZoneName.trim()) {
      setResponse({ status: "Failed", message: "Zone name is required" });
      setTimeout(() => setResponse({ status: null, message: "" }), 2500);
      return;
    }

    try {
      await axios.post(`${URL}/zones/add`, { zone: newZoneName }, { headers: { Authorization: token } });
      setResponse({ status: "Success", message: "Zone added successfully" });
      setNewZoneName("");
      setIsZoneModalOpen(false);
      fetchZones();
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Something went wrong" });
    }
    setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  };

  const fetchAreas = async (zone) => {
    try {
      const res = await axios.get(`${URL}/zones/areas/${zone}`, { headers: { Authorization: token } });
      setAreas(res.data || []);
    } catch (err) {
      console.error("Area Fetch Error:", err);
      setAreas([]);
    }
  };

  useEffect(() => {
    if (selectedZone) fetchAreas(selectedZone);
    else setAreas([]);
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
      await axios.post(`${URL}/zones/area/add`, { zone: selectedZone, area: newAreaName }, { headers: { Authorization: token } });
      setResponse({ status: "Success", message: "Area added successfully" });
      setNewAreaName("");
      setAreaError("");
      setIsAreaModalOpen(false);
      fetchAreas(selectedZone);
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding area" });
    }
    setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  };






  // --- Modal confirm for SAME family
  const confirmMakeHeadSameFamily = () => {
    // Require a relation for old head ideally
    // (you may relax this requirement if you want)
    // We'll allow empty relation but warn user if empty
    // Apply changes locally: promote this member (isHead true), leave familyId as-is
    setHeadSwitchOption("same");
    setIsHead(true);
    setRelation("Head"); // new member relation
    // oldFamilyId remains same
    setShowHeadSwitchModal(false);
  };

  // --- Modal confirm for NEW family
  const confirmMakeHeadNewFamily = () => {
    const newFam = getFamilyIdFromMember(memberId);
    setHeadSwitchOption("new");
    setOldFamilyId(familyId); // store old family id
    setFamilyId(newFam); // reflect new family id in UI
    setIsHead(true);
    setRelation("Head");
    // clear old head relation (not used for new family case)
    setOldHeadRelation("");
    setShowHeadSwitchModal(false);
  };

  // --- Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    // if (file) setPhotoPreview(URL.createObjectURL(file));
    if (file) setPhotoPreview(window.URL.createObjectURL(file));

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


  const validateRequiredFields = () => {
    const newErrors = {};

    if (!memberType) newErrors.memberType = "Member Type is required";
    if (!memberName) newErrors.memberName = "Member Name is required";
    if (!relation) newErrors.relation = "Relationship is required";
    if (!gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);

    // scroll to first error
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

    // clear error when fixed
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
      <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
        {value.length}/{max}
      </span>
    );
  };


  const validatePrimaryEmail = (value) => {
    const cleaned = value.trim();

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (cleaned === "") {
      setPrimaryEmail("");
      setPrimaryEmailError("");
      return;
    }

    if (cleaned.includes(",")) {
      setPrimaryEmailError("Only one primary email allowed");
      return;
    }

    setPrimaryEmail(cleaned);

    if (!pattern.test(cleaned)) {
      setPrimaryEmailError("Enter valid primary email");
    } else {
      setPrimaryEmailError("");
    }
  };


  // --- UPDATE MEMBER (submit)
  const handleUpdate = async () => {
    if (!validateRequiredFields()) return;
    if (saving) return;
    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      setSaving(true);

      // Append all relevant fields
      const payload = {
        member_type: memberType,
        relationship: relation,


        family_id: familyId,
        head_member_id: headMemberId || memberId,


        member_name: memberName,
        gender,
        marital_status: maritalStatus || "",

        member_title: title || "",
        member_tamil_name: memberTamilName || "",
        member_tamil_title: tamilTitle || "",

        father_name: fatherName || "",
        mother_name: motherName || "",

        dob,
        age,
        place_of_birth: placeOfBirth || "",
        aadhar_number: aadhar || "",
        blood_group: bloodGroup || "",
        joining_date: joiningDate || "",
        email: email || "",
        primary_email: primaryEmail || "",

        qualification: qualification || "",
        occupation: occupation || "",
        community: community || "",
        nationality: nationality || "",

        contact_numbers: contactNumbers || "",
        primary_contact: primaryContact,

        present_address: presentAddress || "",
        permanent_address: permanentAddress || "",
        present_pincode: presentPincode || "",
        permanent_pincode: permanentPincode || "",

        zone: selectedZone || "",
        area: selectedArea || "",

        membership_from: membershipFrom || "",
        official_address: officialAddress || "",
        official_pincode: officialPincode || "",

        baptism,
        baptism_date: baptismDate || "",
        baptism_by: baptismBy || "",
        baptism_church: baptismChurch || "",

        confirmation,
        confirmation_date: confirmationDate || "",
        confirmation_by: confirmationBy || "",
        confirmation_church: confirmationChurch || "",

        marriage_date: marriageDate || "",
        marriage_place: marriagePlace || "",

        status: memberStatus,
      };


      // Append to formData
      Object.entries(payload).forEach(([k, v]) => {
        // ensure undefined/null values are not appended as "null"
        if (v !== undefined && v !== null) formData.append(k, v);
      });

      // Append head-switch flags
      // Backend expects: makeHeadType ('same_family' | 'new_family') and selectedRelationForOldHead
      const makeHeadTypeValue = headSwitchOption === "same" ? "same_family" : headSwitchOption === "new" ? "new_family" : "";
      if (makeHeadTypeValue) formData.append("makeHeadType", makeHeadTypeValue);
      if (oldHeadRelation) formData.append("selectedRelationForOldHead", oldHeadRelation);

      // Send request
      await axios.put(`${URL}/new-members/update/${id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse({ status: "Success", message: "Member Updated Successfully" });
      // setTimeout(() => navigate("/admin/memberlist"), 1400);
      setTimeout(() => navigate(-1), 1400);
    } catch (err) {
      console.error("Update Member Error:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Update Failed" });
    }
    finally {
      setSaving(false);
    }
  };






  const upgradeToFullMember = async () => {
    try {
      const res = await axios.get(
        `${URL}/new-members/preview-upgrade-member-id`,
        {
          params: {
            member_type: "Full Member",
            relationship: relation,        // Son / Daughter

            // ✅ IMPORTANT FIX
            // if head -> use current memberId
            // else use actual headMemberId
            head_member_id: headMemberId || memberId,// existing head
          },
          headers: { Authorization: token },
        }
      );

      setMemberId(res.data.preview_id);   // MBR00199
      setFamilyId(res.data.family_id);    // SAME family
      setMembershipFrom(todayISO());


      const { preview_id } = res.data;

      if (!preview_id) {
        throw new Error("Unable to generate new Member ID");
      }

      // ✅ APPLY RULES
      setMemberId(preview_id);        // 🔥 NEW MBRxxxxx
      setMembershipFrom(todayISO());  // 🔥 TODAY
      // ❌ DO NOT TOUCH familyId
      // ❌ DO NOT TOUCH relationship

    } catch (err) {
      console.error("Upgrade Member Error:", err);
    }
  };




  const handleMemberTypeChange = async (type) => {

    /* ===============================
       🔒 EDIT MODE SAFETY FIRST
    =============================== */
    if (id) {

      // 🚫 FULL → NON-COMMUNICAL (BLOCK)
      if (
        oldMemberType === "Full Member" &&
        type === "Non - Communical Member"
      ) {
        // restore original value
        setMemberType(oldMemberType);

        alert("Full Member cannot be changed back to Non-Communical Member");
        return;
      }

      // 🔒 Non-Communical → Non-Communical (DO NOTHING)
      if (
        oldMemberType === "Non - Communical Member" &&
        type === "Non - Communical Member"
      ) {
        return;
      }

      // 🔥 Non-Communical → Full (ONLY VALID UPGRADE)
      if (
        oldMemberType === "Non - Communical Member" &&
        type === "Full Member"
      ) {
        setMemberType(type);
        await upgradeToFullMember();
        setMembershipFrom(todayISO());
        return;
      }

      // 🔵 Full → Full (normal edit)
      if (oldMemberType === "Full Member" && type === "Full Member") {
        return;
      }
    }

    /* ===============================
       ADD MODE
    =============================== */
    setMemberType(type);

    if (!id) {
      if (type === "Full Member") {
        setMembershipFrom(todayISO());
        setJoiningDate(todayISO());
      }

      if (type === "Non - Communical Member") {
        setMembershipFrom("");
        setJoiningDate(todayISO());
      }
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
        return relation;
    }
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
        <BackButton />




        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Edit Member
        </h1>

        {/* PHOTO PREVIEW */}
        {photoPreview && (
          <div className="mt-2">
            <img src={photoPreview} alt="Member" className="h-28 w-28 object-cover rounded-md border" />
          </div>
        )}

        {/* ================= MEMBERSHIP DETAILS (EDIT MODE) ================= */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">
            Membership Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

            {/* MEMBER ID */}
            <div>


              <RequiredLabel>Member ID</RequiredLabel>

              <input
                type="text"
                value={memberId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>





            {/* MEMBER TYPE */}
            <div>
              <RequiredLabel>Member Type</RequiredLabel>

              {id && oldMemberType === "Full Member" ? (
                // ✅ Read-only view
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700">
                  Full Member
                </div>
              ) : (

                <select
                  value={memberType}
                  onChange={(e) => handleMemberTypeChange(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Member Type</option>
                  <option value="Full Member">Full Member</option>

                  {!(id && oldMemberType === "Full Member") && (
                    <option value="Non - Communical Member">
                      Non - Communical Member
                    </option>
                  )}
                </select>
              )}
            </div>




            {/* MEMBER NAME */}
            <div>

              <RequiredLabel>Member Name</RequiredLabel>


              <div className="mt-1 w-full relative">

                <div className="flex items-center w-full">
                  <span
                    className="w-[60px] text-center bg-gray-50 border rounded-l-md"
                    style={{ width: "10%", minWidth: "60px", height: "38px" }}
                  >
                    {title}
                  </span>

                  <input
                    ref={refs.memberName}
                    type="text"
                    value={memberName}
                    onFocus={() => setActiveField("memberName")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("memberName", val, 50)) {
                        setMemberName(val);
                        setUserEditedTamil(false);
                        setTransliterationRequested(true);
                      }
                    }}
                    className={`block w-full border rounded-md px-3 py-2
        ${errors.memberName ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                <CharCounter
                  value={memberName}
                  max={50}
                  show={activeField === "memberName"}
                />

                {errors.memberName && (
                  <p className="text-xs text-red-500 mt-1 ml-[10%]">
                    {errors.memberName}
                  </p>
                )}

              </div>

            </div>


            {/* MEMBER TAMIL NAME */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Member Tamil Name
              </label>

              <div className="flex items-center mt-1">
                {/* Tamil Title */}
                <span
                  className="bg-gray-50 border text-center rounded-l-md"
                  style={{ width: "10%", minWidth: "60px", height: "38px" }}
                >
                  {tamilTitle}
                </span>

                {/* Tamil Input */}
                <input
                  ref={tamilInputRef}
                  type="text"
                  value={memberTamilName}

                  /* 🔥 IMPORTANT: Tamil keyboard trigger */
                  onFocus={() => {
                    setActiveTamilField("memberTamilName"); // ✅ FIX
                    setActiveField("memberTamilName");      // for counter
                  }}

                  onBlur={() => {
                    setActiveTamilField(null);
                    setActiveField(null);
                  }}

                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateMaxLength("memberTamilName", val, 50)) {
                      setMemberTamilName(val);
                      setUserEditedTamil(true); // prevent overwrite
                    }
                  }}

                  className={`flex-1 border rounded-r-md px-3 py-2
        ${errors.memberTamilName ? "border-red-500" : "border-gray-300"}`}
                />
              </div>

              {/* 🔢 CHAR COUNTER */}
              <CharCounter
                value={memberTamilName}
                max={50}
                show={activeField === "memberTamilName"}
              />

              {/* 🔴 ERROR */}
              {errors.memberTamilName && (
                <p className="text-xs text-red-500 mt-1 ml-[10%]">
                  {errors.memberTamilName}
                </p>
              )}

              {/* 🟡 TAMIL KEYBOARD */}
              {activeTamilField === "memberTamilName" && (
                <TamilKeyboardDropdown
                  onClose={() => setActiveTamilField(null)}
                />
              )}
            </div>

            {/* HEAD STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Head
              </label>

              <div className="mt-1 flex justify-center w-full">
                {isHead ? (
                  <span className="min-w-40 text-center py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                    Yes
                  </span>
                ) : (
                  <span className="min-w-40 text-center py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 text-bold">
                    No
                  </span>
                )}
              </div>
            </div>


            {/* RELATIONSHIP */}
            {/* <div>

              <RequiredLabel> Relationship</RequiredLabel>




               <select
                value={relation}
                disabled={relationLocked}
                 readOnly
             
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Relation</option>

                {!relationLocked && (
                  <>
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </>
                )}


              </select> 


            


            </div> */}


            <div>
              <RequiredLabel>Relationship</RequiredLabel>

              <input
                type="text"
                value={getDisplayRelation(relation)}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm  cursor-not-allowed"
              />
            </div>

            {/* FAMILY ID */}
            {showFamilyId && (
              <div ref={familyIdRef}>

                <RequiredLabel>Family ID</RequiredLabel>
                <input
                  type="text"
                  value={familyId}
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}


            {/* HEAD DETAILS – READ ONLY (EDIT MODE) */}
            {!isHead && (
              <>
                {/* Head Member ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Head's Member ID
                  </label>
                  <input
                    type="text"
                    value={headMemberId}
                    readOnly
                    className="block w-full mt-1  rounded-md shadow-sm sm:text-sm  cursor-not-allowed"
                  />
                </div>

                {/* Head of the Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Head's Name
                  </label>
                  <input
                    type="text"
                    value={headName}
                    readOnly
                    className="block w-full mt-1  rounded-md shadow-sm sm:text-sm  cursor-not-allowed"
                  />
                </div>
              </>
            )}


            {/* MEMBERSHIP FROM */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Membership From
              </label>
              <input
                type="date"
                value={membershipFrom}
                onChange={(e) => setMembershipFrom(e.target.value)}
                readOnly={!!id} // 🔒 edit mode lock
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <input type="date" value={joiningDate} readOnly={!!id} onChange={(e) => setJoiningDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

          </div>
        </div>



        {/* PERSONAL DETAILS ... (kept same as original) */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Personal Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">



            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Father Name</label>
              <input
                type="text"
                value={fatherName}
                onFocus={() => setActiveField("fatherName")}
                onBlur={() => setActiveField(null)}
                // onChange={(e) => setFatherName(e.target.value)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("fatherName", val, 50)) {
                    setFatherName(val);

                  }
                }}
                placeholder="Enter Father Name"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
      ${errors.memberName ? "border-red-500" : "border-gray-300"}`}

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

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Mother Name</label>
              <input
                type="text"
                value={motherName}
                // onChange={(e) => setMotherName(e.target.value)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("motherName", val, 50)) {
                    setMotherName(val);

                  }
                }}
                onFocus={() => setActiveField("motherName")}
                onBlur={() => setActiveField(null)}
                placeholder="Enter Mother Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
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

            <div>

              <label className="block text-sm font-medium text-gray-700">Primary Contact Number</label>

              <input
                type="tel"
                value={primaryContact}
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) setPrimaryContact(val);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

              {primaryContact && primaryContact.length !== 10 && (
                <p className="text-xs text-red-600 mt-1">
                  Enter valid 10 digit mobile number
                </p>
              )}
            </div>



            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Contact Numbers</label>
              <input type="text" value={contactNumbers} onChange={handleContactChange} placeholder="Enter Contact Numbers" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div> */}


            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Contact Numbers
              </label>

              <input
                type="text"
                value={contactNumbers}
                placeholder="Enter Contact Numbers"
                onFocus={() => setActiveField("contactNumbers")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  // allow only numbers & commas
                  const cleaned = e.target.value.replace(/[^0-9,]/g, "");

                  if (validateMaxLength("contactNumbers", cleaned, 60)) {
                    setContactNumbers(cleaned);
                  }
                }}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
      ${errors.contactNumbers ? "border-red-500" : "border-gray-300"}
      border`}
              />

              {/* 🔢 Character Counter */}
              <CharCounter
                value={contactNumbers}
                max={60}
                show={activeField === "contactNumbers"}
              />

              {/* 🔴 Error Message */}
              {errors.contactNumbers && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactNumbers}
                </p>
              )}
            </div>




            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => { const value = e.target.value; setDob(value); calculateAge(value); }} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="text" placeholder="Select Date of Birth" value={age} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <RequiredLabel>Gender</RequiredLabel>
              <select ref={refs.gender} value={gender} onChange={(e) => setGender(e.target.value)}
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"

                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${errors.gender ? "border-red-500" : "border-gray-300"}`}>
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

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
              <input type="text" value={placeOfBirth}
                // onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder="Enter Place"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"



                onFocus={() => setActiveField("placeOfBirth")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("placeOfBirth", val, 50)) {
                    setPlaceOfBirth(val);

                  }
                }}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
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
              <select className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>

                <option value="A1-">A1-</option>
                <option value="A1+">A1+</option>
                <option value="A1B+">A1B+</option>
                <option value="AB1+">AB1+</option>
                <option value="AB1-">AB1-</option>
                <option value="AB2+">AB2+</option>
                <option value="AB2-">AB2-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
              <input type="text" value={aadhar} placeholder="XXXX XXXX XXXX" onChange={(e) => handleAadharChange(e.target.value)} className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm ${aadharError ? "border-red-500" : ""}`} />
              {aadharError && <p className="text-red-500 text-xs mt-1">{aadharError}</p>}
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
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
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

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input type="text"
                value={qualification}
                // onChange={(e) => setQualification(e.target.value)}
                //
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"


                onFocus={() => setActiveField("qualification")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("qualification", val, 50)) {
                    setQualification(val);

                  }
                }}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
      ${errors.qualification ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter Qualification"

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

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input type="text"
                value={occupation}
                // onChange={(e) => setOccupation(e.target.value)}
                placeholder="Enter Occupation"
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"




                onFocus={() => setActiveField("occupation")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("occupation", val, 50)) {
                    setOccupation(val);

                  }
                }}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
      ${errors.memberName ? "border-red-500" : "border-gray-300"}`}


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
              <input type="file" accept=".jpg, .jpeg, .png" onChange={handlePhotoUpload} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              {photoError && <p className="text-red-500 text-xs mt-1">{photoError}</p>}
            </div>
          </div>
        </div>


        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg text-lavender--600 font-semibold">Address</h1>


            <div className="flex items-center gap-3">

              <button
                type="button"
                disabled={!presentAddress}
                onClick={handleSameAddress}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

            <div className="relative">
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
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"




                onFocus={() => setActiveField("presentAddress")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("presentAddress", val, 250)) {
                    setPresentAddress(val);
                    if (sameAddress) setPermanentAddress(val);
                  }
                }}
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
            <div className="relative">
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
                // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
                readOnly={sameAddress}



                onFocus={() => setActiveField("permanentAddress")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("permanentAddress", val, 250)) {
                    setPermanentAddress(val);

                  }
                }}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto
      ${errors.permanentAddress ? "border-red-500" : "border-gray-300"}`}
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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Official Address
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter Official Address"
                  value={officialAddress}
                  // onChange={(e) => setOfficialAddress(e.target.value)}
                  // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"



                  onFocus={() => setActiveField("officialAddress")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (validateMaxLength("officialAddress", val, 250)) {
                      setOfficialAddress(val);

                    }
                  }}
                  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto
      ${errors.officialAddress ? "border-red-500" : "border-gray-300"}`}
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

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Baptized By</label>
                  <input
                    type="text"
                    value={baptismBy}
                    // onChange={(e) => setBaptismBy(e.target.value)}
                    placeholder="Enter Pastor Name"
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"



                    onFocus={() => setActiveField("baptismBy")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("baptismBy", val, 50)) {
                        setBaptismBy(val);

                      }
                    }}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Baptized Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={baptismChurch}
                    // onChange={(e) => setBaptismChurch(e.target.value)}
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"



                    onFocus={() => setActiveField("baptismChurch")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("baptismChurch", val, 50)) {
                        setBaptismChurch(val);

                      }
                    }}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

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

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Confirmed By</label>
                  <input
                    type="text"
                    value={confirmationBy}
                    // onChange={(e) => setConfirmationBy(e.target.value)}
                    placeholder="Enter Pastor Name"
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"





                    onFocus={() => setActiveField("confirmationBy")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("confirmationBy", val, 50)) {
                        setConfirmationBy(val);

                      }
                    }}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Confirmed Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={confirmationChurch}
                    // onChange={(e) => setConfirmationChurch(e.target.value)}
                    // className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"



                    onFocus={() => setActiveField("confirmationChurch")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (validateMaxLength("confirmationChurch", val, 50)) {
                        setConfirmationChurch(val);

                      }
                    }}
                    className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>


                  <select
                    value={maritalStatus}



                    onChange={(e) => {
                      const value = e.target.value;
                      setMaritalStatus(value);

                      if (value !== "Married") {
                        // 🔁 Reset transfer-only state
                        setMarriageDate("");
                        setMarriagePlace("");
                        setTransferConfirmed(false);

                        if (originalState) {
                          setMemberId(originalState.memberId);
                          setFamilyId(originalState.familyId);
                          // setRelation(originalState.relation);
                        }
                      }
                    }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  >
                    <option value="">--Select--</option>
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>

                </div>

                {/* {["Married", "Divorced", "Widowed"].includes(maritalStatus) && ( */}


                {["Married", "Divorced", "Widowed"].includes(maritalStatus) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Marriage Date
                      </label>
                      <input
                        type="date"
                        value={marriageDate}
                        onChange={(e) => setMarriageDate(e.target.value)}
                        className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">
                        Marriage Place
                      </label>

                      <input
                        type="text"
                        value={marriagePlace}
                        placeholder="Enter Marriage Place"
                        onFocus={() => setActiveField("marriagePlace")}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (validateMaxLength("marriagePlace", val, 50)) {
                            setMarriagePlace(val);
                          }
                        }}
                        className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
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

                      {/* Transfer button ONLY for Married */}
                      {/* Transfer button ONLY when newly changed to Married */}
                      {maritalStatus === "Married" &&
                        originalState?.maritalStatus !== "Married" && (



                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => setShowTransferModal(true)}
                              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                            >
                              Transfer to New Family
                            </button>
                          </div>
                        )}
                    </div>
                  </>
                )}




                <Modal
                  isOpen={showTransferModal}
                  onClose={() => {
                    setShowTransferModal(false);
                    setMaritalStatus(originalState?.maritalStatus || "");
                  }}
                  title="Confirm Transfer"
                >
                  <p className="text-sm">
                    Are you sure you want <b>{memberName} ({memberId})</b> as a new family?
                  </p>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowTransferModal(false);
                        if (originalState) {
                          setMaritalStatus(originalState.maritalStatus || "");
                          setMemberId(originalState.memberId);
                          setFamilyId(originalState.familyId);
                          setRelation(originalState.relation);
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      No
                    </button>


                    <button
                      onClick={async () => {
                        try {
                          const res = await axios.get(
                            `${URL}/new-members/preview-transfer-family`,
                            {
                              headers: { Authorization: token },
                            }
                          );

                          // ✅ SAME MEMBER ID
                          setMemberId(memberId);

                          // ✅ NEW FAMILY ID FROM BACKEND
                          setFamilyId(res.data.preview_family_id);

                          // ✅ SON → HEAD
                          setRelation("Husband");

                          setIsHead(true);

                          setTransferConfirmed(true);
                          setTimeout(() => {
                            familyIdRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 200);
                          setShowTransferModal(false);
                        } catch (err) {
                          console.error("Transfer preview failed", err);
                        }
                      }}
                      className="px-4 py-2 bg-lavender--600 text-white rounded"
                    >
                      Yes
                    </button>

                  </div>
                </Modal>


              </div>
            </div>

          )}

        {/* Membership Status */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Membership Status</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input type="radio" name="membershipStatus" className="text-green-500 border-green-500 focus:ring-green-500" value="Unhold" checked={membershipStatus === "Unhold"} onChange={() => setMembershipStatus("Unhold")} />
                  <span className="text-green-500 font-semibold">Unhold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="membershipStatus" className="text-red-500 border-red-500 focus:ring-red-500" value="Hold" checked={membershipStatus === "Hold"} onChange={() => setMembershipStatus("Hold")} />
                  <span className="text-red-500 font-semibold">Hold</span>
                </label>
              </div>
            </div>

            {membershipStatus === "Hold" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for the Hold</label>
                <input type="text" placeholder="Enter Reason" value={holdReason} onChange={(e) => setHoldReason(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Status</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>

              <div className="flex gap-6 mt-1">
                {/* ACTIVE */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Active"
                    checked={memberStatus === "Active"}
                    onChange={() => setMemberStatus("Active")}
                    className="text-green-500 border-green-500 focus:ring-green-500"
                  />
                  <span className="text-green-500 font-semibold">Active</span>
                </label>

                {/* INACTIVE */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Inactive"
                    checked={memberStatus === "Inactive"}
                    onChange={() => setMemberStatus("Inactive")}
                    className="text-red-500 border-red-500 focus:ring-red-500"
                  />
                  <span className="text-red-500 font-semibold">Inactive</span>
                </label>
              </div>
            </div>


            {memberStatus === "Inactive" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <select value={inactiveReason} onChange={(e) => setInactiveReason(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                  <option value="">--Select--</option>
                  <option value="Death">Death</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Marriage">Marriage</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            {memberStatus === "Inactive" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" placeholder="Enter Description" disabled={memberStatus !== "Inactive"} value={inactiveDescription} onChange={(e) => setInactiveDescription(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm disabled:bg-gray-100" />
              </div>
            )}
          </div>

          {/* Head Switch Modal (uses your ExpenseFormModal component) */}
          <Modal isOpen={showHeadSwitchModal} onClose={() => setShowHeadSwitchModal(false)} title="Change Family Head">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700 mb-2">Choose how this member should become the head:</p>

                <div className="flex gap-2 mb-3">
                  <button className={`px-3 py-2 rounded ${headSwitchOption === "same" ? "bg-lavender--600 text-white" : "bg-gray-100"}`} onClick={() => setHeadSwitchOption("same")}>
                    Same Family
                  </button>

                  <button className={`px-3 py-2 rounded ${headSwitchOption === "new" ? "bg-lavender--600 text-white" : "bg-gray-100"}`} onClick={() => setHeadSwitchOption("new")}>
                    New Family
                  </button>
                </div>

                {headSwitchOption === "same" && (
                  <>
                    <p className="text-sm mb-2">Current Head: <strong>{headName || headMemberId || "—"}</strong></p>

                    <label className="block text-sm font-medium">Relation for OLD Head</label>
                    <select className="w-full border rounded-md p-2 mb-3" value={oldHeadRelation} onChange={(e) => setOldHeadRelation(e.target.value)}>
                      <option value="">Select Relation</option>
                      <option value="Husband">Husband</option>
                      <option value="Wife">Wife</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son-In-Law">Son-In-Law</option>
                      <option value="Daughter-In-Law">Daughter-In-Law</option>
                    </select>

                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setHeadSwitchOption(""); setOldHeadRelation(""); }}>
                        Cancel
                      </button>
                      <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={confirmMakeHeadSameFamily}>
                        Confirm (Same Family)
                      </button>
                    </div>
                  </>
                )}

                {headSwitchOption === "new" && (
                  <>
                    <p className="text-sm mb-2">This will create a new Family ID derived from the Member ID and make this member the Head of the new family.</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setHeadSwitchOption("")}>Cancel</button>
                      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={confirmMakeHeadNewFamily}>Confirm (Create New Family)</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Modal>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {/* <button onClick={handleUpdate} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Update Member</button> */}

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
            {saving ? "Updating..." : "Update Member"}
          </button>
        </div>

        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}


      </div>
    </>
  )
}




