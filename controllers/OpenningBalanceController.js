const OpeningBalance = require("../Schema/OpenningBalanceSchema");
const LedgerCategory = require("../Schema/LedgerCategory");

// CREATE
exports.addOpeningBalance = async (req, res) => {
  try {
    const { ledger_code, ledger_name, amount, as_on_date } = req.body;

    if (!ledger_code || !amount || !as_on_date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newBalance = new OpeningBalance({
      account_type: "Assets-Current Assets",
      ledger_code,
      ledger_name,
      amount,
      as_on_date,
    });

    await newBalance.save();

    res.status(201).json({ message: "Opening balance created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getCurrentAssetLedgers = async (req, res) => {
  try {
    const categories = await LedgerCategory.find({
      accountType: "Assets-Current Assets",
      status: "active",
    });

    let ledgers = [];

    categories.forEach((cat) => {
      const activeLedgers = cat.ledgers.filter(
        (l) => l.status === "active"
      );

      ledgers.push(...activeLedgers);
    });

    res.json({ ledgers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ledgers" });
  }
};




exports.listOpeningBalances = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      from,
      to,
    } = req.query;

    // 🔥 Build filter
    let filter = {};

    // 🔍 SEARCH (ledger_name)
    if (search) {
      filter.ledger_name = {
        $regex: search,
        $options: "i", // case insensitive
      };
    }

    // 📅 DATE FILTER
    if (from || to) {
      filter.as_on_date = {};

      if (from) {
        filter.as_on_date.$gte = new Date(from);
      }

      if (to) {
        filter.as_on_date.$lte = new Date(to);
      }
    }

    // 🔢 Pagination values
    const skip = (Number(page) - 1) * Number(limit);

    // 📊 Fetch data
    const data = await OpeningBalance.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 📊 Total count
    const total = await OpeningBalance.countDocuments(filter);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching balances" });
  }
};