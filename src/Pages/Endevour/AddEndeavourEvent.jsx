























import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AddEndeavourEvent = () => {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [classEvents, setClassEvents] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [teacherTags, setTeacherTags] = useState([]);
  const [teacherInput, setTeacherInput] = useState("");
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
    const token = window.sessionStorage.getItem("token");
  const [eventBys, setEventBys] = useState([]);
  const [eventByInput, setEventByInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventBy, setNewEventBy] = useState([]);
  const [selectedEventBy, setSelectedEventBy] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [teacherCompEvents, setTeacherCompEvents] = useState([]);

  const [typingField, setTypingField] = useState(null);

  const [activeField, setActiveField] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const MAX_EVENTBY_LENGTH = 40;

  const [modalSaving, setModalSaving] = useState(false);



  // Add competition tag



  const MAX_TAG_LENGTH = 40;

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();

      const newTag = input.trim();

      // Length validation
      if (!validateMaxLength("studentTag", newTag, MAX_TAG_LENGTH)) {
        return;
      }

      // Duplicate protection
      if (tags.includes(newTag)) {
        setErrors(prev => ({
          ...prev,
          // studentTag: "Competition already added",
          studentTag: `"${newTag}" already added`,
        }));
        return;
      }

      setTags([...tags, newTag]);
      setInput("");
      setTypingField(null);

      // Clear error
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.studentTag;
        return copy;
      });
    }
  };


  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTeacherKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
      e.preventDefault();

      const newTag = teacherInput.trim();

      // Length validation
      if (!validateMaxLength("teacherTag", newTag, MAX_TAG_LENGTH)) {
        return;
      }

      // Duplicate protection
      if (teacherTags.includes(newTag)) {
        setErrors(prev => ({
          ...prev,
          teacherTag: `"${newTag}" already added`,
        }));
        return;
      }

      setTeacherTags([...teacherTags, newTag]);
      setTeacherInput("");
      setTypingField(null);

      // Clear error
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.teacherTag;
        return copy;
      });
    }
  };

  const removeTeacherTag = (tagToRemove) => {
    setTeacherTags(teacherTags.filter((tag) => tag !== tagToRemove));
  };



  // Add class block
  const addClassEvent = () => {
    setClassEvents((prev) => [
      ...prev,
      {
        id: Date.now(), // unique id
        className: "",
        competitions: [{ competition: "", title: "" }],
      },
    ]);
  };


  // Add competition row (only if last one is filled)
  const addCompetitionRow = (id) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const last = event.competitions.at(-1);
        if (!last || !last.competition.trim() || !last.title.trim()) {
          return event;
        }

        return {
          ...event,
          competitions: [
            ...event.competitions,
            { competition: "", title: "" },
          ],
        };
      })
    );
  };


  // Delete a competition row
  const deleteCompetitionRow = (id, compIndex) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const updatedCompetitions = [...event.competitions];
        updatedCompetitions.splice(compIndex, 1);

        if (updatedCompetitions.length === 0) {
          updatedCompetitions.push({ competition: "", title: "" });
        }

        return {
          ...event,
          competitions: updatedCompetitions,
        };
      })
    );
  };
  const showTemporaryError = (key, message) => {
    setErrors((prev) => ({
      ...prev,
      [key]: message,
    }));

    setTimeout(() => {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2000); // ⏳ 2 seconds
  };



  const handleChange = (id, compIndex, field, value) => {
    setClassEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        let newErrors = { ...errors };

        // 🔴 Duplicate Class Check
        if (field === "className") {
          const duplicate = prev.some(
            (e) => e.id !== id && e.className === value
          );

          if (duplicate && value.trim() !== "") {
            showTemporaryError(
              `class-${id}`,
              `${value} is already selected above.`
            );

            return { ...event, className: "" };
          }

          return { ...event, className: value };
        }


        // 🔴 Duplicate Competition Check
        if (field === "competition") {
          const exists = event.competitions.some(
            (c, i) =>
              i !== compIndex && c.competition === value
          );

          if (exists && value.trim() !== "") {
            showTemporaryError(
              `comp-${id}-${compIndex}`,
              `${value} already added for this class.`
            );

            return event;
          }
        }


        // 🔴 Title Validation (60)
        if (field === "title") {
          const key = `title-${id}-${compIndex}`;

          if (!validateMaxLength(key, value, 60)) {
            return event;
          }
        }

        const updatedCompetitions = [...event.competitions];
        updatedCompetitions[compIndex][field] = value;

        return {
          ...event,
          competitions: updatedCompetitions,
        };
      })
    );
  };





  const addTeacherCompBlock = () => {
    setTeacherCompEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        competitions: [{ competition: "", title: "" }],
      },
    ]);
  };


  const deleteTeacherCompBlock = (id) => {
    setTeacherCompEvents((prev) =>
      prev.filter((block) => block.id !== id)
    );
  };


  const addTeacherCompetitionRow = (id) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        const last = block.competitions.at(-1);
        if (!last || !last.competition.trim() || !last.title.trim()) {
          return block;
        }

        return {
          ...block,
          competitions: [
            ...block.competitions,
            { competition: "", title: "" },
          ],
        };
      })
    );
  };


  const deleteTeacherCompetitionRow = (id, compIndex) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        const updatedCompetitions = [...block.competitions];
        updatedCompetitions.splice(compIndex, 1);

        if (updatedCompetitions.length === 0) {
          updatedCompetitions.push({ competition: "", title: "" });
        }

        return {
          ...block,
          competitions: updatedCompetitions,
        };
      })
    );
  };


  const handleTeacherCompChange = (id, compIndex, field, value) => {
    setTeacherCompEvents((prev) =>
      prev.map((block) => {
        if (block.id !== id) return block;

        const updatedCompetitions = block.competitions.map((c) => ({ ...c }));

        // 🔴 Duplicate Competition Check
        if (field === "competition") {
          const isDuplicate = updatedCompetitions.some(
            (c, idx) =>
              idx !== compIndex &&
              c.competition === value
          );

          if (isDuplicate && value.trim() !== "") {
            showTemporaryError(
              `teacher-comp-${id}-${compIndex}`,
              `${value} is already added for this block`
            );

            return block; // stop update
          }
        }

        // 🔴 Title Length Validation (60)
        if (field === "title") {
          const key = `teacher-title-${id}-${compIndex}`;

          if (!validateMaxLength(key, value, 60)) {
            return block; // stop update if invalid
          }
        }

        // ✅ Update value
        updatedCompetitions[compIndex][field] = value;

        return {
          ...block,
          competitions: updatedCompetitions,
        };
      })
    );
  };





  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes/event/groups`, {
          headers: { Authorization: token },
        });
        setClasses(res.data || []); // this will now be ["Primary", "Junior", "Senior"]
      } catch (err) {
        console.error("Error fetching event class groups:", err);
      }
    };
    fetchClasses();
  }, [token]);


  useEffect(() => {
    const fetchEventBys = async () => {
      try {
        // const res = await axios.get(`${URL}/endeavour-eventby`, {
        //     headers: { Authorization: token },
        // });
        const res = await axios.get(`${URL}/endeavour-events/eventby/all`, { headers: { Authorization: token } });
        setEventBys(res.data.eventBys || res.data || []);
      } catch (err) {
        console.error("Error fetching Event By:", err);
      }
    };
    fetchEventBys();
  }, [token]);

  useEffect(() => {
    if (isModalOpen) {
      setNewEventBy(eventBys.map(e => e.name));
    }
  }, [isModalOpen, eventBys]);




  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaving]);




  const validateForm = () => {

    const newErrors = {};

    if (!selectedEventBy) newErrors.eventBy = "Event By is required";
    if (!eventName?.trim()) newErrors.eventName = "Event Name is required";
    if (!eventDate) newErrors.eventDate = "Event Date is required";
    if (!registerBefore) newErrors.registerBefore = "Register Before is required";
    if (!venue?.trim()) newErrors.venue = "Venue is required";

    // 🔴 Date logic validation
    if (eventDate && registerBefore) {
      if (new Date(registerBefore) > new Date(eventDate)) {
        newErrors.registerBefore =
          "Register Before cannot be after Event Date";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {

    // 🔴 Prevent double click
    if (isSaving) return;

    // 🔴 Frontend validation
    if (!validateForm()) {

      setResponse({
        status: "Failed",
        message: "Please fix validation errors",
      });

      // Scroll to first error
      setTimeout(() => {
        document.querySelector(".border-red-500")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);

      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        eventBy: selectedEventBy,
        eventName: eventName.trim(),
        eventDate,
        registerBefore,
        venue: venue.trim(),
        description: description.trim(),
        studentCompetitions: tags,
        teacherCompetitions: teacherTags,
        classEvents,
        teacherCompEvents: teacherCompEvents.flatMap(t =>
          t.competitions.map(c => ({
            competition: c.competition,
            title: c.title
          }))
        ),
      };

      const res = await axios.post(
        `${URL}/endeavour-events/add`,
        payload,
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data?.message || "Event saved successfully",
      });

      // Reset form
      setTags([]);
      setTeacherTags([]);
      setClassEvents([]);
      setErrors({});

      // setTimeout(() => navigate("/admin/eventend"), 2000);
      // setTimeout(() => {
      //   navigate("/admin/eventend");
      //   setIsSaving(false); // 🔥 move here
      // }, 2000);
      navigate("/admin/eventend")

    } catch (err) {

      const backendErrors = err.response?.data?.errors || {};
      const message =
        err.response?.data?.message || "Failed to save event";

      if (Object.keys(backendErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }

      setResponse({
        status: "Failed",
        message
      });
      setIsSaving(false);

    }
  };


  const navigate = useNavigate();
  const handlegoback = () => {
    navigate("/admin/eventend");
  };

  const deleteClassEventBlock = (id) => {
    setClassEvents((prev) =>
      prev.filter((event) => event.id !== id)
    );
  };


  const validateMaxLength = (name, value, max = 50) => {
    if (value.length > max) {
      setErrors(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`
      }));
      return false;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
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

    return (
      <span className={`absolute bottom-1 right-2 text-[10px]
      ${value.length > max ? "text-red-500" : "text-gray-400"}`}>
        {value.length}/{max}
      </span>
    );
  };


  return (
    <>


      <div
        className={`relative ${isSaving ? "pointer-events-none opacity-60 blur-sm" : ""
          }`}
      >
        <div className="flex justify-start mt-6">
          <FaArrowLeft
            size={18}
            onClick={handlegoback}
            className="cursor-pointer"
            title="go back"
          />
        </div>

        <div className="p-4 mx-1 mt-3 bg-white rounded-xl shadow-md">

          {/* ================= HEADER ================= */}


          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-lavender--600">
              Add Endeavour Event
            </h1>
          </div>

          {/* ================= EVENT BASIC DETAILS ================= */}
          <div className="mt-6 space-y-6">

            {/* -------- Row 1 (3 Grid) -------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Event By */}
              <div>
                <div className="flex items-center justify-between">
                  <RequiredLabel> Event By</RequiredLabel>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm font-medium text-lavender--600"
                  >
                    Add Event By
                  </button>
                </div>

                <select
                  value={selectedEventBy}
                  onChange={(e) => setSelectedEventBy(e.target.value)}
                  className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                >
                  <option value="">-- Select Event By --</option>
                  {eventBys.map((eb) => (
                    <option key={eb._id} value={eb._id}>
                      {eb.name}
                    </option>
                  ))}
                </select>
              </div>


              {/* Event Name */}
              <div className="relative">
                <RequiredLabel>Event Name</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => {
                      const val = e.target.value;

                      // 🔥 show counter only while typing
                      setTypingField("eventName");

                      if (validateMaxLength("eventName", val, 50)) {
                        setEventName(val);
                      }

                      // Hide counter after 1.5s of no typing
                      clearTimeout(window.eventNameTimer);
                      window.eventNameTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className="block w-full mt-1 border border-gray-300 rounded-md px-3 py-2    shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm
        focus:outline-none focus:ring-0"
                  />

                  {/* Character Counter (Only while typing) */}
                  <CharCounter
                    value={eventName}
                    max={50}
                    show={typingField === "eventName"}
                  />

                  {errors.eventName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventName}
                    </p>
                  )}
                </div>
              </div>




              {/* Event Date */}
              <div>

                <RequiredLabel>Event Date</RequiredLabel>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                />
              </div>
            </div>

            {/* -------- Row 2 (3 Grid) -------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <RequiredLabel>Register Before</RequiredLabel>
                <input
                  type="date"
                  value={registerBefore}
                  onChange={(e) => setRegisterBefore(e.target.value)}
                  className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                />
              </div>
              <div className="relative">
                <RequiredLabel>Event Venue</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => {
                      const val = e.target.value;

                      // show counter only while typing
                      setTypingField("venue");

                      if (validateMaxLength("venue", val, 100)) {
                        setVenue(val);
                      }

                      clearTimeout(window.venueTimer);
                      window.venueTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                  />

                  <CharCounter
                    value={venue}
                    max={100}
                    show={typingField === "venue"}
                  />

                  {errors.venue && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.venue}
                    </p>
                  )}
                </div>
              </div>


              <div className="relative">
                <RequiredLabel>Event Description</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => {
                      const val = e.target.value;

                      // show counter while typing
                      setTypingField("description");

                      if (validateMaxLength("description", val, 150)) {
                        setDescription(val);
                      }

                      clearTimeout(window.descriptionTimer);
                      window.descriptionTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                  />

                  <CharCounter
                    value={description}
                    max={150}
                    show={typingField === "description"}
                  />

                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* ================= COMPETITIONS (2 GRID ROW) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Student Competitions */}
              <div className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                <RequiredLabel>Student Competitions</RequiredLabel>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center px-2 py-1 text-sm bg-gray-200 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-600 hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    maxLength={MAX_TAG_LENGTH}
                    onChange={(e) => {
                      const val = e.target.value;

                      setTypingField("studentTag");

                      if (validateMaxLength("studentTag", val, MAX_TAG_LENGTH)) {
                        setInput(val);
                      }

                      clearTimeout(window.studentTimer);
                      window.studentTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and Press Enter or Tab"
                    className={`block w-full mt-2 border rounded-md px-3 py-2   border-gray-300 shadow-sm
        focus:outline-none focus:ring-0
        ${errors.studentTag ? "border-red-500" : "border-gray-300"}`}
                  />

                  {/* Character Counter */}
                  <CharCounter
                    value={input}
                    max={MAX_TAG_LENGTH}
                    show={typingField === "studentTag"}
                  />
                </div>

                {/* Error */}
                {errors.studentTag && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.studentTag}
                  </p>
                )}
              </div>


              {/* Teacher Competitions */}
              <div className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                <RequiredLabel>Teacher Competitions</RequiredLabel>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {teacherTags.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center px-2 py-1 text-sm bg-gray-200 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-600 hover:text-red-500"
                        onClick={() => removeTeacherTag(tag)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={teacherInput}
                    maxLength={MAX_TAG_LENGTH}
                    onChange={(e) => {
                      const val = e.target.value;

                      setTypingField("teacherTag");

                      if (validateMaxLength("teacherTag", val, MAX_TAG_LENGTH)) {
                        setTeacherInput(val);
                      }

                      clearTimeout(window.teacherTimer);
                      window.teacherTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    onKeyDown={handleTeacherKeyDown}
                    placeholder="Type and Press Enter or Tab"
                    className={`block w-full mt-2 border rounded-md px-3 py-2  border-gray-300 shadow-sm
        focus:outline-none focus:ring-0
        ${errors.teacherTag ? "border-red-500" : "border-gray-300"}`}
                  />

                  {/* Character Counter */}
                  <CharCounter
                    value={teacherInput}
                    max={MAX_TAG_LENGTH}
                    show={typingField === "teacherTag"}
                  />
                </div>

                {/* Error */}
                {errors.teacherTag && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.teacherTag}
                  </p>
                )}
              </div>

            </div>

            {/* ================= BUTTON GRID 2 (TOP) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <button
                onClick={addClassEvent}
                className="w-full px-5 py-2 text-white bg-lavender--600 rounded-md hover:bg-lavender--700 transition"
              >
                Add Event for Class
              </button>

              <button
                onClick={addTeacherCompBlock}
                className="w-full px-5 py-2 text-white bg-lavender--600 rounded-md hover:bg-lavender--700 transition"
              >
                Add Teacher Competitions
              </button>

            </div>



            {/* ================= BLOCK GRID ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              {/* ================= LEFT COLUMN - CLASS EVENTS ================= */}
              <div className="space-y-6">

                {classEvents.length > 0 && classEvents.map((classEvent, classIndex) => (
                  <div
                    key={classEvent.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                  >

                    {/* Block Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Class Event {classIndex + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => deleteClassEventBlock(classEvent.id)}

                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    {/* Class Selection */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Select Class
                      </label>

                      <select
                        value={classEvent.className}
                        onChange={(e) =>
                          handleChange(classEvent.id, 0, "className", e.target.value)
                        }
                        // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"

                        className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`class-${classEvent.id}`]
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}

                      >
                        <option value="">-- Select Class --</option>
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>

                      {errors[`class-${classEvent.id}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`class-${classEvent.id}`]}
                        </p>
                      )}
                    </div>

                    {/* Competition Rows */}
                    <div className="space-y-4">
                      {classEvent.competitions.map((comp, compIndex) => {
                        const isLast =
                          compIndex === classEvent.competitions.length - 1;
                        const filled =
                          comp.competition.trim() && comp.title.trim();

                        return (
                          <div
                            key={compIndex}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                          >
                            <div className="grid grid-cols-1 gap-4">

                              <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                  Competition
                                </label>
                                <select
                                  value={comp.competition}
                                  onChange={(e) =>
                                    handleChange(
                                      classEvent.id,
                                      compIndex,
                                      "competition",
                                      e.target.value
                                    )
                                  }
                                  // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"

                                  className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`comp-${classEvent.id}-${compIndex}`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                    }`}

                                >
                                  <option value="">-- Select Competition --</option>
                                  {tags.map((t, i) => (
                                    <option key={i} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>

                                {errors[`comp-${classEvent.id}-${compIndex}`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`comp-${classEvent.id}-${compIndex}`]}
                                  </p>
                                )}

                              </div>

                              <div className="relative">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                  Title
                                </label>

                                <div className="relative">
                                  <input
                                    type="text"
                                    value={comp.title}
                                    onChange={(e) => {
                                      const val = e.target.value;

                                      const key = `title-${classEvent.id}-${compIndex}`;

                                      setTypingField(key);

                                      handleChange(
                                        classEvent.id,
                                        compIndex,
                                        "title",
                                        val
                                      );

                                      clearTimeout(window[key]);
                                      window[key] = setTimeout(() => {
                                        setTypingField(null);
                                      }, 1500);
                                    }}
                                    className={`block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm
        focus:outline-none focus:ring-0
        ${errors[`title-${classEvent.id}-${compIndex}`]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                      }`}
                                  />

                                  <CharCounter
                                    value={comp.title}
                                    max={60}
                                    show={
                                      typingField ===
                                      `title-${classEvent.id}-${compIndex}`
                                    }
                                  />
                                </div>

                                {errors[`title-${classEvent.id}-${compIndex}`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`title-${classEvent.id}-${compIndex}`]}
                                  </p>
                                )}
                              </div>


                              <div className="flex justify-end">
                                {isLast ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addCompetitionRow(classEvent.id)
                                    }
                                    disabled={!filled}
                                    className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                        ${filled
                                        ? "bg-lavender--600"
                                        : "bg-lavender--600 opacity-50 cursor-not-allowed"
                                      }`}
                                  >
                                    <FaPlus size={14} />
                                    Add
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    // onClick={() =>
                                    //   deleteCompetitionRow(
                                    //     classIndex,
                                    //     compIndex
                                    //   )
                                    // }

                                    onClick={() =>
                                      deleteCompetitionRow(
                                        classEvent.id,
                                        compIndex
                                      )
                                    }


                                    className="px-4 py-2 rounded-md bg-red-500 text-white flex items-center gap-2 hover:bg-red-600"
                                  >
                                    <FaTrash size={14} />
                                    Delete
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}

              </div>



              {/* ================= RIGHT COLUMN - TEACHER EVENTS ================= */}
              <div className="space-y-6">

                {teacherCompEvents.length > 0 && teacherCompEvents.map((block, blockIndex) => (
                  <div
                    key={block.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                  >

                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Teacher Block {blockIndex + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => deleteTeacherCompBlock(block.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {block.competitions.map((comp, compIndex) => {
                        const isLast =
                          compIndex === block.competitions.length - 1;
                        const filled =
                          comp.competition.trim() && comp.title.trim();

                        return (
                          <div
                            key={compIndex}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                          >
                            <div className="grid grid-cols-1 gap-4">

                              <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                  Competition
                                </label>
                                <select
                                  value={comp.competition}
                                  onChange={(e) =>
                                    handleTeacherCompChange(
                                      block.id,
                                      compIndex,
                                      "competition",
                                      e.target.value
                                    )
                                  }
                                  // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"

                                  className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
  ${errors[`teacher-comp-${block.id}-${compIndex}`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                    }`}

                                >
                                  <option value="">-- Select Competition --</option>
                                  {teacherTags.map((t, i) => (
                                    <option key={i} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>

                                {errors[`teacher-comp-${block.id}-${compIndex}`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`teacher-comp-${block.id}-${compIndex}`]}
                                  </p>
                                )}

                              </div>

                              {/* <div>
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Title
                              </label>
                              <input
                                type="text"
                                value={comp.title}
                                onChange={(e) =>
                                  handleTeacherCompChange(
                                    block.id,
                                    compIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm"
                              />
                            </div> */}

                              <div className="relative">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                  Title
                                </label>

                                <div className="relative">
                                  <input
                                    type="text"
                                    value={comp.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const key = `teacher-title-${block.id}-${compIndex}`;

                                      setTypingField(key);

                                      handleTeacherCompChange(
                                        block.id,
                                        compIndex,
                                        "title",
                                        val
                                      );

                                      clearTimeout(window[key]);
                                      window[key] = setTimeout(() => {
                                        setTypingField(null);
                                      }, 1500);
                                    }}
                                    className={`block w-full mt-1 rounded-md border border-gray-300 shadow-sm focus:ring-lavender--600 focus:border-lavender--600 sm:text-sm
        focus:outline-none focus:ring-0
        ${errors[`teacher-title-${block.id}-${compIndex}`]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                      }`}
                                  />

                                  <CharCounter
                                    value={comp.title}
                                    max={60}
                                    show={
                                      typingField ===
                                      `teacher-title-${block.id}-${compIndex}`
                                    }
                                  />
                                </div>

                                {errors[`teacher-title-${block.id}-${compIndex}`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`teacher-title-${block.id}-${compIndex}`]}
                                  </p>
                                )}
                              </div>


                              <div className="flex justify-end">
                                {isLast ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addTeacherCompetitionRow(block.id)
                                    }
                                    disabled={!filled}
                                    className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                        ${filled
                                        ? "bg-lavender--600"
                                        : "bg-lavender--600 opacity-50 cursor-not-allowed"
                                      }`}
                                  >
                                    <FaPlus size={14} />
                                    Add
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteTeacherCompetitionRow(
                                        block.id,
                                        compIndex
                                      )
                                    }
                                    className="px-4 py-2 rounded-md bg-red-500 text-white flex items-center gap-2 hover:bg-red-600"
                                  >
                                    <FaTrash size={14} />
                                    Delete
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}

              </div>

            </div>



          </div>




          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">

                  <h2 className="text-lg font-semibold mb-3 text-gray-800">
                    Add Event By
                  </h2>

                  {/* ================== TAG DISPLAY ================== */}
                  <div className="flex flex-wrap gap-2 mb-3">

                    {newEventBy.map((tag, i) => {
                      const existsInDB = eventBys.some(
                        e => e.name.toLowerCase() === tag.toLowerCase()
                      );

                      return (
                        <span
                          key={i}
                          className={`flex items-center px-2 py-1 rounded-full text-sm text-white
                  ${existsInDB ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-2 text-white hover:text-gray-200"
                            onClick={() =>
                              setNewEventBy(prev =>
                                prev.filter((_, index) => index !== i)
                              )
                            }
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}

                  </div>

                  {/* ================== INPUT ================== */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type and press Enter or Tab"
                      value={eventByInput}
                      maxLength={MAX_EVENTBY_LENGTH}
                      onFocus={() => setActiveField("eventByModal")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setEventByInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === "Tab") &&
                          eventByInput.trim()
                        ) {
                          e.preventDefault();

                          const newTag = eventByInput.trim();

                          if (!newEventBy.includes(newTag)) {
                            setNewEventBy(prev => [...prev, newTag]);
                          }

                          setEventByInput("");
                        }
                      }}
                      className="border border-gray-300 rounded-lg block w-full p-2.5"
                    />

                    <CharCounter
                      value={eventByInput}
                      max={MAX_EVENTBY_LENGTH}
                      show={activeField === "eventByModal"}
                    />
                  </div>

                  {/* ================== BUTTONS ================== */}
                  <div className="flex justify-end gap-2 mt-5">

                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setNewEventBy([]);
                        setEventByInput("");
                      }}
                      className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={async () => {
                        if (modalSaving) return;

                        try {
                          setModalSaving(true);

                          const res = await axios.put(
                            `${URL}/endeavour-events/eventby/update`,
                            { names: newEventBy },
                            { headers: { Authorization: token } }
                          );

                          // 🔥 Update dropdown instantly
                          setEventBys(res.data.eventBys);

                          if (res.data.eventBys.length > 0) {
                            setSelectedEventBy(
                              res.data.eventBys[res.data.eventBys.length - 1]._id
                            );
                          }

                          setResponse({
                            status: "Success",
                            message: "Event By updated successfully!",
                          });

                          setIsModalOpen(false);
                          setNewEventBy([]);
                          setEventByInput("");

                        } catch (err) {
                          setResponse({
                            status: "Failed",
                            message:
                              err.response?.data?.message ||
                              "Failed to update Event By",
                          });
                        } finally {
                          setModalSaving(false);
                        }
                      }}
                      disabled={modalSaving}
                      className={`px-4 py-2 text-white rounded-lg flex items-center gap-2
              ${modalSaving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-lavender--600 hover:bg-lavender--700"
                        }`}
                    >
                      {modalSaving && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {modalSaving ? "Saving..." : "Save"}
                    </button>

                  </div>

                </div>
              </div>
            </div>
          )}


          {/* ================= SAVE BUTTON ================= */}
          <div className="flex justify-end mt-8">
            {/* <button
            onClick={handleSubmit}
            className="px-6 py-2 text-white bg-lavender--600 rounded-md hover:bg-lavender--700"
          >
            Save Event
          </button> */}

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`px-6 py-2 text-white rounded-md transition
    ${isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"
                }`}
            >
              {isSaving ? "Saving..." : "Save Event"}
            </button>

          </div>

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
