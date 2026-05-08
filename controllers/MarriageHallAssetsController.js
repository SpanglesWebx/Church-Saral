const MarriageHallAssetCategory = require("../Schema/MarriageHallAssetCategory");
const MarriageHallAssets = require("../Schema/MarriageHallAssets");
const MarriageHall = require("../Schema/MarriageHall");

// ================= CATEGORY =================

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name required" });
    }

    const exists = await MarriageHallAssetCategory.findOne({
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await MarriageHallAssetCategory.create({
      name: name.trim(),
      items: [],
    });

    res.json({ message: "Category created", data: category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const data = await MarriageHallAssetCategory.find().sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ITEM =================

// ADD ITEM TO CATEGORY
exports.addItemToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { item } = req.body;

    if (!item || !item.trim()) {
      return res.status(400).json({ message: "Item name required" });
    }

    const category = await MarriageHallAssetCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🔥 Prevent duplicate item
    const exists = category.items.find(
      (i) => i.name.toLowerCase() === item.trim().toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Item already exists" });
    }

    category.items.push({ name: item.trim() });
    await category.save();

    res.json({ message: "Item added", data: category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= HALL ASSETS =================

// ADD / UPDATE HALL ASSET
exports.addHallAsset = async (req, res) => {
  try {
    const {
      hallId,
      hallName,
      categoryId,
      categoryName,
      itemName,
      quantity,
    } = req.body;

    // ✅ VALIDATION
    if (!hallId || !categoryId || !itemName || !quantity) {
      return res.status(400).json({
        message: "hall, category, item and quantity are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // 🔍 Check Hall Exists
    const hall = await MarriageHall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    let hallAssets = await MarriageHallAssets.findOne({ hallId });

    // 🆕 Create if not exists
    if (!hallAssets) {
      hallAssets = new MarriageHallAssets({
        hallId,
        hallName,
        categories: [],
      });
    }

    // 🔍 Find category
    let category = hallAssets.categories.find(
      (c) => c.categoryId.toString() === categoryId
    );

    if (!category) {
      // 🆕 Add category
      hallAssets.categories.push({
        categoryId,
        categoryName,
        items: [{ itemName, quantity }],
      });
    } else {
      // 🔍 Find item
      let item = category.items.find((i) => i.itemName === itemName);

      if (!item) {
        category.items.push({ itemName, quantity });
      } else {
        // 🔁 UPDATE quantity
        item.quantity = Number(item.quantity) + Number(quantity);
      }
    }

    await hallAssets.save();

    res.json({ message: "Hall asset saved", data: hallAssets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL HALL ASSETS
exports.getHallAssets = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "" } = req.query;

    page = Number(page);
    limit = Number(limit);

    // ✅ SEARCH FILTER (hallName)
    const filter = {};

    if (search) {
      filter.hallName = { $regex: search, $options: "i" }; // case-insensitive
    }

    // ✅ TOTAL COUNT
    const total = await MarriageHallAssets.countDocuments(filter);

    // ✅ FETCH DATA WITH PAGINATION
    const data = await MarriageHallAssets.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ✅ ADD EXTRA CALCULATED FIELDS
    const formatted = data.map((doc) => {
      let noOfCategories = doc.categories.length;
      let noOfItems = 0;
      let totalQuantity = 0;

      doc.categories.forEach((cat) => {
        noOfItems += cat.items.length;

        cat.items.forEach((item) => {
          totalQuantity += item.quantity;
        });
      });

      return {
        _id: doc._id,
        hallId: doc.hallId,
        hallName: doc.hallName,
        noOfCategories,
        noOfItems,
        totalQuantity,
      };
    });

    res.json({
      data: formatted,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getHallAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MarriageHallAssets.findOne({ hallId: id }).lean();

    if (!data) {
      return res.status(404).json({ message: "Hall asset not found" });
    }

    res.json({ data });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};