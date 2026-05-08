import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { URL } from "../../App";
import BackButton from "../../Components/Button/BackButton";
import Button from "../../Components/Form/Button";
import { useSaving } from "../../Components/Form/useSaving";
import { useBlockRefresh } from "../../Components/Form/useBlockRefresh";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const PaymentBookingHall = () => {
    const { id } = useParams();
    const token = window.sessionStorage.getItem("token");

    const [payAmount, setPayAmount] = useState("");
    const [assetUpdates, setAssetUpdates] = useState({});

    const [booking, setBooking] = useState(null);
    const [fine, setFine] = useState("");

    const [Response, setResponse] = useState({ status: null, message: "" });

    const paymentSaving = useSaving();
    const assetSaving = useSaving();
    const fineSaving = useSaving();

    useBlockRefresh(
        paymentSaving.saving ||
        assetSaving.saving ||
        fineSaving.saving
    );

    const fetchBooking = async () => {
        try {
            const res = await axios.get(`${URL}/marriage/bookings/${id}`, {
                headers: { Authorization: token },
            });
            setBooking(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id, token]);

    if (!booking) return null;

    // calculations
    const totalAmount = booking.amount || 0;
    const advancePaid =
        booking.advanceHistory?.reduce((sum, i) => sum + i.amount, 0) || 0;

    const remaining = totalAmount - advancePaid;


    const kitchenItems = booking?.issued_assets?.kitchen || [];


    const handleAssetChange = (id, field, value, max) => {

        let val = value.replace(/\D/g, "");
        val = Number(val || 0);

        setAssetUpdates(prev => {
            const current = prev[id] || {};

            const returned = field === "returned" ? val : (current.returned || 0);
            const damaged = field === "damaged" ? val : (current.damaged || 0);
            const missing = field === "missing" ? val : (current.missing || 0);

            const total = returned + damaged + missing;

            // ❗ BLOCK if exceeds issued
            if (total > max) {
                return prev; // ignore update
            }

            return {
                ...prev,
                [id]: {
                    returned,
                    damaged,
                    missing
                }
            };
        });
    };




    return (
        <>
            <BackButton />

            <div className="p-4 mt-3 space-y-5">

                {/* ================= PAYMENT HISTORY ================= */}
                <div className="bg-white shadow-md rounded-[10px] p-4">

                    <h2 className="text-lg font-semibold text-lavender--600 mb-4">
                        Payment History
                    </h2>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">

                        <div>
                            <p className="text-gray-600 text-sm">Total Amount:</p>
                            <p className="text-xl font-bold">₹ {totalAmount}</p>
                        </div>

                        <div>
                            <p className="text-gray-600 text-sm">Advance Paid:</p>
                            <p className="text-xl font-bold text-green-600">
                                ₹ {advancePaid}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-600 text-sm">Remaining Balance:</p>
                            <p className="text-xl font-bold text-red-600">
                                ₹ {remaining}
                            </p>
                        </div>

                    </div>


                    {/* Table */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">

                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2 text-center">S No</th>
                                    <th className="p-2 text-center">Date</th>
                                    <th className="p-2 text-center">Amount Paid</th>
                                    <th className="p-2 text-center">Balance After</th>
                                </tr>
                            </thead>

                            <tbody>
                                {booking.advanceHistory?.length > 0 ? (
                                    booking.advanceHistory.map((item, index) => {

                                        const balance =
                                            totalAmount -
                                            booking.advanceHistory
                                                .slice(0, index + 1)
                                                .reduce((sum, i) => sum + i.amount, 0);

                                        return (
                                            <tr key={item._id} className="border-t">
                                                <td className="p-2 text-center">{index + 1}</td>
                                                <td className="p-2 text-center">
                                                    {new Date(item.date).toLocaleDateString("en-GB")}
                                                </td>
                                                <td className="p-2 text-center">₹ {item.amount}</td>
                                                <td className="p-2 text-center">₹ {balance}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-4 text-center text-gray-400">
                                            No payments yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>



                    {remaining > 0 && (
                        <div className="flex gap-2 mt-3">

                            <input
                                type="text"
                                value={payAmount}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, "");

                                    if (!val) {
                                        setPayAmount("");
                                        return;
                                    }

                                    val = Number(val);

                                    if (val > remaining) {
                                        val = remaining; // 🔥 auto clamp
                                    }

                                    setPayAmount(val);
                                }}
                                placeholder="Enter amount"
                                className="flex-1  px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm"
                            />

                            <Button
                                saving={paymentSaving.saving}
                                type="save"
                                buttonType="button"
                                onClick={async () => {

                                    if (!payAmount || Number(payAmount) <= 0) {
                                        setResponse({
                                            status: "Failed",
                                            message: "Enter valid amount",
                                        });
                                        return;
                                    }

                                    if (paymentSaving.saving) return;

                                    try {
                                        paymentSaving.startSaving();

                                        await axios.post(
                                            `${URL}/marriage/bookings/${id}/add-payment`,
                                            { amount: Number(payAmount) },
                                            { headers: { Authorization: token } }
                                        );

                                        setResponse({
                                            status: "Success",
                                            message: "Payment added successfully",
                                        });

                                        setPayAmount("");
                                        await fetchBooking();

                                    } catch (err) {
                                        setResponse({
                                            status: "Failed",
                                            message: err.response?.data?.message || "Payment failed",
                                        });
                                    } finally {
                                        paymentSaving.stopSaving();
                                    }
                                }}
                            />

                        </div>
                    )}
                </div>
                {/* ================= ISSUED KITCHEN ASSETS ================= */}
                <div className="bg-white shadow-md rounded-[10px] p-4">

                    <h2 className="text-lg font-semibold text-lavender--600 mb-2">
                        Issued Kitchen Assets
                    </h2>

                    {/* ✅ CHECK IF EMPTY */}
                    {kitchenItems.length === 0 ? (

                        <p className="text-gray-500 text-sm">
                            No Kitchen assets issued.
                        </p>

                    ) : (

                        <>
                            <h2 className="text-base font-semibold mb-3">
                                Hall: {booking.hall?.hall_name} | Customer: {booking.customerName}
                            </h2>

                            <table className="w-full text-sm border border-gray-300">

                                <thead>
                                    <tr className="text-center border-b">
                                        <th className="p-2 w-[40%]">Item</th>
                                        <th className="bg-blue-100 p-2 w-[15%]">Issued</th>
                                        <th className="bg-green-100 p-2 w-[15%]">Returned</th>
                                        <th className="bg-yellow-100 p-2 w-[15%]">Damaged</th>
                                        <th className="bg-pink-100 p-2 w-[15%]">Missing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kitchenItems.map(item => {

                                        const currentReturned = assetUpdates[item.asset_id]?.returned ?? item.returned ?? 0;
                                        const currentDamaged = assetUpdates[item.asset_id]?.damaged ?? item.damaged ?? 0;
                                        const currentMissing = assetUpdates[item.asset_id]?.missing ?? item.missing ?? 0;

                                        const total = currentReturned + currentDamaged + currentMissing;

                                        // 🔥 LOCK ONLY WHEN FULLY USED
                                        const isFullyUsed = total >= item.issued_qty;

                                        return (
                                            <tr key={item._id} className="border-b text-center">

                                                {/* ITEM */}
                                                <td className="p-2 text-left">{item.item_name}</td>

                                                {/* ISSUED */}
                                                <td className="bg-blue-100 align-middle">
                                                    {item.issued_qty}
                                                </td>

                                                {/* RETURN */}
                                                <td className="bg-green-100 align-middle">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="text"
                                                            className="w-50 text-center border border-gray-300 rounded text-sm py-[2px] "
                                                            value={currentReturned}
                                                            disabled={isFullyUsed}
                                                            onChange={(e) =>
                                                                handleAssetChange(
                                                                    item.asset_id,
                                                                    "returned",
                                                                    e.target.value,
                                                                    item.issued_qty
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>

                                                {/* DAMAGE */}
                                                <td className="bg-yellow-100 align-middle">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="text"
                                                            className="w-50 text-center border border-gray-300 rounded text-sm py-[2px] "
                                                            value={currentDamaged}
                                                            disabled={isFullyUsed}
                                                            onChange={(e) =>
                                                                handleAssetChange(
                                                                    item.asset_id,
                                                                    "damaged",
                                                                    e.target.value,
                                                                    item.issued_qty
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>

                                                {/* MISSING */}
                                                <td className="bg-pink-100 align-middle">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="text"
                                                            className="w-50 text-center border border-gray-300 rounded text-sm py-[2px] "
                                                            value={currentMissing}
                                                            disabled={isFullyUsed}
                                                            onChange={(e) =>
                                                                handleAssetChange(
                                                                    item.asset_id,
                                                                    "missing",
                                                                    e.target.value,
                                                                    item.issued_qty
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>

                            {/* BUTTON RIGHT ALIGN */}
                            <div className="flex justify-end mt-4">
                                <Button
                                    saving={assetSaving.saving}
                                    type="save"
                                    buttonType="button"
                                    onClick={async () => {

                                        if (assetSaving.saving) return;

                                        // 🔒 VALIDATION (same as your code)
                                        for (const item of kitchenItems) {
                                            const key = item.asset_id.toString();
                                            const update = assetUpdates[key] || {};

                                            const returned = Number(update.returned ?? item.returned ?? 0);
                                            const damaged = Number(update.damaged ?? item.damaged ?? 0);
                                            const missing = Number(update.missing ?? item.missing ?? 0);

                                            if (
                                                returned < 0 ||
                                                damaged < 0 ||
                                                missing < 0 ||
                                                returned + damaged + missing > item.issued_qty
                                            ) {
                                                setResponse({
                                                    status: "Failed",
                                                    message: `${item.item_name} invalid quantity`,
                                                });
                                                return;
                                            }
                                        }

                                        try {
                                            assetSaving.startSaving();

                                            const payload = kitchenItems.map(item => {
                                                const key = item.asset_id.toString();
                                                const update = assetUpdates[key] || {};

                                                return {
                                                    asset_id: key,
                                                    returned: Number(update.returned ?? item.returned ?? 0),
                                                    damaged: Number(update.damaged ?? item.damaged ?? 0),
                                                    missing: Number(update.missing ?? item.missing ?? 0)
                                                };
                                            });

                                            await axios.post(
                                                `${URL}/marriage/bookings/${id}/update-kitchen-assets`,
                                                { items: payload },
                                                { headers: { Authorization: token } }
                                            );

                                            setResponse({
                                                status: "Success",
                                                message: "Assets updated successfully",
                                            });

                                            setAssetUpdates({});
                                            await fetchBooking();

                                        } catch (err) {
                                            setResponse({
                                                status: "Failed",
                                                message: err.response?.data?.message || "Asset update failed",
                                            });
                                        } finally {
                                            assetSaving.stopSaving();
                                        }
                                    }}
                                />
                            </div>
                        </>

                    )}

                </div>

                {/* ================= FINE AMOUNT ================= */}
                <div className="bg-white shadow-md rounded-[10px] p-4">

                    <h2 className="text-sm font-semibold text-lavender--600 mb-2">
                        Fine Amount
                    </h2>

                    <div className="flex items-center justify-between gap-2">

                        <input
                            type="text"
                            value={fine}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setFine(val);
                            }}
                            placeholder="Enter fine"
                            className="flex-1  px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm"
                        />

                        <Button
                            saving={fineSaving.saving}
                            type="save"
                            buttonType="button"
                            onClick={async () => {

                                if (fineSaving.saving) return;

                                try {
                                    fineSaving.startSaving();

                                    await axios.post(
                                        `${URL}/marriage/bookings/${id}/add-fine`,
                                        { fine: Number(fine) },
                                        { headers: { Authorization: token } }
                                    );

                                    setResponse({
                                        status: "Success",
                                        message: "Fine added successfully",
                                    });

                                    setFine("");
                                    await fetchBooking();

                                } catch (err) {
                                    setResponse({
                                        status: "Failed",
                                        message: err.response?.data?.message || "Failed to add fine",
                                    });
                                } finally {
                                    fineSaving.stopSaving();
                                }
                            }}
                        />

                    </div>
                </div>
            </div>


            {Response.status && (
                Response.status === "Success" ? (
                    <SuccessMessage Message={Response.message} />
                ) : (
                    <FailedMessage Message={Response.message} />
                )
            )}
        </>
    );
};