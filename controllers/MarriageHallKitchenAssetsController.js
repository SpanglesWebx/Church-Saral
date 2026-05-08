const KitchenAsset = require("../Schema/MarriageHallKitchenAsset");

// ================= GET =================
exports.getKitchenAssets = async (req, res) => {
    try {
        const { page = 1, limit = 25, search = "" } = req.query;

        const query = {
            itemName: { $regex: search, $options: "i" }
        };

        const total = await KitchenAsset.countDocuments(query);

        const data = await KitchenAsset.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // 🔥 map fields to match frontend
        const formatted = data.map(item => ({
            _id: item._id,
            item_name: item.itemName,
            total_quantity: item.totalQuantity,
            available_quantity: item.availableQuantity,
            returned: item.returned,
            damaged: item.damaged,
            missed: item.missed,
        }));

        res.status(200).json({
            data: formatted,
            totalPages: Math.ceil(total / limit),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch assets" });
    }
};


// ================= POST =================
exports.createKitchenAsset = async (req, res) => {
    try {
        let { item_name, quantity } = req.body;

        // ================= VALIDATION =================
        if (!item_name || typeof item_name !== "string") {
            return res.status(400).json({ message: "Item name is required" });
        }

        item_name = item_name.trim();

        quantity = Number(quantity || 0);

        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ message: "Quantity must be valid and >= 0" });
        }

        // ================= CHECK EXISTING (CASE-INSENSITIVE) =================
        let asset = await KitchenAsset.findOne({
            itemName: { $regex: `^${item_name}$`, $options: "i" }
        });

        // ================= CREATE NEW ITEM =================
        if (!asset) {
            const newAsset = new KitchenAsset({
                itemName: item_name,
                totalQuantity: quantity,
                availableQuantity: quantity,
                returned: 0,
                damaged: 0,
                missed: 0,
                soldOut: 0,
            });

            await newAsset.save();

            return res.status(201).json({
                message: "Item created successfully",
                data: newAsset,
            });
        }

        // ================= UPDATE EXISTING ITEM =================
        asset.totalQuantity += quantity;

        // 🔥 ALWAYS RECALCULATE (IMPORTANT)
        asset.availableQuantity =
            asset.totalQuantity -
            asset.damaged -
            asset.missed -
            asset.soldOut;

        // prevent negative
        if (asset.availableQuantity < 0) {
            asset.availableQuantity = 0;
        }

        await asset.save();

        return res.status(200).json({
            message: "Stock updated successfully",
            data: asset,
        });

    } catch (err) {
        console.error(err);

        if (err.code === 11000) {
            return res.status(400).json({ message: "Item already exists" });
        }

        return res.status(500).json({ message: "Failed to save asset" });
    }
};