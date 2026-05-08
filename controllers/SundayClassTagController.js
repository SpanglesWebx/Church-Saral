const SundayClassTag = require("../Schema/SundayClassTag");

// GET → For dropdown
exports.getSundayClassTags = async (req, res) => {
  try {
    const tags = await SundayClassTag.find().sort({ name: 1 });
    res.status(200).json({ classTags: tags });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch class tags" });
  }
};

// PUT → Add / Update class list
exports.updateSundayClassTags = async (req, res) => {
  try {
    let { names } = req.body;

    if (!Array.isArray(names)) {
      return res.status(400).json({ message: "Names must be an array" });
    }

    // sanitize
    names = names
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      return res.status(400).json({ message: "At least one class is required" });
    }

    const uniqueNames = [...new Set(names)];

    await SundayClassTag.deleteMany({});
    const newTags = await SundayClassTag.insertMany(
      uniqueNames.map(name => ({ name }))
    );

    res.status(200).json({
      message: "Class list updated",
      classTags: newTags,
    });
  } catch (err) {
    console.error("Update class tags error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

