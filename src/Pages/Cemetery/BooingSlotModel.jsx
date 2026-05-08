
import React from "react";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Button from "../../Components/Form/Button";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";
import CharCounter from "../../Components/Form/CharCounter";

const BooingSlotModel = ({
    isOpen,
    onClose,
    viewMode,
    handleSubmit,
    handleBooking,



    saving,
    errors,
    showError,

    register,
    watch,
    setValue,

    selectedCemetery,
    fetchBookedSlots,
    setSelectedSlots,
    token,
    URL,
    setIsModalOpen,

    // member
    isMember,
    setIsMember,
    memberIdSearch,
    setMemberIdSearch,
    memberNameSearch,
    setMemberNameSearch,
    dropdownById,
    dropdownByName,
    debouncedSearchById,
    debouncedSearchByName,
    setDropdownByIdFn,
    setDropdownByNameFn,

    // burial
    selectedSlots,
    burialType,
    setBurialType,
    burialNames,
    setBurialNames,
    burialDates,
    setBurialDates,

    buriedPersonIdSearch,
    setBuriedPersonIdSearch,
    buriedPersonNameSearch,
    setBuriedPersonNameSearch,
    buriedDropdownById,
    buriedDropdownByName,
    setBuriedDropdownByName,
    debouncedBuriedSearchById,
    setBuriedDropdownById,
    debouncedBuriedSearchByName,


    buriedMemberObjectId,
    setBuriedMemberObjectId,

    // extra
    slotPersons,
    reset,
    selectedBooking,
}) => {


    React.useEffect(() => {

        if (
            viewMode === "burial" &&
            selectedBooking
        ) {

            // =========================
            // BOOKING PERSON
            // =========================

            if (selectedBooking.bookingPerson?.isMember) {

                setIsMember(true);

                setMemberIdSearch(
                    selectedBooking.bookingPerson?.memberId?.member_id || ""
                );

                setMemberNameSearch(
                    selectedBooking.bookingPerson?.memberId?.member_name || ""
                );

                setValue(
                    "memberTamilName",
                    selectedBooking.bookingPerson?.memberId?.member_tamil_name || ""
                );

                setValue(
                    "gender",
                    selectedBooking.bookingPerson?.memberId?.gender || ""
                );

                setValue(
                    "phone",
                    selectedBooking.bookingPerson?.memberId?.primary_contact || ""
                );

                setValue(
                    "aadhar_number",
                    selectedBooking.bookingPerson?.memberId?.aadhar_number || ""
                );

                setValue(
                    "permanent_address",
                    selectedBooking.bookingPerson?.memberId?.permanent_address || ""
                );

                setValue(
                    "present_address",
                    selectedBooking.bookingPerson?.memberId?.present_address || ""
                );

                setValue(
                    "status",
                    selectedBooking.bookingPerson?.memberId?.status || ""
                );

                setValue(
                    "memberObjectId",
                    selectedBooking.bookingPerson?.memberId?._id || ""
                );

            } else {

                setIsMember(false);

                setValue(
                    "nonMemberName",
                    selectedBooking.bookingPerson?.nonMember?.name || ""
                );

                setValue(
                    "nonMemberTamilName",
                    selectedBooking.bookingPerson?.nonMember?.tamilName || ""
                );

                setValue(
                    "nonMemberGender",
                    selectedBooking.bookingPerson?.nonMember?.gender || ""
                );

                setValue(
                    "nonMemberPhone",
                    selectedBooking.bookingPerson?.nonMember?.phone || ""
                );

                setValue(
                    "nonMemberAadhar",
                    selectedBooking.bookingPerson?.nonMember?.aadhar || ""
                );

                setValue(
                    "nonMemberPermanentAddress",
                    selectedBooking.bookingPerson?.nonMember?.permanentAddress || ""
                );

                setValue(
                    "nonMemberPresentAddress",
                    selectedBooking.bookingPerson?.nonMember?.presentAddress || ""
                );
            }

            // =========================
            // BURIAL PERSON
            // =========================

            const slot = selectedBooking.slotId;

            // member / non member
            setBurialType(prev => ({
                ...prev,
                [slot]:
                    selectedBooking.buriedPerson?.isMember ?? true
            }));

            // buried name
            setBurialNames(prev => ({
                ...prev,
                [slot]:
                    selectedBooking.buriedPerson?.name || ""
            }));

            // buried date
            setBurialDates(prev => ({
                ...prev,
                [slot]:
                    selectedBooking.buriedPerson?.buriedDate
                        ? new Date(
                            selectedBooking.buriedPerson.buriedDate
                        ).toISOString().split("T")[0]
                        : ""
            }));

            // member inputs
            if (selectedBooking.buriedPerson?.isMember) {

                setBuriedPersonIdSearch(prev => ({
                    ...prev,
                    [slot]:
                        selectedBooking.buriedPerson?.memberId?.member_id || ""
                }));

                setBuriedPersonNameSearch(prev => ({
                    ...prev,
                    [slot]:
                        selectedBooking.buriedPerson?.memberId?.member_name || ""
                }));

            } else {

                setBuriedPersonNameSearch(prev => ({
                    ...prev,
                    [slot]:
                        selectedBooking.buriedPerson?.nonMember?.name || ""
                }));
            }

            setBuriedPersonIdSearch(prev => ({
                ...prev,
                [slot]:
                    selectedBooking.buriedPerson?.memberId?.member_id || ""
            }));

            setBuriedMemberObjectId(prev => ({
                ...prev,
                [slot]:
                    selectedBooking.buriedPerson?.memberId?._id || null
            }));
        }

    }, [selectedBooking, viewMode]);
    return (




        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Booking Slot"
        >
            {(viewMode === "reservation" || viewMode === "burial") ? (
                <form onSubmit={handleSubmit(handleBooking)}>
                    <div className="space-y-3 max-h-[550px] overflow-y-auto">
                        <div className="p-4 border rounded-lg bg-gray-50">

                            {/* Toggle */}
                            <div className="mb-4 flex justify-end">
                                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                                    {/* Highlight background */}
                                    <div
                                        className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                        style={{
                                            width: "calc(50% - 0.25rem)",
                                            transform: isMember ? "translateX(0)" : "translateX(100%)",
                                        }}
                                    />
                                    {/* Member button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMember(true);
                                            // reset();
                                            setBurialType({});
                                            setMemberIdSearch("");
                                            setMemberNameSearch("");
                                            setDropdownByIdFn([]);
                                            setDropdownByNameFn([]);
                                        }}

                                        className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
                    ${isMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Member
                                    </button>
                                    {/* Non-Member button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMember(false);
                                            // reset();
                                            setMemberIdSearch("");
                                            setMemberNameSearch("");
                                            setDropdownByIdFn([]);
                                            setDropdownByNameFn([]);
                                        }}
                                        className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
                ${!isMember ? "text-white" : "text-gray-700"}`}
                                    >
                                        Non-Member
                                    </button>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                                {isMember ? (
                                    <>
                                        {/* Member ID */}
                                        <div>

                                            <RequiredLabel>Member ID</RequiredLabel>
                                            <input
                                                type="text"
                                                placeholder="Search by ID"
                                                value={memberIdSearch}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setMemberIdSearch(val);
                                                    debouncedSearchById(val);
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                        </div>

                                        {/* Member Name */}
                                        <div>

                                            <RequiredLabel>Member Name</RequiredLabel>
                                            <input
                                                type="text"
                                                placeholder="Search by Name"
                                                value={memberNameSearch}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!validateMaxLength("memberName", val, 50, showError)) return;

                                                    setMemberNameSearch(val);
                                                    debouncedSearchByName(val);
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                            {/* 
                                            <CharCounter value={memberNameSearch} max={50} show /> */}


                                        </div>

                                        {/* Tamil Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tamil Name</label>
                                            <input
                                                type="text"
                                                {...register("memberTamilName")}
                                                readOnly
                                                value={watch("memberTamilName") || ""}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <input
                                                type="text"
                                                {...register("gender")}
                                                readOnly
                                                value={watch("gender") || ""}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="text"
                                                readOnly
                                                {...register("phone")}
                                                value={watch("phone") || ""}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Aadhar */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Aadhar</label>
                                            <input
                                                type="text"
                                                {...register("aadhar_number")}
                                                readOnly
                                                value={watch("aadhar_number") || ""}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Permanent Address */}
                                        <div className="sm:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                                            <input
                                                type="text"
                                                {...register("permanent_address")}
                                                readOnly
                                                value={
                                                    watch("permanent_address") ||
                                                    ""
                                                }
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Present Address */}
                                        <div className="sm:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700">Present Address</label>
                                            <input
                                                type="text"
                                                {...register("present_address")}
                                                readOnly
                                                value={
                                                    watch("present_address") ||
                                                    ""
                                                }
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <input
                                                type="text"
                                                {...register("status")}
                                                readOnly
                                                value={watch("status") || ""}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        {/* Sources */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sources</label>
                                            <input
                                                type="text"
                                                {...register("sources")}
                                                readOnly
                                                value={(watch("sources") || []).join(", ")}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                                            />
                                        </div>

                                        <input type="hidden" {...register("memberObjectId")} />

                                        {/* Dropdown results */}
                                        {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                                            <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                                                {(dropdownById.length > 0 ? dropdownById : dropdownByName).map((m) => (
                                                    <li
                                                        key={m.member_id}
                                                        className={`flex px-3 py-2 text-sm text-gray-700 ${m.member_id === "none"
                                                            ? "text-gray-500 cursor-default"
                                                            : "hover:bg-indigo-50 cursor-pointer transition"
                                                            }`}
                                                        onClick={() => {
                                                            if (m.member_id === "none") return;

                                                            // ✅ Auto fill
                                                            setMemberIdSearch(m.member_id);
                                                            setMemberNameSearch(m.member_name);

                                                            setValue("memberObjectId", m._id);

                                                            setValue("memberId", m.member_id);
                                                            setValue("memberName", m.member_name);
                                                            setValue("memberTamilName", m.member_tamil_name || "");
                                                            setValue("gender", m.gender || "");
                                                            setValue("phone", m.mobile_number || "");
                                                            setValue("aadhar_number", m.aadhar_number || "");
                                                            setValue("status", m.status || "");
                                                            setValue("sources", m.sources || []);

                                                            // Flatten addresses into single line
                                                            const formatAddress = (a) =>
                                                                a
                                                                    ? `${a.address}, ${a.city}, ${a.district}, ${a.state}, ${a.zip_code}, ${a.country}`
                                                                    : "";

                                                            setValue("permanent_address", m.permanent_address);
                                                            setValue("present_address", m.present_address);

                                                            setDropdownByIdFn([]);
                                                            setDropdownByNameFn([]);
                                                        }}
                                                    >
                                                        <span className="w-[250px] font-medium">
                                                            {m.member_id === "none" ? m.member_name : m.member_id}
                                                        </span>
                                                        {m.member_id !== "none" && (
                                                            <>
                                                                <span className="flex-1">{m.member_name}</span>
                                                                <span className="w-[200px] text-gray-500">
                                                                  {m.primary_contact}
                                                                </span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Non-Member Name */}
                                        <div className="relative">

                                            <RequiredLabel>Name</RequiredLabel>

                                            <input
                                                type="text"
                                                {...register("nonMemberName")}
                                                value={watch("nonMemberName") || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    // ✅ HARD STOP at 50 chars
                                                    if (val.length > 50) {
                                                        showError("nonMemberName", "Maximum 50 characters allowed");
                                                        return;
                                                    }

                                                    // ✅ manually update value (IMPORTANT)
                                                    setValue("nonMemberName", val);
                                                }}
                                                placeholder="Enter full name"
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />

                                            <CharCounter value={watch("nonMemberName")} max={50} show />

                                            {errors.nonMemberName && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.nonMemberName}
                                                </p>
                                            )}

                                        </div>

                                        {/* Tamil Name */}
                                        <div className="relative">

                                            <RequiredLabel>Tamil Name</RequiredLabel>

                                            <input
                                                type="text"
                                                {...register("nonMemberTamilName")}
                                                value={watch("nonMemberTamilName") || ""}
                                                placeholder="தமிழ் பெயர்"
                                                maxLength={50}
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    // ✅ max length control
                                                    if (val.length > 50) {
                                                        showError("nonMemberTamilName", "Maximum 50 characters allowed");
                                                        return;
                                                    }

                                                    setValue("nonMemberTamilName", val);
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />

                                            {/* ✅ Char Counter */}
                                            <CharCounter value={watch("nonMemberTamilName")} max={50} show />

                                            {/* ✅ Error */}
                                            {/* {errors.nonMemberTamilName && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.nonMemberTamilName}
                                                </p>
                                            )} */}

                                        </div>

                                        {/* Gender */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select
                                                {...register("nonMemberGender")}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="text"
                                                {...register("nonMemberPhone", {
                                                    required: "Phone number is required",
                                                    pattern: {
                                                        value: /^[0-9]{10}$/,
                                                        message: "Phone number must be exactly 10 digits",
                                                    },
                                                })}
                                                placeholder="Enter 10-digit phone no"
                                                maxLength={10}
                                                onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                        </div>

                                        {/* Aadhar */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Aadhar</label>
                                            <input
                                                type="text"
                                                {...register("nonMemberAadhar")}
                                                placeholder="XXXX XXXX XXXX"
                                                maxLength={14}
                                                onInput={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "").substring(0, 12);
                                                    e.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                        </div>

                                        {/* Permanent Address */}
                                        <div className="sm:col-span-3 relative">
                                            <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                                            <textarea
                                                {...register("nonMemberPermanentAddress")}
                                                value={watch("nonMemberPermanentAddress") || ""}
                                                placeholder="Enter Permanent Address..."
                                                maxLength={150}
                                                rows={2}
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    if (val.length > 150) {
                                                        showError("nonMemberPermanentAddress", "Maximum 150 characters allowed");
                                                        return;
                                                    }

                                                    setValue("nonMemberPermanentAddress", val);
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                            <CharCounter value={watch("nonMemberPermanentAddress")} max={150} show />

                                        </div>

                                        {/* Present Address */}
                                        <div className="sm:col-span-3 relative">
                                            <label className="block text-sm font-medium text-gray-700">Present Address</label>
                                            <textarea
                                                {...register("nonMemberPresentAddress")}
                                                value={watch("nonMemberPresentAddress") || ""}
                                                placeholder="Enter Present Address..."
                                                maxLength={150}
                                                rows={2}
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    if (val.length > 150) {
                                                        showError("nonMemberPresentAddress", "Maximum 150 characters allowed");
                                                        return;
                                                    }

                                                    setValue("nonMemberPresentAddress", val);
                                                }}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                            <CharCounter value={watch("nonMemberPresentAddress")} max={150} show />
                                        </div>
                                    </>

                                )}
                            </div>
                        </div>

                        {selectedSlots.length > 0 && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">

                                {selectedSlots.map((slot) => (
                                    <div key={slot} className="mb-6 last:mb-0">

                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-sm font-semibold text-gray-700">
                                                Burial Details - {slot} Slot
                                            </h3>

                                            {/* ⭐ NEW BURIAL TOGGLE */}
                                            <div className="relative flex bg-gray-200 rounded-full p-1 text-xs font-medium w-44">
                                                <div
                                                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                                                    style={{
                                                        width: "calc(50% - 0.25rem)",
                                                        transform: (burialType[slot] ?? true)
                                                            ? "translateX(0)"
                                                            : "translateX(100%)",
                                                    }}
                                                />

                                                <button
                                                    type="button"
                                                    // onClick={() => {
                                                    //     setBurialType(prev => ({
                                                    //         ...prev,
                                                    //         [slot]: true
                                                    //     }));


                                                    //     // reset only this slot
                                                    //     setBurialNames(prev => ({ ...prev, [slot]: "" }));
                                                    //     setBurialDates(prev => ({ ...prev, [slot]: "" }));

                                                    //     setBuriedPersonIdSearch(prev => ({ ...prev, [slot]: "" }));
                                                    //     setBuriedPersonNameSearch(prev => ({ ...prev, [slot]: "" }));

                                                    //     setBuriedMemberObjectId(prev => ({ ...prev, [slot]: null }));

                                                    //     setBuriedDropdownById(prev => ({ ...prev, [slot]: [] }));
                                                    //     setBuriedDropdownByName(prev => ({ ...prev, [slot]: [] }));
                                                    // }}


                                                    onClick={() => {
                                                        setBurialType(prev => ({
                                                            ...prev,
                                                            [slot]: true
                                                        }));
                                                    }}
                                                    className={`relative flex-1 py-1 text-center rounded-full ${(burialType[slot] ?? true) ? "text-white" : "text-gray-700"
                                                        }`}
                                                >
                                                    Member
                                                </button>

                                                <button
                                                    type="button"
                                                    // onClick={() => {
                                                    //     setBurialType(prev => ({
                                                    //         ...prev,
                                                    //         [slot]: false
                                                    //     }));


                                                    //     // reset only this slot
                                                    //     setBurialNames(prev => ({ ...prev, [slot]: "" }));
                                                    //     setBurialDates(prev => ({ ...prev, [slot]: "" }));

                                                    //     setBuriedPersonIdSearch(prev => ({ ...prev, [slot]: "" }));
                                                    //     setBuriedPersonNameSearch(prev => ({ ...prev, [slot]: "" }));

                                                    //     setBuriedMemberObjectId(prev => ({ ...prev, [slot]: null }));

                                                    //     setBuriedDropdownById(prev => ({ ...prev, [slot]: [] }));
                                                    //     setBuriedDropdownByName(prev => ({ ...prev, [slot]: [] }));
                                                    // }}

                                                    onClick={() => {
                                                        setBurialType(prev => ({
                                                            ...prev,
                                                            [slot]: false
                                                        }));
                                                    }}
                                                    className={`relative flex-1 py-1 text-center rounded-full ${burialType[slot] === false ? "text-white" : "text-gray-700"
                                                        }`}
                                                >
                                                    Non-Member
                                                </button>
                                            </div>
                                        </div>


                                        {/* 1 row 3 columns */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                            {/* Buried Name */}
                                            {/* MEMBER vs NON-MEMBER */}
                                            {(burialType[slot] ?? true) ? (
                                                <>
                                                    {/* Buried Person ID */}
                                                    {/* Buried Person ID */}
                                                    <div className="relative">



                                                        <RequiredLabel>Buried Person ID</RequiredLabel>

                                                        <input
                                                            type="text"
                                                            placeholder="Search by ID"
                                                            value={buriedPersonIdSearch[slot] || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;

                                                                setBuriedPersonIdSearch(prev => ({
                                                                    ...prev,
                                                                    [slot]: val
                                                                }));

                                                                debouncedBuriedSearchById(val, slot);
                                                            }}
                                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                        />

                                                        {/* DROPDOWN */}
                                                        {buriedDropdownById[slot]?.length > 0 && (
                                                            <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
                                                                {buriedDropdownById[slot]?.map((m) => (
                                                                    <li
                                                                        key={m.member_id}
                                                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                                                                        onClick={() => {
                                                                            // ✅ show readable ID in input
                                                                            setBuriedPersonIdSearch(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_id
                                                                            }));

                                                                            // ✅ store real ObjectId separately
                                                                            setBuriedMemberObjectId(prev => ({
                                                                                ...prev,
                                                                                [slot]: m._id
                                                                            }));

                                                                            setBuriedPersonNameSearch(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_name
                                                                            }));

                                                                            setBurialNames(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_name
                                                                            }));

                                                                            setBuriedDropdownById(prev => ({
                                                                                ...prev,
                                                                                [slot]: []
                                                                            }));
                                                                        }}
                                                                    >
                                                                        {m.member_id} — {m.member_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>



                                                    {/* Buried Person Name */}
                                                    <div className="relative">

                                                        <RequiredLabel>Buried Person Name</RequiredLabel>

                                                        <input
                                                            type="text"
                                                            placeholder="Search by Name"
                                                            value={buriedPersonNameSearch[slot] || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;

                                                                setBuriedPersonNameSearch(prev => ({
                                                                    ...prev,
                                                                    [slot]: val
                                                                }));


                                                                setBurialNames(prev => ({
                                                                    ...prev,
                                                                    [slot]: val
                                                                }));

                                                                debouncedBuriedSearchByName(val, slot);
                                                            }}
                                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                        />

                                                        {/* DROPDOWN */}
                                                        {buriedDropdownByName[slot]?.length > 0 && (
                                                            <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
                                                                {buriedDropdownByName[slot]?.map((m) => (
                                                                    <li
                                                                        key={m.member_id}
                                                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                                                                        onClick={() => {
                                                                            // ✅ ObjectId for backend
                                                                            setBuriedMemberObjectId(prev => ({
                                                                                ...prev,
                                                                                [slot]: m._id
                                                                            }));

                                                                            // ✅ Update NAME input
                                                                            setBuriedPersonNameSearch(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_name
                                                                            }));

                                                                            // ✅ Update ID input (🔥 THIS WAS MISSING)
                                                                            setBuriedPersonIdSearch(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_id
                                                                            }));

                                                                            // ✅ Set burial name
                                                                            setBurialNames(prev => ({
                                                                                ...prev,
                                                                                [slot]: m.member_name
                                                                            }));

                                                                            // ✅ Close dropdown
                                                                            setBuriedDropdownByName(prev => ({
                                                                                ...prev,
                                                                                [slot]: []
                                                                            }));
                                                                        }}
                                                                    >
                                                                        {m.member_id} — {m.member_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>



                                                </>
                                            ) : (
                                                <div className="relative">

                                                    <RequiredLabel>Buried Person Name</RequiredLabel>

                                                    <input
                                                        type="text"
                                                        placeholder="Enter buried person name"
                                                        value={burialNames[slot] || ""}
                                                        maxLength={50}
                                                        onChange={(e) => {
                                                            const val = e.target.value;

                                                            // ✅ HARD LIMIT
                                                            if (val.length > 50) {
                                                                showError(`burial_${slot}`, "Maximum 50 characters allowed");
                                                                return;
                                                            }

                                                            setBurialNames(prev => ({
                                                                ...prev,
                                                                [slot]: val
                                                            }));
                                                        }}
                                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                    />

                                                    {/* ✅ Char Counter */}
                                                    <CharCounter value={burialNames[slot] || ""} max={50} show />

                                                    {/* ✅ Error */}
                                                    {errors[`burial_${slot}`] && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors[`burial_${slot}`]}
                                                        </p>
                                                    )}

                                                </div>
                                            )}


                                            {/* Buried Date */}
                                            <div>

                                                <RequiredLabel>  Buried Date</RequiredLabel>
                                                <input
                                                    type="date"
                                                    value={burialDates[slot] || ""}
                                                    onChange={(e) =>
                                                        setBurialDates((prev) => ({
                                                            ...prev,
                                                            [slot]: e.target.value,
                                                        }))
                                                    }
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">



                            {/* Submit */}
                            <button
                                type="submit"
                                className="mt-4 px-4 py-2 bg-lavender--600 text-white rounded"
                            >
                                {viewMode === "burial"
                                    ? "Confirm Burial"
                                    : "Confirm Reservation"}
                            </button>

                        </div>
                    </div>
                </form>
          ) : null}


        </Modal>
    );
};

export default BooingSlotModel;