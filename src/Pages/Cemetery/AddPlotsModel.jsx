import React, { useState, useEffect } from "react";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { CiEdit } from "react-icons/ci";
import { FaTrash, FaCheck  } from "react-icons/fa";
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";
import RequiredLabel from "../../Components/Form/RequiredLabel";
import CharCounter from "../../Components/Form/CharCounter";


const AddPlotsModal = ({ isOpen, onClose, onSave }) => {

    const { saving, startSaving, stopSaving } = useSaving();

    useBlockRefresh(saving);

    const { errors, showError } = useTemporaryError();
    const [plots, setPlots] = useState([]);
    const [columnsInput, setColumnsInput] = useState("");
    const totalPlots = plots.reduce((sum, row) => sum + row.length, 0);
    const [editMode, setEditMode] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [formData, setFormData] = useState({
        cemeteryName: "",
        location: "",
    });




    useEffect(() => {
        if (!isOpen) {
            resetForm();   // 🔥 reset when modal closes
        }
    }, [isOpen]);



    // 🔹 Excel column generator
    const getExcelColumnName = (num) => {
        let str = "";
        while (num > 0) {
            let rem = (num - 1) % 26;
            str = String.fromCharCode(65 + rem) + str;
            num = Math.floor((num - 1) / 26);
        }
        return str;
    };

    // 🔹 Add row of Plots (A1, A2, A3 then B1, B2, B3, etc.)
    const addRow = () => {
        const count = parseInt(columnsInput) || 1;

        // EDIT MODE – modify existing row
        if (editMode && selectedRow !== null) {
            const rowIndex = selectedRow + 1;
            const rowLetter = getExcelColumnName(rowIndex);

            const updated = [];
            for (let i = 1; i <= count; i++) {
                updated.push(`${rowLetter}${i}`);
            }

            const copy = [...plots];
            copy[selectedRow] = updated;
            setPlots(copy);

            // KEEP ROW ACTIVE & KEEP VALUE LOADED
            setColumnsInput(count.toString());
            return;
        }

        // NORMAL ADD MODE
        const rowIndex = plots.length + 1;
        const rowLetter = getExcelColumnName(rowIndex);

        const newRow = [];
        for (let i = 1; i <= count; i++) {
            newRow.push(`${rowLetter}${i}`);
        }

        setPlots([...plots, newRow]);
        setColumnsInput("");
    };





    // 🔹 Convert number → Excel column letter
    // 1 → A, 2 → B, 27 → AA

    // const handleChange = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };


    const handleChange = (e) => {

        const { name, value } = e.target;

        // ✅ Dynamic max lengths
        const maxLengths = {
            cemeteryName: 50,
            location: 100,
        };

        const max = maxLengths[name] || 50;

        // ✅ reusable validation
        if (!validateMaxLength(name, value, max, showError)) return;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const resetForm = () => {
        setFormData({
            cemeteryName: "",
            location: "",
        });
        setPlots([]);
        setColumnsInput("");
        setEditMode(false);
        setSelectedRow(null);
    };

    const handleSubmit = async () => {

        try {

            startSaving();

            // ✅ VALIDATION
            if (!formData.cemeteryName.trim()) {
                await onSave({
                    error: "Cemetery name required"
                });
                return;
            }

            if (!formData.location.trim()) {
                await onSave({
                    error: "Location required"
                });
                return;
            }

            if (plots.length === 0) {
                await onSave({
                    error: "At least one row required"
                });
                return;
            }

            await onSave({
                cemeteryName: formData.cemeteryName.trim(),
                location: formData.location.trim(),
                plots,
                totalPlots,
            });

            resetForm();
            onClose();

        } catch (err) {

            console.error(err);

        } finally {

            stopSaving();
        }
    };

    return (
        <>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Add Plots"
            >
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div className="relative">
                            {/* <label className="block text-sm font-medium text-gray-700">
                            Cemetery Name
                        </label> */}

                            <RequiredLabel>Cemetery Name</RequiredLabel>
                            <input
                                type="text"
                                name="cemeteryName"
                                value={formData.cemeteryName}
                                onChange={handleChange}
                                placeholder="Enter Name"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />

                            <CharCounter
                                value={formData.cemeteryName}
                                max={50}
                                show
                            />


                        </div>
                        <div className="relative">

                            <RequiredLabel>Cemetery Location</RequiredLabel>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                            <CharCounter
                                value={formData.location}
                                max={100}
                                show
                            />


                        </div>

                        <div>
                            <RequiredLabel>Plots Layout</RequiredLabel>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Number of Plots per Row"
                                    className="block w-[75%] mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    value={columnsInput}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");

                                        setColumnsInput(val);
                                    }}
                                />
                                <Button
                                    label="Add Row"
                                    onClick={addRow}
                                    buttonType="button"
                                    className="w-[32%] h-[35px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plots grid */}
                    {plots.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Plots</label>
                                <button
                                    onClick={() => {
                                        setEditMode(!editMode);
                                        setSelectedRow(null);
                                        setColumnsInput("");
                                    }}
                                    title={editMode ? "Done" : "Edit"}
                                    className="text-sm text-lavender--600 "
                                >
                                    {editMode ? (
                                        <FaCheck  size={22}  className="text-green-600 text-lg" />
                                    ) : (
                                        <CiEdit size={22}  className="text-lavender--600 text-xl" />
                                    )}
                                </button>
                            </div>

                            <div className="col-span-2 grid gap-2 p-2 border rounded max-h-[300px] overflow-auto bg-lavender--50 mt-1">
                                {plots.map((row, rIdx) => (
                                    <div key={rIdx} className="flex items-center gap-2">
                                        {editMode && (
                                            <input
                                                type="radio"
                                                name="rowSelect"
                                                onChange={() => {
                                                    setSelectedRow(rIdx);
                                                    setColumnsInput(row.length.toString());
                                                }}
                                            />
                                        )}

                                        <div className="flex gap-2">
                                            {row.map((slot) => (
                                                <div
                                                    key={slot}
                                                    className="w-12 h-12 flex items-center justify-center border rounded bg-white text-sm font-medium"
                                                >
                                                    {slot}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Delete ONLY last row */}
                                        {editMode && rIdx === plots.length - 1 && (
                                            <button
                                                onClick={() => {
                                                    const copy = [...plots];
                                                    copy.pop();
                                                    setPlots(copy);
                                                    setSelectedRow(null);
                                                    setColumnsInput("");
                                                }}
                                                className="text-red-600 text-sm ml-2"
                                                Title="Delete Row"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                            </div>
                            <div className="mt-2 text-right text-gray-700 font-medium">
                                Total Available Plots: {totalPlots}
                            </div>
                        </div>

                    )}

                    {/* Save button */}
                    <div className="flex justify-end gap-3 mt-6">
                        {/* <button
                        className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                        onClick={handleSubmit}
                    >
                        Save
                    </button> */}

                        <Button
                            saving={saving}
                            type="save"
                            onClick={handleSubmit}
                            buttonType="button"
                        />
                    </div>
                </div>
            </Modal>



        </>

    );
};

export default AddPlotsModal;