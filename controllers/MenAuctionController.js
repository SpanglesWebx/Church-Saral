const MenAuction = require("../Schema/MenAuctionSchema");
const MenAuctionPayment = require("../Schema/MenAuctionPaymentSchema");
const Members = require("../Schema/memberSchema");

// ➤ Add Auction
exports.addAuction = async (req, res) => {
  try {

    const { seller, buyer, item, amount } = req.body;

    if (!seller || !buyer)
      return res.status(400).json({ message: "Seller & Buyer required" });

    const auction = new MenAuction({
      seller,
      buyer,
      item,
      amount,
      balance: amount,
      totalPaid: 0
    });

    await auction.save();

    res.status(201).json({
      success: true,
      message: "Auction created",
      data: auction
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get All Auctions (with pagination + filters if needed)
exports.getAuctions = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      search = "",
      startDate,
      endDate,
      payment_status
    } = req.query;

    const query = {};

    // ✅ SEARCH USING MEMBER COLLECTION
    if (search) {

      const members = await Members.find({
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const memberIds = members.map(m => m._id);

      query.$or = [
        { seller: { $in: memberIds } },
        { buyer: { $in: memberIds } },
        { item: { $regex: search, $options: "i" } }
      ];
    }

    // ✅ DATE FILTER
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // ✅ PAYMENT STATUS
    if (payment_status) {
      query.payment_status = payment_status;
    }

    // ✅ FETCH DATA WITH POPULATE
    const auctions = await MenAuction.find(query)
      .populate("seller", "member_id member_name mobile_number")
      .populate("buyer", "member_id member_name mobile_number")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MenAuction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: auctions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get Men Auctions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Get Single Auction by ID
exports.getAuctionById = async (req, res) => {
  try {

    const auction = await MenAuction.findById(req.params.id)
      .populate("seller", "member_id member_name mobile_number")
      .populate("buyer", "member_id member_name mobile_number");

    if (!auction)
      return res.status(404).json({ message: "Not found" });

    res.json({ data: auction });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Update Auction (e.g., payment status, buyer info, etc.)
exports.updateAuction = async (req, res) => {
  try {

    const auction = await MenAuction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("seller", "member_id member_name")
      .populate("buyer", "member_id member_name");

    res.json({ success: true, auction });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Delete Auction
exports.deleteAuction = async (req, res) => {
  try {

    await MenAuction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function buildBuyerReport({ buyerId, buyerPhone }) {
  const filter = buyerId ? { buyerId } : { buyerPhone };
  const auctions = await MenAuction.find(filter).lean();
  const payments = await MenAuctionPayment.find(filter).lean(); // ✅ fetch from separate collection

  const totalAuctionAmount = auctions.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const overallUnpaid = totalAuctionAmount - totalPayments;

  const auctionDetails = auctions.map(a => ({
    _id: a._id,
    date: a.date,
    item: a.item,
    amount: a.amount,
    sellerId: a.sellerId || "",
    sellerName: a.sellerName || "",
    payment_status: a.payment_status,
  }));

  return {
    key: buyerId || `PHONE:${buyerPhone}`,
    isMember: !!buyerId,
    buyerId: buyerId || "",
    buyerName: auctions[0]?.buyerName || "Unknown",
    buyerPhone: buyerPhone || auctions[0]?.buyerPhone || "",
    auctions: auctionDetails,
    payments: payments.map(p => ({ date: p.date, amount: p.amountPaid })),
    overallUnpaid,
  };
}



// ➤ Get Men Auction Report (buyer-wise) with Search & Pagination
exports.getMenAuctionReportByBuyer = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const auctions = await MenAuction.find()
      .populate("buyer", "member_id member_name primary_contact")
      .populate("seller", "member_name")
      .lean();

    const payments = await MenAuctionPayment.find()
      .populate("buyer", "member_id member_name primary_contact")
      .lean();

    const map = {};

    // 🔹 GROUP AUCTIONS
    auctions.forEach(a => {
      if (!a.buyer) return;

      const key = a.buyer._id.toString();

      if (!map[key]) {
        map[key] = {
          buyerId: a.buyer.member_id,
          buyerName: a.buyer.member_name,
          buyerPhone: a.buyer.primary_contact || "",
          isMember: true,
          auctions: [],
          payments: [],
          totalAuctionAmount: 0,
          totalPayments: 0
        };
      }

      map[key].auctions.push({
        _id: a._id,
        date: a.createdAt,
        item: a.item,
        amount: a.amount,
        sellerName: a.seller?.member_name || ""
      });

      map[key].totalAuctionAmount += a.amount;
    });

    // 🔹 ADD PAYMENTS
    payments.forEach(p => {
      if (!p.buyer) return;

      const key = p.buyer._id.toString();

      if (map[key]) {
        map[key].payments.push({
          date: p.date,
          amount: p.amountPaid
        });

        map[key].totalPayments += p.amountPaid;
      }
    });

    let result = Object.values(map).map(r => ({
      ...r,
      overallUnpaid: r.totalAuctionAmount - r.totalPayments
    }));

    // 🔍 SEARCH FILTER
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        r.buyerName.toLowerCase().includes(s) ||
        r.buyerId.toLowerCase().includes(s)
      );
    }

    // 🔹 PAGINATION
    const total = result.length;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + Number(limit));

    res.json({
      data: paginated,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Add Payment to single auction
exports.addMenAuctionPayment = async (req, res) => {
  try {

    const { auctionId, amountPaid } = req.body;

    const auction = await MenAuction
      .findById(auctionId)
      .populate("buyer")
      .populate("seller");

    if (!auction)
      return res.status(404).json({ message: "Auction not found" });

    const newTotalPaid = (auction.totalPaid || 0) + amountPaid;
    const newBalance = auction.amount - newTotalPaid;

    // ✅ Update auction
    auction.totalPaid = newTotalPaid;
    auction.balance = newBalance;
    auction.payment_status = newBalance <= 0 ? "Paid" : "Unpaid";

    auction.payments.push({
      amountPaid,
      date: new Date(),
      balanceAfter: newBalance
    });

    await auction.save();

    // ✅ SAVE IN PAYMENT COLLECTION (FIXED)
    await MenAuctionPayment.create({
      menAuctionId: auction._id,
      buyer: auction.buyer._id,
      seller: auction.seller._id,
      amountPaid,
      balanceAfter: newBalance
    });

    res.status(201).json({
      message: "Payment added successfully",
      auction
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

