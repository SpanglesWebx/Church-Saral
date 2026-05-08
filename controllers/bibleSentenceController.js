const BibleSentence = require("../Schema/BibleSentence");

// ➤ Create Sentence
exports.createSentence = async (req, res) => {
  try {
    const sentence = new BibleSentence(req.body);
    await sentence.save();

    return res.json({
      status: "Success",
      message: "Bible sentence added successfully",
      data: sentence,
    });        
  } catch (err) {
    return res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};

// ➤ Get Sentences (Search + Pagination)
exports.getSentences = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "", startDate, endDate, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};

    // 🔎 Search Filter
    if (search) {
      query.$or = [
        { book: { $regex: search, $options: "i" } },
        { sentence: { $regex: search, $options: "i" } },
      ];
    }

    // 🔘 Status Filter
    if (status !== undefined && status !== "") {
      query.status = status === "true";
    }

    // 📅 Date Filter
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full day
        query.createdAt.$lte = end;
      }
    }

    const sentences = await BibleSentence.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await BibleSentence.countDocuments(query);

    res.json({
      status: "Success",
      data: sentences,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};



exports.updateSentence = async (req, res) => {
  try {

    const sentence = await BibleSentence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      status: "Success",
      message: "Bible verse updated successfully",
      data: sentence
    });

  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message
    });
  }
};