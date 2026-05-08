import React, { useState, useEffect } from 'react';
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import { FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa'
import RequiredLabel from "../../Components/Form/RequiredLabel";
import BackButton from "../../Components/Button/BackButton";
import Modal from '../../Components/Expense/ExpenseFormModal';
import DetailsModal from "../../Components/Expense/detailsModal";
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import CharCounter from "../../Components/Form/CharCounter";
import { useTemporaryError } from "../../Components/Form/useTemporaryError";
import { validateMaxLength } from "../../Components/Form/validateMaxLength";

export const MrgHallAddAssets = () => {

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [Response, setResponse] = useState({ status: null, message: "" });
    const token = window.sessionStorage.getItem("token");
    const [assetCategories, setAssetCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const assetSaving = useSaving();
    const categorySaving = useSaving();
    const itemSaving = useSaving();
    useBlockRefresh(
        assetSaving.saving ||
        categorySaving.saving ||
        itemSaving.saving
    );
    const { errors, showError } = useTemporaryError();
    const [modalCategoryId, setModalCategoryId] = useState("");
    const [newItem, setNewItem] = useState("");
    const [selectedHallId, setSelectedHallId] = useState("");
    const [selectedItemName, setSelectedItemName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [viewCategory, setViewCategory] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [hallDropdown, setHallDropdown] = useState([]);


    useEffect(() => {
        (async () => {
            await fetchHallDropdown();
        })();
    }, []);


    const fetchHallDropdown = async () => {
        try {
            const res = await axios.get(`${URL}/marriage/halls`, {
                headers: { Authorization: token }
            });
            setHallDropdown(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssetCategories = async () => {
        const res = await axios.get(`${URL}/marriage/hall-assets/category`, {
            headers: { Authorization: token }
        });
        setAssetCategories(res.data.data || []);
    };

    useEffect(() => {
        (async () => {
            await fetchAssetCategories();
        })();
    }, []);


    const addCategory = async () => {

        if (categorySaving.saving) return;

        if (!newCategory.trim()) {
            setResponse({ status: "Failed", message: "Category name required" });
            return;
        }

        try {
            categorySaving.startSaving();

            await axios.post(
                `${URL}/marriage/hall-assets/category`,
                { name: newCategory.trim() },
                { headers: { Authorization: token } }
            );

            setResponse({ status: "Success", message: "Category added successfully" });

            setNewCategory("");
            await fetchAssetCategories();

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Category already exists",
            });
        } finally {
            categorySaving.stopSaving();
        }
    };

    const addItem = async () => {

        if (itemSaving.saving) return;

        if (!modalCategoryId || !newItem.trim()) {
            setResponse({ status: "Failed", message: "Enter item name" });
            return;
        }

        try {
            itemSaving.startSaving();

            await axios.post(
                `${URL}/marriage/hall-assets/category/${modalCategoryId}/item`,
                { item: newItem.trim() },
                { headers: { Authorization: token } }
            );

            setResponse({ status: "Success", message: "Item added successfully" });

            setNewItem("");
            await fetchAssetCategories();

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to add item",
            });
        } finally {
            itemSaving.stopSaving();
        }
    };

    const saveHallAsset = async () => {

        if (assetSaving.saving) return;

        if (!selectedHallId || !selectedCategoryId || !selectedItemName || !quantity) {
            setResponse({ status: "Failed", message: "Please select hall, category, item and quantity" });
            return;
        }

        try {
            assetSaving.startSaving();

            const hall = hallDropdown.find(h => h._id === selectedHallId);
            const cat = assetCategories.find(c => c._id === selectedCategoryId);

            await axios.post(
                `${URL}/marriage/hall-assets/add`,
                {
                    hallId: selectedHallId,
                    hallName: hall.hall_name,
                    categoryId: selectedCategoryId,
                    categoryName: cat.name,
                    itemName: selectedItemName,
                    quantity,
                },
                { headers: { Authorization: token } }
            );

            setResponse({ status: "Success", message: "Asset saved" });


            setSelectedHallId("");
            setSelectedCategoryId("");
            setSelectedItemName("");
            setQuantity("");

        } catch (err) {
            setResponse({
                status: "Failed",
                message: err.response?.data?.message || "Failed to save asset",
            });
        } finally {
            assetSaving.stopSaving();
        }
    };





    return (
        <>
            <BackButton />
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

                <h1 className="text-xl font-bold capitalize text-lavender--600 mb-4">
                    Add Hall Assets
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>

                        <RequiredLabel >Hall Name </RequiredLabel>
                        <select
                            value={selectedHallId}
                            onChange={e => setSelectedHallId(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="">--Select Hall--</option>

                            {hallDropdown.map(h => (
                                <option key={h._id} value={h._id}>
                                    {h.hall_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">


                            <RequiredLabel >Category </RequiredLabel>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className=" mb-1 font-semibold text-sm text-lavender--600 flex items-center gap-2"
                            >
                                <FaPlus /> Category
                            </button>
                        </div>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="">-- Select Category --</option>
                            {assetCategories.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                    </div>
                    <div>
                        <div className="flex items-center justify-between">

                            <RequiredLabel >Item </RequiredLabel>

                            <button
                                type="button"
                                onClick={() => setIsItemModalOpen(true)}
                                className=" mb-1 font-semibold text-sm text-lavender--600 flex items-center gap-2"
                            >
                                <FaPlus /> Item
                            </button>
                        </div>
                        <select onChange={e => setSelectedItemName(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                            <option value="">-- Select Item --</option>

                            {assetCategories
                                .find(c => c._id === selectedCategoryId)
                                ?.items.map(it => (
                                    <option key={it.name} value={it.name}>
                                        {it.name}
                                    </option>
                                ))}
                        </select>

                    </div>
                    <div>

                        <RequiredLabel >Quantity </RequiredLabel>
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "");
                                setQuantity(onlyNumbers);
                            }}
                            placeholder="Enter Quantity"
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        saving={assetSaving.saving}
                        type="save"
                        buttonType="button"
                        onClick={saveHallAsset}
                    />
                </div>

                <Modal isOpen={isModalOpen} onClose={() => {
                    setIsModalOpen(false);
                    setNewCategory("");
                }} title="Add New Category">

                    <div className="max-h-[550px] overflow-y-auto">
                        <div>


                            <div className="relative">
                                <RequiredLabel>Category</RequiredLabel>

                                <input
                                    type="text"
                                    value={newCategory}
                                    placeholder="Enter Category"
                                    onChange={(e) => {
                                        const val = e.target.value;


                                        if (!validateMaxLength("category", val, 50, showError)) return;

                                        setNewCategory(val);
                                    }}
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />


                                <CharCounter value={newCategory} max={50} show />


                                {errors.category && (
                                    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                saving={categorySaving.saving}
                                type="save"
                                buttonType="button"
                                onClick={addCategory}
                                disabled={!newCategory.trim()}
                            />
                        </div>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm text-gray-500">
                                <thead className="text-base text-gray-700 border-b">
                                    <tr>
                                        <th className="p-2 text-center">Sl No</th>
                                        <th className="p-2 text-center">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetCategories.map((c, i) => (
                                        <tr key={c._id}  className="border-b">
                                            <td className='p-2 text-center'>{i + 1}</td>
                                            <td className='text-center'>{c.name}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>      

                </Modal>

                <Modal isOpen={isItemModalOpen} onClose={() => {
                    setIsItemModalOpen(false);
                    setNewItem("");
                    setModalCategoryId("");
                }} title="Add New Item">
                    <div className="flex flex-col  space-y-3 max-h-[550px] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                            <div>

                                <RequiredLabel >Category </RequiredLabel>
                                <select
                                    value={modalCategoryId}
                                    onChange={e => setModalCategoryId(e.target.value)}
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">-- Select Category --</option>
                                    {assetCategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>


                                <div className="relative">
                                    <RequiredLabel>Item</RequiredLabel>

                                    <input
                                        type="text"
                                        value={newItem}
                                        placeholder="Enter Item"
                                        onChange={(e) => {
                                            const val = e.target.value;

                                            // 🔥 MAX LENGTH VALIDATION
                                            if (!validateMaxLength("item", val, 50, showError)) return;

                                            setNewItem(val);
                                        }}
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    />

                                    {/* 🔢 CHAR COUNTER */}
                                    <CharCounter value={newItem} max={50} show />

                                    {/* ❌ ERROR */}
                                    {errors.item && (
                                        <p className="text-xs text-red-500 mt-1">{errors.item}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                saving={itemSaving.saving}
                                type="save"
                                buttonType="button"
                                onClick={addItem}
                                disabled={!modalCategoryId || !newItem.trim()}
                            />
                        </div>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm text-gray-500 table-fixed">
                                <thead className="text-base text-gray-700 border-b">
                                    <tr>
                                        <th className="w-[70px] p-2 text-center">SNo</th>
                                        <th className="w-[260px] p-2 text-center">Category</th>
                                        <th className="w-[120px] p-2 text-center">Items</th>
                                        <th className="w-[80px] p-2 text-center">View</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {assetCategories.map((cat, i) => (
                                        <tr key={cat._id} className="border-b">
                                            <td className="w-[70px] p-2 text-center">{i + 1}</td>
                                            <td className="w-[260px] p-2 text-center font-medium">{cat.name}</td>
                                            <td className="w-[120px] p-2 text-center">{cat.items.length}</td>
                                            <td className="w-[80px] p-2 text-center">
                                                <FaEye
                                                    size={18}
                                                    className="text-lavender--600 cursor-pointer mx-auto"
                                                    onClick={() => {
                                                        setViewCategory(cat);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>

                </Modal>

                <DetailsModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title={`Items in ${viewCategory?.name || ""}`}
                >
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-gray-600 table-fixed">
                            <thead className="border-b">
                                <tr>
                                    <th className="w-[80px] p-2 text-center">Sl</th>
                                    <th className="p-2 text-center">Item Name</th>
                                </tr>
                            </thead>

                            <tbody>
                                {viewCategory?.items.map((it, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2 text-center">{i + 1}</td>
                                        <td className="p-2 text-center">{it.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DetailsModal>

            </div>

            {Response.status && 
            (Response.status === "Success" ? 
            <SuccessMessage Message={Response.message} /> 
            : <FailedMessage Message={Response.message} />
            )}
        </>
    )
}
