// controllers/offeringController.js
const Offering = require("../Schema/OfferingSchema");


const BagOffering = require("../Schema/BagOfferingSchema");
const CoverOffering = require("../Schema/CoverOfferingSchema");
const generateTransId = require("../util/generateTransId");

const moment = require("moment");


/* =========================================================
   CREATE OFFERING
   ========================================================= */
exports.createOffering = async (req, res) => {
  try {
    const { offeringType, offeringName } = req.body;

    if (!offeringType || !offeringName) {
      return res.status(400).json({
        message: "Offering type and offering name are required",
      });
    }

    // 🔍 Find document by offeringType
    let offeringDoc = await Offering.findOne({ offeringType });

    // 🆕 If not exists, create new type
    if (!offeringDoc) {
      offeringDoc = new Offering({
        offeringType,
        offerings: [],
      });
    }

    // 🔁 DUPLICATE CHECK inside sub-array (case-insensitive)
    const alreadyExists = offeringDoc.offerings.some(
      (o) => o.offeringName.toLowerCase() === offeringName.trim().toLowerCase()
    );

    if (alreadyExists) {
      return res.status(409).json({
        message: "Offering already exists under this type",
      });
    }

    // ➕ PUSH new offering
    offeringDoc.offerings.push({
      offeringName: offeringName.trim(),
      createdAt: new Date(),
    });

    await offeringDoc.save();

    res.status(201).json({
      message: "Offering created successfully",
      offeringType: offeringDoc.offeringType,
      offering: offeringName,
    });
  } catch (error) {
    console.error("Create Offering Error:", error);
    res.status(500).json({
      message: "Server error while creating offering",
    });
  }
};

/* =========================================================
   GET OFFERINGS (PAGINATION + SEARCH)
   ========================================================= */

exports.getOfferings = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", offeringType = "All" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const matchStage = {};

    if (offeringType !== "All") {
      matchStage.offeringType = offeringType;
    }

    if (search) {
      matchStage["offerings.offeringName"] = {
        $regex: search,
        $options: "i",
      };
    }

    const pipeline = [
      { $unwind: "$offerings" },
      { $match: matchStage },
      {
        $project: {
          offeringType: 1,
          offeringName: "$offerings.offeringName",
          status: "$offerings.status",
          createdAt: "$offerings.createdAt",
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const allData = await Offering.aggregate(pipeline);

    const total = allData.length;
    const paginatedData = allData.slice(
      (page - 1) * limit,
      page * limit
    );

    res.status(200).json({
      data: paginatedData,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    console.error("Get Offerings Error:", error);
    res.status(500).json({
      message: "Server error while fetching offerings",
    });
  }
};


exports.getOfferingTypes = async (req, res) => {
  try {
    const data = await Offering.aggregate([
      {
        $project: {
          offeringType: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error("Get Offering Types Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};








exports.updateOfferingStatus = async (req, res) => {
  try {
    const { offeringType, offeringName, status } = req.body;

    if (!offeringType || !offeringName || !status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const offeringDoc = await Offering.findOne({ offeringType });

    if (!offeringDoc) {
      return res.status(404).json({ message: "Offering type not found" });
    }

    const offering = offeringDoc.offerings.find(
      (o) => o.offeringName === offeringName
    );

    if (!offering) {
      return res.status(404).json({ message: "Offering not found" });
    }

    /* =====================================================
       BLOCK INACTIVE IF COVER MONTHLY OFFERTORY EXISTS
    ===================================================== */

    if (
      offeringType === "Cover" &&
      offeringName === "Monthly Offertory" &&
      status === "Inactive"
    ) {
      const exists = await CoverOffering.exists({
        offertoryType: offeringName
      });

      if (exists) {
        return res.status(400).json({
          message:
            "Monthly Offertory already has records. It cannot be set to inactive.",
        });
      }
    }

    /* ===================================================== */

    offering.status = status;
    await offeringDoc.save();

    res.json({
      message: "Status updated successfully",
      status,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ======================================================
   ADD BAG OFFERING
====================================================== */
exports.addBagOffering = async (req, res) => {
  try {
    const { subCategory, date, day, amount, description } = req.body;

    if (!subCategory || !date || !day || amount === undefined) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const doc = new BagOffering({

      subCategory,
      date,
      day,
      amount,
      description,
    });

    // 2️⃣ GENERATE TRANS ID AFTER VALIDATION
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const transId = await generateTransId("Bag", formattedDate);

    doc.transId = transId;

    await doc.save();

    res.status(201).json({ message: "Bag offering added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};






exports.getBagOfferings = async (req, res) => {
  try {
    let { page = 1, limit = 15, search = "", fromDate, toDate } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (search) {
      query.subCategory = { $regex: search, $options: "i" };
    }

    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59"),
      };
    }

    const data = await BagOffering.find(query)
      .sort({ date: -1, transId: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await BagOffering.countDocuments(query);

    res.json({
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getBagSubCategories = async (req, res) => {
  try {
    const data = await Offering.aggregate([
      { $match: { offeringType: "Bag" } },
      { $unwind: "$offerings" },
      { $match: { "offerings.status": "Active" } },
      {
        $project: {
          _id: 0,
          offeringName: "$offerings.offeringName",
          status: "$offerings.status",
          createdAt: "$offerings.createdAt",
        },
      },
    ]);

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





exports.getCoverSubCategories = async (req, res) => {
  const data = await Offering.aggregate([
    { $match: { offeringType: "Cover" } },
    { $unwind: "$offerings" },
    { $match: { "offerings.status": "Active" } },
    {
      $project: {
        _id: 0,
        offeringName: "$offerings.offeringName",
      },
    },
  ]);
  res.json(data);
};
