const Cemetery = require("../Schema/Cemetery");

// 🔹 Add Cemetery
exports.addCemetery = async (req, res) => {
  try {
    const {
      cemeteryName,
      cemeteryLocation,
      plots,
      numberOfAvailablePlots
    } = req.body;

    // ✅ Validation
    if (!cemeteryName || !cemeteryLocation) {
      return res.status(400).json({
        message: "Cemetery name and location are required"
      });
    }

    if (!Array.isArray(plots)) {
      return res.status(400).json({
        message: "Plots must be a 2D array"
      });
    }


    // ✅ Create
  
  
    const newCemetery = new Cemetery({
      cemeteryName: cemeteryName.trim(),
      cemeteryLocation: cemeteryLocation.trim(),
      plots,
      numberOfAvailablePlots: numberOfAvailablePlots || 0,
    });

    await newCemetery.save();

    res.status(201).json({
      message: "Cemetery created successfully",
      cemetery: newCemetery
    });

  } catch (error) {
    console.error("Add Cemetery Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// 🔹 Get Cemetery (Pagination + Search)
exports.getCemetery = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    // 🔍 Search by name or location
    if (search) {
      query.$or = [
        { cemeteryName: { $regex: search, $options: "i" } },
        { cemeteryLocation: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Cemetery.countDocuments(query);

    const cemetery = await Cemetery.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      cemetery,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Get Cemetery Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};