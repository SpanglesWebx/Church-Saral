
import React, { useEffect, useState } from 'react'
import { FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from 'axios';
import Modal from '../../Components/Expense/ExpenseFormModal';
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";

export const MenFellowEvent = () => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
    const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditParticipantsModalOpen, setIsEditParticipantsModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isAddPrizeModalOpen, setIsAddPrizeModalOpen] = useState(false);
  const [prizeTags, setPrizeTags] = useState([]);
  const [prizeInput, setPrizeInput] = useState("");
  const [availablePrizes, setAvailablePrizes] = useState([]);
  const [members, setMembers] = useState([]); // Women fellowship members
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- New states for Add Participants modal (completed logic) ---
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false);
  const [addSelectedCompetitionId, setAddSelectedCompetitionId] = useState("");
  const [addSelectedCompetitionTitle, setAddSelectedCompetitionTitle] = useState("");
  const [menMembers, setMenMembers] = useState([]); // data from /api/womens-fellowship
  const [selectedMembers, setSelectedMembers] = useState([]); // ids or objects
  const [participantBlocks, setParticipantBlocks] = useState([]); // used in fallback add modal if needed
  const [isSavingParticipants, setIsSavingParticipants] = useState(false);
  const [existingPrizes, setExistingPrizes] = useState([]);

  const getMemberId = (member) => String(member?._id || member);

  // Fetch events with search, date filters, and pagination
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${URL}/men-events/all`, {
        params: {
          search,
          startDate,
          endDate,
          page: CurrentPage,
          limit: rowsPerPage
        },
        headers: { Authorization: token },
      });

      if (res.data.status === "Success") {
        setEvents(res.data.events || []);

        setTotalPages(res.data.totalPages || 1);
      } else {
        setResponse({ status: "Failed", message: res.data.message || "Failed to fetch events" });
      }
    } catch (err) {
      console.error("Error fetching women events:", err);
      setResponse({ status: "Failed", message: "Error fetching events" });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [CurrentPage, rowsPerPage, search, startDate, endDate]);

  // Fetch a single event by id and update local events state
  const fetchEventById = async (id) => {
    try {
      const res = await axios.get(`${URL}/men-events/${id}`, { headers: { Authorization: token } });
      if (res.data?.status === "Success" && res.data.event) {
        setSelectedEvent(res.data.event);
        setEvents(prev => prev.map(ev => ev._id === res.data.event._id ? res.data.event : ev));
      }
    } catch (err) {
      console.error("Error fetching event by id:", err);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleAddEvent = () => navigate("/admin/menfellowevent/addevent");
  const handleEditEvent = (event) => navigate(`/admin/menfellowevent/editevent/${event._id}`, { state: { event } });

  // Save prizes for a given competition inside an event
  const savePrizes = async () => {

    if (!selectedEvent || !selectedCompetition) return;

    setIsSaving(true);

    try {

      const eventId = selectedEvent._id;
      const competitionId = selectedCompetition.competition._id;

      const prizes = selectedCompetition.competition.participants.map((p) => ({
        member: p.member?._id || p.member,
        prize: p.prize || ""
      }));

      const res = await axios.put(
        `${URL}/men-events/prizes/add`,
        { eventId, competitionId, prizes },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data?.message || "Prizes saved successfully!"
      });

      await fetchEventById(eventId);
      await fetchEvents();

    } catch (error) {

      setResponse({
        status: "Failed",
        message: error.response?.data?.message || "Failed to save prizes"
      });

    } finally {

      setIsSaving(false);

    }

  };

  // Fetch available prize types
  const fetchPrizes = async () => {
    try {
      const res = await axios.get(`${URL}/men-events/prizes/list`, { headers: { Authorization: token } });
      if (res.data.status === "Success") setAvailablePrizes(res.data.prizes || []);
    } catch (err) {
      console.error("Error fetching women prizes:", err);
    }
  };

  useEffect(() => { fetchPrizes(); }, []);

  // --- Fetch women fellowship members (for Add Participants modal) ---
  const fetchMenMembers = async () => {
    try {

      const res = await axios.get(
        `${URL}/mens-fellowship`,
        { headers: { Authorization: token } }
      );

      const members = res.data?.data || [];

      setMenMembers(members);

    } catch (err) {
      console.error("Error fetching Men fellowship members:", err);
    }
  };

  // toggle member selection (by id)
  const toggleMemberSelection = (memberId) => {

    const id = String(memberId);

    setSelectedMembers(prev => {

      if (prev.includes(id)) {
        return prev.filter(m => m !== id);
      }

      return [...prev, id];

    });

  };

  // Open Add Participants modal for a given event
  const openAddParticipantsModal = (event) => {

    setSelectedEvent(event);

    setShowAddParticipantsModal(true);

    setAddSelectedCompetitionId("");

    setAddSelectedCompetitionTitle("");

    setSelectedMembers([]);

    setMenMembers([]);

  };


  // Save participants (POST /women-events/participants/add)
  const saveParticipants = async () => {

    if (isSavingParticipants) return;

    try {

      if (!selectedEvent) {
        return setResponse({ status: "Failed", message: "No event selected" });
      }

      if (!addSelectedCompetitionId) {
        return setResponse({ status: "Failed", message: "Please select a competition" });
      }

      if (!selectedMembers.length) {
        return setResponse({ status: "Failed", message: "Select at least one member" });
      }

      setIsSavingParticipants(true);

      const participants = selectedMembers.map(id => ({
        member: id,
        prize: ""
      }));

      const payload = {
        eventId: selectedEvent._id,
        participants: [
          {
            competitionId: addSelectedCompetitionId,
            members: selectedMembers.map(id => ({
              member: id,
              prize: ""
            }))
          }
        ]
      };

      const res = await axios.post(
        `${URL}/men-events/participants/add`,
        payload,
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data?.message || "Participants added successfully"
      });

      setShowAddParticipantsModal(false);
      setSelectedMembers([]);

      await fetchEventById(selectedEvent._id);
      await fetchEvents();

    } catch (err) {

      console.error("Error saving participants:", err);

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to save participants"
      });

    } finally {
      setIsSavingParticipants(false);
    }
  };

  // Edit Participants (PUT /women-events/participants/update)
  const handleSaveEditParticipants = async () => {

    if (!selectedCompetition) return;

    const updatedParticipants =
      selectedCompetition.competition.participants
        .filter(p => p.selected !== false);

    if (!updatedParticipants.length) {
      return setResponse({
        status: "Failed",
        message: "No participants selected"
      });
    }

    try {

      setIsSaving(true);

      const res = await axios.put(
        `${URL}/men-events/participants/update`,
        {
          eventId: selectedCompetition.eventId,
          competitionId: selectedCompetition.competition._id,
          participants: updatedParticipants.map(p => ({
            member: p.member,
            prize: p.prize || ""
          }))
        },
        { headers: { Authorization: token } }
      );

      await fetchEventById(selectedCompetition.eventId);

      setIsEditParticipantsModalOpen(false);
      setSelectedCompetition(null);

      setResponse({
        status: "Success",
        message: res.data.message || "Participants updated successfully"
      });

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Update failed"
      });

    } finally {
      setIsSaving(false);
    }

  };


  // Helper: when selecting competition within Add Participants modal, set title
  const onChangeAddCompetition = (compId) => {

    setAddSelectedCompetitionId(compId);

    const comp = selectedEvent?.menCompetitions?.find(
      c => String(c._id) === String(compId)
    );

    if (comp) {
      setAddSelectedCompetitionTitle(
        comp.title ? `${comp.competition} - ${comp.title}` : comp.competition
      );
    } else {
      setAddSelectedCompetitionTitle("");
    }
  };

  // small helper to close view modal and clear selection
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    // do not clear selectedEvent (you might want to keep it), but we can if needed:
    // setSelectedEvent(null);
  };



  const openPrizeModal = async () => {

    setIsAddPrizeModalOpen(true);

    try {

      const res = await axios.get(`${URL}/men-events/prizes/list`, {
        headers: { Authorization: token }
      });

      const prizes = res.data?.prizes || [];

      setExistingPrizes(prizes);
      setPrizeTags(prizes);

    } catch (err) {

      console.error("Failed to load prizes", err);

    }

  };
  // --- Render ---
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-xl font-bold capitalize text-lavender--600">
          Men's Fellowship Events
        </h1>

        <div className="flex items-center justify-between p-4">
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search Members</label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

          </div>

          <button
            onClick={async () => {

              setIsAddPrizeModalOpen(true);

              try {

                const res = await axios.get(`${URL}/men-events/prizes/list`, {
                  headers: { Authorization: token }
                });

                if (res.data?.status === "Success") {

                  const prizes = res.data.prizes || [];

                  setExistingPrizes(prizes);   // store DB prizes
                  setPrizeTags(prizes);        // show in modal

                }

              } catch (err) {

                console.error("Error loading prizes:", err);

              }

            }}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Prizes
          </button>

          <button onClick={handleAddEvent} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> New Event
          </button>

        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Event Name</th>
                <th className="p-2 text-center">Event Date</th>
                <th className="p-2 text-center">Venue</th>
                <th className="p-2 text-center">Register Before</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event._id} className="border-b ">
                    <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center">{event.eventName}</td>
                    <td className="p-2 text-center">{new Date(event.eventDate).toLocaleDateString()}</td>
                    <td className="p-2 text-center">{event.venue}</td>
                    <td className="p-2 text-center">{new Date(event.registerBefore).toLocaleDateString()}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <FaEye title='View Participants' size={18} className="text-lavender--600 cursor-pointer" onClick={() => handleViewEvent(event)} />
                        <CiEdit title='Edit Event' size={20} className="text-lavender--600 cursor-pointer" onClick={() => handleEditEvent(event)} />
                        <button title='Add Participants' onClick={() => openAddParticipantsModal(event)} className="text-lavender--600 hover:text-lavender--800">
                          <FaPlus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan="6">No events found</td>
                </tr>
              )}
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
          defaultRows={25}
        />
      </div>

      {/* View Event Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => closeViewModal()} title="View Event Details">
        {selectedEvent ? (
          <div className="text-sm text-gray-700 space-y-3 max-h-[580px] overflow-y-auto">

            {[
              { label: "Event By", value: selectedEvent.eventBy?.name },
              { label: "Event Name", value: selectedEvent.eventName },
              { label: "Event Date", value: moment(selectedEvent.eventDate).format("DD-MM-YYYY") },
              { label: "Register Before", value: moment(selectedEvent.registerBefore).format("DD-MM-YYYY") },
              { label: "Venue", value: selectedEvent.venue },
              { label: "Description", value: selectedEvent.description },
              { label: "Competitions", value: selectedEvent.menCompetitions?.length ? selectedEvent.menCompetitions.map(c => c.competition + (c.title ? ` - ${c.title}` : '')).join(', ') : "None" },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">{item.label}</div>
                <div className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"}`}>{item.value}</div>
              </div>
            ))}

            <h3 className="font-semibold text-base mt-3">Competitions:</h3>

            {(selectedEvent.menCompetitions || []).map((comp) => {
              const hasParticipants = comp.participants?.length > 0;
              const hasAnyPrize = comp.participants?.some(
                (p) => p.prize && p.prize.trim() !== ""
              ) || false;

              return (
                <div key={comp._id} className="mt-2 border p-2 rounded">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{comp.competition} — <em>{comp.title}</em></p>

                    <div className="flex gap-2">
                      {hasParticipants && !hasAnyPrize && (
                        <button className="px-2 py-1 text-sm bg-lavender--600 text-white rounded" onClick={() => { setSelectedCompetition({ competition: comp, eventId: selectedEvent._id }); setIsPrizeModalOpen(true); }}>Add Prizes</button>
                      )}

                      {hasParticipants && !hasAnyPrize && (
                        <button className="px-2 py-1 text-sm bg-lavender--600 text-white rounded" onClick={() => {
                          setSelectedCompetition({ competition: { ...comp, participants: comp.participants.map(p => ({ ...p, selected: true })) }, eventId: selectedEvent._id });
                          setIsEditParticipantsModalOpen(true);
                        }}>Edit Participants</button>
                      )}
                    </div>

                  </div>

                  {hasParticipants ? (
                    <ul className="mt-1 text-gray-700">
                      {comp.participants.map((p, idx) => (
                        <li key={idx}>
                          {p.member?.member_name}
                          {p.prize ? ` — ${p.prize}` : ""}

                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-5 text-gray-400 italic">No participants added yet.</p>
                  )}
                </div>
              );
            })}

          </div>
        ) : (
          <p className="text-center text-gray-500">Loading...</p>
        )}
      </Modal>

      {/* Prize Modal */}
      {isPrizeModalOpen && selectedCompetition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-3">Assign Prizes</h3>

              {selectedCompetition.competition.participants.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center mb-2">
                  <span>{p.member?.member_name}</span>
                  <select className="border px-2 py-1 rounded" value={p.prize || "None"} onChange={(e) => {
                    const prize = e.target.value;
                    // setSelectedCompetition((prev) => ({ ...prev, competition: { ...prev.competition, participants: prev.competition.participants.map(x => String(x.member) === String(p.member) ? { ...x, prize } : x) } }));
                    setSelectedCompetition(prev => ({
                      ...prev,
                      competition: {
                        ...prev.competition,
                        participants: prev.competition.participants.map(x =>
                          String(x.member?._id || x.member) === String(p.member?._id || p.member)
                            ? { ...x, prize }
                            : x
                        )
                      }
                    }));

                  }}>
                    <option value="None">None</option>
                    {availablePrizes.map((prize, i) => <option key={i} value={prize}>{prize}</option>)}
                  </select>
                </div>
              ))}

              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => { setIsPrizeModalOpen(false); setSelectedCompetition(null); }}>Cancel</button>
                <button
                  onClick={async () => {
                    await savePrizes();
                    setIsPrizeModalOpen(false);
                    setSelectedCompetition(null);
                  }}
                  disabled={isSaving}
                  className={`px-3 py-1 rounded text-white flex items-center gap-2
  ${isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-lavender--600"
                    }`}
                >

                  {isSaving && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}

                  {isSaving ? "Saving..." : "Save"}

                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participants Modal */}
      <Modal isOpen={isEditParticipantsModalOpen} onClose={() => { setIsEditParticipantsModalOpen(false); setSelectedCompetition(null); }} title="Edit Participants Details">
        {selectedCompetition && (
          <div className="space-y-4">
            <p className="font-semibold">Event: {selectedEvent?.eventName}</p>
            <p className="font-semibold">Competition: {selectedCompetition.competition.competition} — {selectedCompetition.competition.title}</p>

            <div className="mt-2 space-y-1">
              {selectedCompetition.competition.participants.map((p) => {

                const memberId = getMemberId(p.member);

                return (
                  <div key={memberId} className="flex items-center gap-2">

                    <input
                      type="checkbox"
                      checked={p.selected !== false}
                      onChange={(e) => {

                        setSelectedCompetition(prev => ({
                          ...prev,
                          competition: {
                            ...prev.competition,
                            participants: prev.competition.participants.map(st =>
                              getMemberId(st.member) === memberId
                                ? { ...st, selected: e.target.checked }
                                : st
                            )
                          }
                        }));

                      }}
                    />

                    <span>{p.member?.member_name || "Unknown Member"}</span>

                  </div>
                );

              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100" onClick={() => { setIsEditParticipantsModalOpen(false); setSelectedCompetition(null); }}>Cancel</button>
              <button
                onClick={handleSaveEditParticipants}
                disabled={isSaving}
                className={`px-4 py-2 rounded text-white flex items-center gap-2
  ${isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-lavender--600 hover:bg-lavender--700"
                  }`}
              >

                {isSaving && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}

                {isSaving ? "Saving..." : "Save"}

              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Prize Types Modal */}
      <Modal isOpen={isAddPrizeModalOpen} onClose={() => setIsAddPrizeModalOpen(false)} title="Add Prizes">
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {prizeTags.map((tag, i) => {

              const isExisting = existingPrizes.includes(tag);

              return (
                <span
                  key={i}
                  className={`flex items-center px-2 py-1 rounded-full text-sm
          ${isExisting
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {tag}

                  <button
                    type="button"
                    className="ml-2 hover:text-red-600"
                    onClick={() =>
                      setPrizeTags(prev => prev.filter((_, index) => index !== i))
                    }
                  >
                    ✕
                  </button>

                </span>
              );

            })}
          </div>

          <input type="text" placeholder="+ Add prize type (e.g., First Prize, Runner-up)" value={prizeInput} onChange={(e) => setPrizeInput(e.target.value)} onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === "Tab") && prizeInput.trim()) {
              e.preventDefault();
              const newTag = prizeInput.trim();
              if (!prizeTags.includes(newTag)) setPrizeTags([...prizeTags, newTag]);
              setPrizeInput("");
            }
          }} className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5" />

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={async () => {
              try {
                const res = await axios.post(`${URL}/men-events/prizes/add`, { prizes: prizeTags }, { headers: { Authorization: token } });
                setResponse({ status: "Success", message: res.data?.message || "Prizes saved successfully!" });
                setIsAddPrizeModalOpen(false);
                setPrizeTags([]);
                setPrizeInput("");
                await fetchPrizes();
              } catch (err) {
                setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to save prizes" });
              }
            }} className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Save</button>
          </div>
        </div>
      </Modal>


      {showAddParticipantsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowAddParticipantsModal(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-[90%] max-w-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">Add Competition Participants</h3>

            <div className="mb-3">
              <div className="font-medium">Event:</div>
              <div className="text-gray-700">{selectedEvent.eventName}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Competition</label>
                <select
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm p-2"
                  value={addSelectedCompetitionId || ""}
                  onChange={(e) => onChangeAddCompetition(e.target.value)}
                >
                  <option value="">Select Competition</option>
                  {(selectedEvent.menCompetitions || []).map((comp) => (
                    <option key={comp._id} value={comp._id}>
                      {comp.competition} {comp.title ? ` - ${comp.title}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm p-2"
                  value={addSelectedCompetitionTitle || ""}
                />
              </div>
            </div>

            {/* Fetch Members Button */}
            <div className="flex justify-end mb-3">
              {/* <button
                onClick={async () => {
                  if (!addSelectedCompetitionId) {
                    setResponse({ status: "Failed", message: "Please select a competition first" });
                    return;
                  }

                  await fetchMenMembers(); // Fetch all possible members

                  // Pre-check existing participants
                  const comp = selectedEvent?.menCompetitions?.find(
                    c => String(c._id) === String(addSelectedCompetitionId)
                  );

                  if (comp?.participants?.length) {
                    const ids = comp.participants.map(p =>
                      String(p.member?._id || p.member)
                    );

                    setSelectedMembers(ids);
                  } else {
                    setSelectedMembers([]);
                  }
                }}
                className="px-4 py-2 bg-lavender--600 text-white rounded hover:bg-lavender--700"
              >
                Add Participants
              </button> */}
              <button
                onClick={async () => {

                  if (!addSelectedCompetitionId) {
                    setResponse({
                      status: "Failed",
                      message: "Please select a competition first"
                    });
                    return;
                  }

                  // fetch members
                  await fetchMenMembers();

                  // find selected competition
                  const comp = selectedEvent?.menCompetitions?.find(
                    c => String(c._id) === String(addSelectedCompetitionId)
                  );

                  // if participants already exist, pre-select them
                  if (comp?.participants?.length) {

                    const ids = comp.participants.map(p =>
                      String(p.member?._id || p.member)
                    );

                    setSelectedMembers(ids);

                  } else {

                    setSelectedMembers([]);

                  }

                }}
                className="px-4 py-2 bg-lavender--600 text-white rounded hover:bg-lavender--700"
              >
                Add Participants
              </button>
            </div>

            {/* Members checkboxes */}
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2">Select Members</h4>
              {menMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {menMembers.map((m) => (
                    <label key={m._id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(String(m._id))}
                        onChange={() => toggleMemberSelection(m._id)}
                      />
                      <span>{m.member_name || m.name || m.fullName || m.firstName || `${m.name}`}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No members found. Click "Add Participants" to fetch members.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAddParticipantsModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={saveParticipants}
                disabled={isSavingParticipants}
                className={`px-4 py-2 text-white rounded flex items-center gap-2
  ${isSavingParticipants
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-lavender--600 hover:bg-lavender--700"
                  }`}
              >

                {isSavingParticipants && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}

                {isSavingParticipants ? "Saving..." : "Save"}

              </button>
            </div>
          </div>
        </div>
      )}


      {/* Existing Add Modal (if you still use it elsewhere) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          // reset modal selections
          // clear any states used by this older modal implementation
          setParticipantBlocks([]);
          setAddSelectedCompetitionId("");
          setAddSelectedCompetitionTitle("");
        }}
        title="Add Competition Participants"
      >
        <div className="space-y-4 max-h-[580px] overflow-y-auto">

          {/* This block retains your previous UI structure but expects you to fill students/class options
              For women fellowship use-case we've implemented the dedicated Add Participants modal above.
              Keep this block for backward compatibility if needed. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Competition</label>
              <select
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={/* preserve old usage */ addSelectedCompetitionId || ""}
                onChange={(e) => {
                  onChangeAddCompetition(e.target.value);
                }}
              // disabled={!competitionOptions || competitionOptions.length === 0}
              >
                <option value="">Select Competition</option>
                {(selectedEvent?.menCompetitions || []).map((comp) => (
                  <option key={comp._id} value={comp._id}>{comp.competition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={addSelectedCompetitionTitle || ""}
              />
            </div>
          </div>

          {/* Participant Blocks: replicate previous logic but now using menMembers as students */}
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                if (!addSelectedCompetitionId) {
                  setResponse({ status: "Failed", message: "Select a competition first." });
                  return;
                }

                // prevent duplicate competition blocks
                const exists = participantBlocks.find(
                  (b) => b.competitionId === addSelectedCompetitionId
                );
                if (exists) return;

                const preselected = (menMembers || []).filter((stu) =>
                  // if competition already has participants (from selectedEvent), mark preselected
                  (selectedEvent?.menCompetitions || []).some(
                    (p) => String(p._id) === String(addSelectedCompetitionId) && (p.participants || []).some(pp => String(pp.member_id) === String(stu._id))
                  )
                );

                setParticipantBlocks((prev) => [
                  ...prev,
                  {
                    competitionId: addSelectedCompetitionId,
                    title: addSelectedCompetitionTitle,
                    students: preselected, // <-- pre-fill with matching member objects
                  },
                ]);

                setAddSelectedCompetitionId("");
                setAddSelectedCompetitionTitle("");
              }}
              className="px-5 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
            >
              Add Participants
            </button>
          </div>

          {/* Participant Blocks */}
          <div className="space-y-4">
            {participantBlocks.map((block, blockIndex) => {

              return (
                <div key={blockIndex} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{block.title}</h3>
                    <button
                      onClick={() =>
                        setParticipantBlocks(prev => prev.filter((_, i) => i !== blockIndex))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Member Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {(menMembers || []).map(member => (
                      <label key={member._id} className="flex items-center space-x-2">

                        <input
                          type="checkbox"
                          checked={block.students.some((s) => String(s._id || s.member_id) === String(member._id))}
                          onChange={(e) => {
                            setParticipantBlocks((prev) => {
                              const updated = [...prev];
                              const blk = updated[blockIndex];
                              if (e.target.checked) {
                                // avoid duplicates
                                if (!blk.students.some((x) => String(x._id || x.member_id) === String(member._id))) {
                                  blk.students.push(member);
                                }
                              } else {
                                blk.students = blk.students.filter(
                                  (s) => String(s._id || s.member_id) !== String(member._id)
                                );
                              }
                              return updated;
                            });
                          }}
                        />

                        <span>{member.member_name || member.name}</span>
                      </label>
                    ))}

                  </div>
                </div>
              );
            })}

          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">

            <button
              onClick={async () => {
                try {
                  if (!selectedEvent) {
                    console.error("Missing required selections:", { selectedEvent });
                    setResponse({ status: "Failed", message: "Please select an event before saving." });
                    return;
                  }

                  // transform to the expected API payload for women-events participants/add
                  const payload = {
                    eventId: selectedEvent._id,
                    // This older modal used className etc — adapt to simple participants payload:
                    participants: participantBlocks.flatMap(block =>
                      (block.students || []).map(s => ({
                        competitionId: block.competitionId,
                        member_id: s._id || s.member_id,
                        member_name: s.member_name || s.name || ""
                      }))
                    )
                  };

                  console.log("Saving participants payload (legacy modal):", payload);

                  // Use the women-events participants add endpoint
                  await axios.post(`${URL}/men-events/participants/add`, payload, {
                    headers: { Authorization: token },
                  });

                  setParticipantBlocks([]);
                  setIsAddModalOpen(false);
                  setResponse({ status: "Success", message: "Participants saved successfully!" });
                  await fetchEvents();
                } catch (err) {
                  console.error("Save participants error:", err);
                  setResponse({
                    status: "Failed",
                    message: err.response?.data?.message || "Failed to save participants",
                  });
                }
              }}

              className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
            >
              Save Participants
            </button>

          </div>
        </div>
      </Modal>

      {/* Toast Messages */}
      {Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />
      )}
    </>
  )
}
