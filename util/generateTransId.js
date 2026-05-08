const TransIdCounter = require("../Schema/TransIdCounterSchema");
const moment = require("moment");

const PREFIX_MAP = {
    Bag: "B",
    Cover: "C",
    Santha: "S",
};

const generateTransId = async (type, date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");

    // 🔥 Atomic increment
    const counter = await TransIdCounter.findOneAndUpdate(
        { date: formattedDate, type },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const prefix = PREFIX_MAP[type] || "X";

    const seq = counter.seq;

    // ✅ dynamic padding (min 4 digits, then grow)
    const padded =
        seq <= 9999
            ? String(seq).padStart(4, "0")
            : String(seq);

    const transId = `${prefix}${padded}`;

    return transId;
};

module.exports = generateTransId;