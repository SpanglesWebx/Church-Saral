import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const EditEndeavourEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();
    const token = window.sessionStorage.getItem("token");
  const event = location.state?.event;

  // --- Form state ---
  const [selectedEventBy, setSelectedEventBy] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]); // student competitions
  const [teacherTags, setTeacherTags] = useState([]); // teacher competition names (tags)
  const [teacherCompEvents, setTeacherCompEvents] = useState([]);
  const [eventBys, setEventBys] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [input, setInput] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const MAX_EVENTBY_LENGTH = 40;

  const [newEventByList, setNewEventByList] = useState([]); // modal working copy
  const [eventByInput, setEventByInput] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [activeField, setActiveField] = useState(null);


  // --- Class grouping helpers ---
  // classEvents here are grouped by base class name (eg "Primary") not sections.
  // structure: { className: "Primary", competitions: [{competition, title}], sections: [<original section objects>] }
  const [classEvents, setClassEvents] = useState([]);
  // original section-level events from backend (to preserve participants)
  const [originalSectionEvents, setOriginalSectionEvents] = useState([]);
  // available class groups (Primary, Junior, Secondary...) provided by backend endpoint /event/groups
  const [classGroups, setClassGroups] = useState([]);
  // all classes (with section_name) used to expand a newly-created group into sections when needed
  const [allClasses, setAllClasses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventBy, setNewEventBy] = useState("");

  const [typingField, setTypingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);


  // --- Initialize form from passed event ---
  useEffect(() => {
    if (!event) return;

    setSelectedEventBy(event.eventBy?._id || "");
    setEventName(event.eventName || "");
    setEventDate(event.eventDate ? event.eventDate.split("T")[0] : "");
    setRegisterBefore(event.registerBefore ? event.registerBefore.split("T")[0] : "");
    setVenue(event.venue || "");
    setDescription(event.description || "");
    setTags(event.studentCompetitions || []);
    setTeacherTags(event.teacherCompetitions || []);
    setTeacherCompEvents(
      event.teacherCompEvents && event.teacherCompEvents.length > 0
        ? [{ competitions: event.teacherCompEvents }]
        : [{ competitions: [{ competition: "", title: "" }] }]
    );

    // keep raw section events for participant preservation and grouping below
    const sections = event.classEvents || [];
    setOriginalSectionEvents(sections);

    // build grouped view from sections
    const groupsMap = {};
    sections.forEach((sec) => {
      // sec.className format expected "Primary - A" or similar
      const parts = (sec.className || "").split(" - ");
      const base = parts[0]?.trim() || sec.className || "Unknown";

      if (!groupsMap[base]) {
        groupsMap[base] = {
          className: base,
          competitionsMap: new Map(), // temporarily dedupe competitions & keep title preference
          sections: [],
        };
      }

      // store the section so we can preserve participants for this section later
      groupsMap[base].sections.push(sec);

      // merge competitions for the group: prefer non-empty title, first occurrence
      (sec.competitions || []).forEach((c) => {
        if (!c || !c.competition) return;
        const existing = groupsMap[base].competitionsMap.get(c.competition);
        if (!existing) {
          groupsMap[base].competitionsMap.set(c.competition, { competition: c.competition, title: c.title || "" });
        } else {
          // if existing has empty title but this one has non-empty title, prefer it
          if ((!existing.title || existing.title.trim() === "") && c.title && c.title.trim() !== "") {
            groupsMap[base].competitionsMap.set(c.competition, { competition: c.competition, title: c.title });
          }
        }
      });
    });

    // transform map into array suitable for UI
    const groupedArr = Object.values(groupsMap).map((g) => ({
      className: g.className,
      competitions: Array.from(g.competitionsMap.values()).length ? Array.from(g.competitionsMap.values()) : [{ competition: "", title: "" }],
      sections: g.sections, // keep original sections for preservation
    }));

    // If the event had no classEvents, seed a single empty group row
    setClassEvents(groupedArr.length ? groupedArr : [{ className: "", competitions: [{ competition: "", title: "" }], sections: [] }]);
  }, [event]);

  // --- Fetch class groups and full classes list and eventBys ---
  useEffect(() => {
    const fetch = async () => {
      try {
        const [gRes, allClsRes, evByRes] = await Promise.all([
          axios.get(`${URL}/endeavour-classes/event/groups`, { headers: { Authorization: token } }), // returns ["Primary","Junior"...]
          axios.get(`${URL}/endeavour-classes`, { headers: { Authorization: token } }), // returns full class docs with class_name and section_name
          axios.get(`${URL}/endeavour-events/eventby/all`, { headers: { Authorization: token } }),
        ]);
        setClassGroups(gRes.data || []); // array of group names
        setAllClasses(allClsRes.data?.classes || allClsRes.data || []); // array of {class_name, section_name, _id...}
        setEventBys(evByRes.data.eventBys || evByRes.data || []);
      } catch (err) {
        console.error("Error fetching class/groups/eventBy:", err);
      }
    };
    fetch();
  }, [token]);

  // --- Tag handlers ---
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag)) setTags((p) => [...p, newTag]);
      setInput("");
    }
  };
  const removeTag = (tagToRemove) => setTags((p) => p.filter((t) => t !== tagToRemove));

  const handleTeacherKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
      e.preventDefault();
      const newTag = teacherInput.trim();
      if (!teacherTags.includes(newTag)) setTeacherTags((p) => [...p, newTag]);
      setTeacherInput("");
    }
  };
  const removeTeacherTag = (tagToRemove) => setTeacherTags((p) => p.filter((t) => t !== tagToRemove));

  // --- Class group CRUD on UI (grouped) ---
  const addClassEvent = () => {
    setClassEvents((prev) => [...prev, { className: "", competitions: [{ competition: "", title: "" }], sections: [] }]);
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


  const handleChange = (groupIndex, compIndex, field, value) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({
        ...g,
        competitions: g.competitions.map((c) => ({ ...c })),
      }));

      // 🔴 Duplicate Class Check
      if (field === "className") {
        const duplicate = updated.findIndex(
          (g, idx) =>
            idx !== groupIndex && g.className === value
        );

        if (duplicate !== -1 && value.trim() !== "") {
          showTemporaryError(
            `class-${groupIndex}`,
            `${value} is already selected above.`
          );

          updated[groupIndex].className = "";
          return updated;
        }

        updated[groupIndex].className = value;
        return updated;
      }

      // 🔴 Duplicate Competition Check
      if (field === "competition") {
        const isDuplicate = updated[groupIndex].competitions.some(
          (c, idx) =>
            idx !== compIndex &&
            c.competition === value
        );

        if (isDuplicate && value.trim() !== "") {
          showTemporaryError(
            `comp-${groupIndex}-${compIndex}`,
            `${value} competition is already added for this class group.`
          );

          return prev; // stop update
        }

        updated[groupIndex].competitions[compIndex][field] = value;
        return updated;
      }

      // 🔵 Title Update (No validation here)
      if (field === "title") {
        updated[groupIndex].competitions[compIndex][field] = value;
        return updated;
      }

      return updated;
    });
  };


  const addCompetitionRow = (groupIndex) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({ ...g, competitions: [...g.competitions] }));
      const last = updated[groupIndex].competitions.at(-1);
      if (!last || !last.competition.trim() || !last.title.trim()) return prev;
      updated[groupIndex].competitions.push({ competition: "", title: "" });
      return updated;
    });
  };

  const deleteCompetitionRow = (groupIndex, compIndex) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({ ...g, competitions: [...g.competitions] }));
      updated[groupIndex].competitions.splice(compIndex, 1);
      if (updated[groupIndex].competitions.length === 0) updated[groupIndex].competitions = [{ competition: "", title: "" }];
      return updated;
    });
  };

  // --- Teacher comp handlers (unchanged semantics) ---
  const addTeacherCompBlock = () => setTeacherCompEvents((p) => [...p, { competitions: [{ competition: "", title: "" }] }]);
  const deleteTeacherCompBlock = (i) => setTeacherCompEvents((p) => p.filter((_, idx) => idx !== i));
  const addTeacherCompetitionRow = (blockIndex) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
      const last = updated[blockIndex].competitions.at(-1);
      if (!last || !last.competition.trim() || !last.title.trim()) return prev;
      updated[blockIndex].competitions.push({ competition: "", title: "" });
      return updated;
    });
  };
  const deleteTeacherCompetitionRow = (blockIndex, compIndex) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
      updated[blockIndex].competitions.splice(compIndex, 1);
      if (updated[blockIndex].competitions.length === 0) updated[blockIndex].competitions = [{ competition: "", title: "" }];
      return updated;
    });
  };
  const handleTeacherCompChange = (blockIndex, compIndex, field, value) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({
        ...b,
        competitions: b.competitions.map((c) => ({ ...c })),
      }));

      // 🔴 Duplicate Competition Check
      if (field === "competition") {
        const isDup = updated[blockIndex].competitions.some(
          (c, idx) =>
            idx !== compIndex && c.competition === value
        );

        if (isDup && value.trim() !== "") {
          showTemporaryError(
            `teacher-comp-${blockIndex}-${compIndex}`,
            `${value} is already added for this block`
          );

          return prev; // stop update
        }

        updated[blockIndex].competitions[compIndex][field] = value;
        return updated;
      }

      // 🔵 Title Update
      if (field === "title") {
        updated[blockIndex].competitions[compIndex][field] = value;
        return updated;
      }

      return updated;
    });
  };


  const expandGroupedToSections = (grouped) => {
    // grouped: array of {className, competitions, sections}
    const expanded = [];

    grouped.forEach((g) => {
      const groupName = g.className?.trim();
      if (!groupName) return;

      // find sections that were part of original event
      const origSectionsForGroup = (originalSectionEvents || []).filter((sec) => {
        // sec.className like "Primary - A" - match start with groupName
        return (sec.className || "").startsWith(groupName + " -") || (sec.className || "") === groupName;
      });

      // If original sections exist -> preserve participants where competition name matches
      if (origSectionsForGroup.length > 0) {
        origSectionsForGroup.forEach((sec) => {
          // For each competition in grouped g.competitions, attempt to find matching comp in sec.competitions to preserve participants
          const newComps = (g.competitions || []).map((gc) => {
            const match = (sec.competitions || []).find((sc) => sc.competition === gc.competition);
            return {
              competition: gc.competition,
              title: gc.title || (match && match.title) || "",
              participants: match ? (match.participants || []) : [],
            };
          });
          expanded.push({
            className: sec.className,
            competitions: newComps,
          });
        });
      } else {
        // No original sections in event for this group (new group)
        // use allClasses to find sections for the class group
        const sectionsFromAll = (allClasses || []).filter((c) => c.class_name === groupName);
        if (sectionsFromAll.length > 0) {
          sectionsFromAll.forEach((sec) => {
            expanded.push({
              className: `${sec.class_name} - ${sec.section_name || ""}`.trim(),
              competitions: (g.competitions || []).map((gc) => ({ competition: gc.competition, title: gc.title || "", participants: [] })),
            });
          });
        } else {
          // fallback: keep group as-is (no section info) — server will likely keep it as group or ignore
          expanded.push({
            className: groupName,
            competitions: (g.competitions || []).map((gc) => ({ competition: gc.competition, title: gc.title || "", participants: [] })),
          });
        }
      }
    });

    return expanded;
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


  // --- Submit handler ---
  const handleSubmit = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setResponse({ status: null, message: "" });

      // clean teacherCompEvents to flat array
      const teacherCompFlat = teacherCompEvents.flatMap((t) => (t.competitions || []).map((c) => ({ competition: c.competition, title: c.title })));

      // expand grouped classes to section-level preserving participants
      const expandedClassEvents = expandGroupedToSections(classEvents);

      // prepare payload
      const payload = {
        eventBy: selectedEventBy,
        eventName,
        eventDate,
        registerBefore,
        venue,
        description,
        studentCompetitions: tags,
        teacherCompetitions: teacherTags,
        classEvents: expandedClassEvents,
        teacherCompEvents: teacherCompFlat,
      };

      const res = await axios.put(`${URL}/endeavour-events/update/${event._id}`, payload, { headers: { Authorization: token } });


      setResponse({
        status: "Success",
        message: res.data.message || "Event updated successfully!",
      });
      // redirect back after short delay to show toast
      setTimeout(() => navigate("/admin/eventend"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      // setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update event" });

      setResponse({
        status: "Failed",
        message:
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while updating event",
      });
    }
    finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    if (Response?.status) {
      const timer = setTimeout(() => {
        setResponse({ status: null, message: "" });

      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Response]);


  const handlegoback = () => navigate("/admin/eventend");
  const validateMaxLength = (name, value, max = 50) => {
    if (value.length > max) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`,
      }));

      // 🔥 Auto-hide after 2.5 seconds
      setTimeout(() => {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 2500);

      return false;
    }

    setErrors((prev) => {
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
      <span
        className={`absolute bottom-1 right-2 text-[10px] ${value.length > max ? "text-red-500" : "text-gray-400"
          }`}
      >
        {value.length}/{max}
      </span>
    );
  };

  useEffect(() => {
    if (isModalOpen) {
      setNewEventByList(eventBys.map(e => e.name));
    }
  }, [isModalOpen, eventBys]);



  // --- Render ---
  return (

    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <div className="flex justify-start mt-6">
          <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">



          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-lavender--600">
              Edit Endeavour Event
            </h1>
          </div>

          {/* Event basic fields */}
          <div className="mt-6 space-y-6">

            {/* -------- Row 1 -------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Event By */}
              <div>
                <div className="flex items-center justify-between">
                  <RequiredLabel>Event By</RequiredLabel>
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
              {/* <div className="relative">
                <RequiredLabel>Event Name</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTypingField("eventName");
                      setEventName(val);

                      clearTimeout(window.eventNameTimer);
                      window.eventNameTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className="block w-full mt-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none focus:ring-0"
                  />

                  <CharCounter
                    value={eventName}
                    max={50}
                    show={typingField === "eventName"}
                  />
                </div>
              </div> */}

              <div className="relative">
                <RequiredLabel>Event Name</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => {
                      const val = e.target.value;

                      setTypingField("eventName");

                      if (validateMaxLength("eventName", val, 50)) {
                        setEventName(val);
                      }

                      clearTimeout(window.eventNameTimer);
                      window.eventNameTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className={`block w-full mt-1 rounded-md border px-3 py-2 shadow-sm sm:text-sm
      ${errors.eventName ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={eventName}
                    max={50}
                    show={typingField === "eventName"}
                  />
                </div>

                {errors.eventName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.eventName}
                  </p>
                )}
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


            {/* -------- Row 2 -------- */}
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
              {/* 
              <div className="relative">
                <RequiredLabel>Event Venue</RequiredLabel>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
                />
              </div> */}

              <div className="relative">
                <RequiredLabel>Event Venue</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => {
                      const val = e.target.value;

                      setTypingField("venue");

                      if (validateMaxLength("venue", val, 100)) {
                        setVenue(val);
                      }

                      clearTimeout(window.venueTimer);
                      window.venueTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className={`block w-full mt-1 rounded-md border px-3 py-2 shadow-sm sm:text-sm
      ${errors.venue ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={venue}
                    max={100}
                    show={typingField === "venue"}
                  />
                </div>

                {errors.venue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.venue}
                  </p>
                )}
              </div>

              <div className="relative">
                <RequiredLabel>Event Description</RequiredLabel>

                <div className="relative">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => {
                      const val = e.target.value;

                      setTypingField("description");

                      if (validateMaxLength("description", val, 150)) {
                        setDescription(val);
                      }

                      clearTimeout(window.descriptionTimer);
                      window.descriptionTimer = setTimeout(() => {
                        setTypingField(null);
                      }, 1500);
                    }}
                    className={`block w-full mt-1 rounded-md border px-3 py-2 shadow-sm sm:text-sm
      ${errors.description ? "border-red-500" : "border-gray-300"}`}
                  />

                  <CharCounter
                    value={description}
                    max={150}
                    show={typingField === "description"}
                  />
                </div>

                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>


            </div>



          </div>
          {/* ================= COMPETITIONS (2 GRID ROW) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* ================= STUDENT COMPETITIONS ================= */}
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
                  maxLength={40}
                  onChange={(e) => {
                    const val = e.target.value;

                    setTypingField("studentTag");

                    if (validateMaxLength("studentTag", val, 40)) {
                      setInput(val);
                    }

                    if (window.studentTimer) clearTimeout(window.studentTimer);

                    window.studentTimer = setTimeout(() => {
                      setTypingField(null);
                    }, 1500);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
                      e.preventDefault();
                      const newTag = input.trim();

                      if (tags.includes(newTag)) {
                        setErrors(prev => ({
                          ...prev,
                          studentTag: `"${newTag}" already added`
                        }));

                        setTimeout(() => {
                          setErrors(prev => {
                            const copy = { ...prev };
                            delete copy.studentTag;
                            return copy;
                          });
                        }, 2500);

                        return;
                      }

                      setTags(prev => [...prev, newTag]);
                      setInput("");
                    }
                  }}
                  placeholder="Type and Press Enter or Tab"
                  className={`block w-full mt-2 border rounded-md px-3 py-2 shadow-sm
      focus:outline-none focus:ring-0
      ${errors.studentTag ? "border-red-500" : "border-gray-300"}`}
                />

                <CharCounter
                  value={input}
                  max={40}
                  show={typingField === "studentTag"}
                />
              </div>


              {errors.studentTag && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.studentTag}
                </p>
              )}
            </div>

            {/* ================= TEACHER COMPETITIONS ================= */}
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
                  maxLength={40}
                  onChange={(e) => {
                    const val = e.target.value;

                    setTypingField("teacherTag");

                    if (validateMaxLength("teacherTag", val, 40)) {
                      setTeacherInput(val);
                    }

                    if (window.teacherTimer) clearTimeout(window.teacherTimer);

                    window.teacherTimer = setTimeout(() => {
                      setTypingField(null);
                    }, 1500);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
                      e.preventDefault();
                      const newTag = teacherInput.trim();

                      if (teacherTags.includes(newTag)) {
                        setErrors(prev => ({
                          ...prev,
                          teacherTag: `"${newTag}" already added`
                        }));

                        setTimeout(() => {
                          setErrors(prev => {
                            const copy = { ...prev };
                            delete copy.teacherTag;
                            return copy;
                          });
                        }, 2500);

                        return;
                      }

                      setTeacherTags(prev => [...prev, newTag]);
                      setTeacherInput("");
                    }
                  }}
                  placeholder="Type and Press Enter or Tab"
                  className={`block w-full mt-2 border rounded-md px-3 py-2 shadow-sm
      focus:outline-none focus:ring-0
      ${errors.teacherTag ? "border-red-500" : "border-gray-300"}`}
                />

                <CharCounter
                  value={teacherInput}
                  max={40}
                  show={typingField === "teacherTag"}
                />
              </div>


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

              {classEvents.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                >

                  {/* Block Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Class Event {groupIndex + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setClassEvents(prev => prev.filter((_, i) => i !== groupIndex))
                      }
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
                      value={group.className}
                      onChange={(e) =>
                        handleChange(groupIndex, 0, "className", e.target.value)
                      }
                      className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
              ${errors[`class-${groupIndex}`]
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    >
                      <option value="">-- Select Class --</option>
                      {classGroups.map((cg, idx) => (
                        <option key={idx} value={cg}>
                          {cg}
                        </option>
                      ))}
                    </select>

                    {errors[`class-${groupIndex}`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`class-${groupIndex}`]}
                      </p>
                    )}
                  </div>

                  {/* Competition Rows */}
                  <div className="space-y-4">
                    {group.competitions.map((comp, compIndex) => {
                      const isLast =
                        compIndex === group.competitions.length - 1;

                      const filled =
                        comp.competition.trim() && comp.title.trim();

                      return (
                        <div
                          key={compIndex}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="grid grid-cols-1 gap-4">

                            {/* Competition Select */}
                            <div>
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Competition
                              </label>

                              <select
                                value={comp.competition}
                                onChange={(e) =>
                                  handleChange(
                                    groupIndex,
                                    compIndex,
                                    "competition",
                                    e.target.value
                                  )
                                }
                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                        ${errors[`comp-${groupIndex}-${compIndex}`]
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

                              {errors[`comp-${groupIndex}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`comp-${groupIndex}-${compIndex}`]}
                                </p>
                              )}
                            </div>

                            {/* Title */}
                            <div className="relative">
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Title
                              </label>

                              <input
                                type="text"
                                value={comp.title}
                                // onChange={(e) =>
                                //   handleChange(
                                //     groupIndex,
                                //     compIndex,
                                //     "title",
                                //     e.target.value
                                //   )
                                // }

                                onChange={(e) => {
                                  const val = e.target.value;
                                  const key = `title-${groupIndex}-${compIndex}`;

                                  setTypingField(key);

                                  if (validateMaxLength(key, val, 60)) {
                                    handleChange(groupIndex, compIndex, "title", val);
                                  }

                                  clearTimeout(window[key]);
                                  window[key] = setTimeout(() => {
                                    setTypingField(null);
                                  }, 1500);
                                }}

                                // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm px-3 py-2"

                                className={`block w-full mt-1 rounded-md border px-3 py-2 shadow-sm sm:text-sm
        ${errors[`title-${groupIndex}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}

                              />
                              <CharCounter
                                value={comp.title}
                                max={60}
                                show={typingField === `title-${groupIndex}-${compIndex}`}

                              />

                              {errors[`title-${groupIndex}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`title-${groupIndex}-${compIndex}`]}
                                </p>
                              )}
                            </div>

                            {/* Add / Delete */}
                            <div className="flex justify-end">
                              {isLast ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addCompetitionRow(groupIndex)
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
                                    deleteCompetitionRow(groupIndex, compIndex)
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

              {teacherCompEvents.map((block, blockIndex) => (
                <div
                  key={blockIndex}
                  className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-5"
                >

                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Teacher Block {blockIndex + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTeacherCompBlock(blockIndex)
                      }
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
                                    blockIndex,
                                    compIndex,
                                    "competition",
                                    e.target.value
                                  )
                                }
                                // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"

                                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
    ${errors[`teacher-comp-${blockIndex}-${compIndex}`]
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

                              {errors[`teacher-comp-${blockIndex}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`teacher-comp-${blockIndex}-${compIndex}`]}
                                </p>
                              )}

                            </div>

                            <div className="relative">
                              <label className="block mb-1 text-sm font-medium text-gray-700">
                                Title
                              </label>

                              <input
                                type="text"
                                value={comp.title}
                                // onChange={(e) =>
                                //   handleTeacherCompChange(
                                //     blockIndex,
                                //     compIndex,
                                //     "title",
                                //     e.target.value
                                //   )
                                // }

                                onChange={(e) => {
                                  const val = e.target.value;
                                  const key = `teacher-title-${blockIndex}-${compIndex}`;

                                  setTypingField(key);

                                  if (validateMaxLength(key, val, 60)) {
                                    handleTeacherCompChange(
                                      blockIndex,
                                      compIndex,
                                      "title",
                                      val
                                    );
                                  }

                                  clearTimeout(window[key]);
                                  window[key] = setTimeout(() => {
                                    setTypingField(null);
                                  }, 1500);
                                }}

                                // className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm px-3 py-2"

                                className={`block w-full mt-1 rounded-md border px-3 py-2 shadow-sm sm:text-sm
        ${errors[`teacher-title-${blockIndex}-${compIndex}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                  }`}
                              />

                              <CharCounter
                                value={comp.title}
                                max={60}
                                show={typingField === `teacher-title-${blockIndex}-${compIndex}`}
                              />

                              {errors[`teacher-title-${blockIndex}-${compIndex}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`teacher-title-${blockIndex}-${compIndex}`]}
                                </p>
                              )}

                            </div>

                            <div className="flex justify-end">
                              {isLast ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addTeacherCompetitionRow(blockIndex)
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
                                      blockIndex,
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

          {/* Add Event By modal */}
          {/* Add Event By modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">

                  <h2 className="text-lg font-semibold mb-3 text-gray-800">
                    Add Event By
                  </h2>

                  {/* ================= TAGS ================= */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newEventByList.map((tag, i) => {
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
                              setNewEventByList(prev =>
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

                  {/* ================= INPUT ================= */}
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

                          const value = eventByInput.trim();

                          if (!newEventByList.includes(value)) {
                            setNewEventByList(prev => [...prev, value]);
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

                  {/* ================= BUTTONS ================= */}
                  <div className="flex justify-end gap-2 mt-5">

                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setNewEventByList([]);
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
                            { names: newEventByList },
                            { headers: { Authorization: token } }
                          );

                          // 🔥 Update dropdown immediately
                          setEventBys(res.data.eventBys);

                          if (res.data.eventBys.length > 0) {
                            setSelectedEventBy(
                              res.data.eventBys[
                                res.data.eventBys.length - 1
                              ]._id
                            );
                          }

                          setResponse({
                            status: "Success",
                            message: "Event By updated successfully!",
                          });

                          setIsModalOpen(false);
                          setNewEventByList([]);
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


          <div className="flex justify-end mt-6">
            {/* <button onClick={handleSubmit} className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Update Event</button> */}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white flex items-center gap-2
    ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600 hover:bg-lavender--700"}
  `}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {saving ? "Updating..." : "Update Event"}
            </button>


          </div>
        </div>

        {Response?.status === "Success" && (
          <SuccessMessage Message={Response.message} />
        )}

        {Response?.status === "Failed" && (
          <FailedMessage Message={Response.message} />
        )}



      </div>

    </>
  );
};







