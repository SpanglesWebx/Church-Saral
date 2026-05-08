const MarriageHall = require("../Schema/MarriageHall");
const MarriageHallCategory = require("../Schema/MarriageHallCategory");


// ================= CREATE HALL =================
exports.createHall = async (req, res) => {
  try {
    const {
      reg_no,
      hall_name,
      address,
      hall_capacity,
      dining_capacity,
    } = req.body;

    // 🔥 REQUIRED FIELD VALIDATION
    if (!reg_no) {
      return res.status(400).json({ message: "Register Number is required" });
    }

    if (!hall_name) {
      return res.status(400).json({ message: "Hall Name is required" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    // 🔥 OPTIONAL NUMERIC VALIDATION
    if (hall_capacity && hall_capacity < 0) {
      return res.status(400).json({ message: "Invalid hall capacity" });
    }

    if (dining_capacity && dining_capacity < 0) {
      return res.status(400).json({ message: "Invalid dining capacity" });
    }

    // 🔥 UNIQUE CHECK (better error)
    const exists = await MarriageHall.findOne({ reg_no });
    if (exists) {
      return res.status(400).json({ message: "Register Number already exists" });
    }

    const hall = new MarriageHall(req.body);
    await hall.save();

    res.status(201).json({
      message: "Hall created successfully",
      data: hall,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= GET HALLS =================
exports.getHalls = async (req, res) => {
  try {
    const { page = 1, limit = 25, search } = req.query;

    const query = search
      ? {
          hall_name: { $regex: search, $options: "i" },
        }
      : {};

    const halls = await MarriageHall.find(query)
      .populate("categoryPrices.category") // 🔥 important
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await MarriageHall.countDocuments(query);

    res.json({
      data: halls,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= UPDATE HALL =================
exports.updateHall = async (req, res) => {
  try {
    const {
      reg_no,
      hall_name,
      address,
    } = req.body;

    if (!reg_no || !hall_name || !address) {
      return res.status(400).json({
        message: "Register Number, Hall Name and Address are required",
      });
    }

    const hall = await MarriageHall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Hall updated successfully",
      data: hall,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= CREATE CATEGORY =================
exports.createCategory = async (req, res) => {
  try {
    const category = new MarriageHallCategory(req.body);
    await category.save();

    res.json({
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};


// ================= GET CATEGORIES =================
exports.getCategories = async (req, res) => {
  try {
    const categories = await MarriageHallCategory.find().sort({ name: 1 });

    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= ADD / UPDATE PRICES =================
exports.addOrUpdatePrices = async (req, res) => {
  try {
    const { categoryPrices } = req.body;
    const hallId = req.params.id;

    const hall = await MarriageHall.findById(hallId);

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    categoryPrices.forEach((newItem) => {
      const existing = hall.categoryPrices.find(
        (cp) => cp.category.toString() === newItem.category
      );

      if (existing) {
        // update
        existing.price = newItem.price;
      } else {
        // add new
        hall.categoryPrices.push(newItem);
      }
    });

    await hall.save();

    res.json({ message: "Prices updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= DELETE CATEGORY FROM HALL =================
exports.deleteCategoryFromHall = async (req, res) => {
  try {
    const { hallId, categoryId } = req.params;

    const hall = await MarriageHall.findById(hallId);

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    hall.categoryPrices = hall.categoryPrices.filter(
      (cp) => cp.category.toString() !== categoryId
    );

    await hall.save();

    res.json({ message: "Category removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};