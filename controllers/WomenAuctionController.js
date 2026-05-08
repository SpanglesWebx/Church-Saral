
const mongoose = require("mongoose");
const WomenAuction = require("../Schema/WomenAuctionSchema");
const WomenAuctionPayment = require("../Schema/WomenAuctionPaymentSchema");
const Members = require("../Schema/memberSchema");

// ➤ Add Auction
exports.addAuction = async (req, res) => {

  try {

    const {
      seller,
      buyer,
      item,
      amount
    } = req.body;

    /* ---------------------------
       VALIDATION
    ---------------------------- */

    if (!seller)
      return res.status(400).json({ message: "Seller is required" });

    if (!buyer)
      return res.status(400).json({ message: "Buyer is required" });

    if (!item || item.trim() === "")
      return res.status(400).json({ message: "Item is required" });

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Amount must be greater than 0" });

    if (!mongoose.Types.ObjectId.isValid(seller))
      return res.status(400).json({ message: "Invalid seller member" });

    if (!mongoose.Types.ObjectId.isValid(buyer))
      return res.status(400).json({ message: "Invalid buyer member" });

    /* ---------------------------
       VERIFY MEMBERS
    ---------------------------- */

    const sellerMember = await Members.findById(seller);
    if (!sellerMember)
      return res.status(404).json({ message: "Seller member not found" });

    const buyerMember = await Members.findById(buyer);
    if (!buyerMember)
      return res.status(404).json({ message: "Buyer member not found" });

    /* ---------------------------
       CREATE AUCTION
    ---------------------------- */

    const auction = new WomenAuction({

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
      message: "Auction created successfully",
      data: auction
    });

  } catch (error) {

    console.error("Add Auction Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating auction"
    });

  }

};

// ➤ Get All Auctions
exports.getAuctions = async (req, res) => {

  try {

    const {
      page = 1,
      limit = 25,
      search = "",
      startDate,
      endDate,
      payment_status
    } = req.query;

    const query = {};

    /* -----------------------
       SEARCH LOGIC
    ----------------------- */

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

    /* -----------------------
       DATE FILTER
    ----------------------- */

    if (startDate && endDate) {

      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };

    }

    /* -----------------------
       PAYMENT STATUS
    ----------------------- */

    if (payment_status) {
      query.payment_status = payment_status;
    }

    /* -----------------------
       FETCH DATA
    ----------------------- */

    const auctions = await WomenAuction
      .find(query)
      .populate("seller", "member_id member_name mobile_number")
      .populate("buyer", "member_id member_name mobile_number")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WomenAuction.countDocuments(query);

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

    console.error("Get Auctions Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching auctions"
    });

  }

};

// ➤ Get Auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await WomenAuction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    res.status(200).json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Update Auction
exports.updateAuction = async (req, res) => {
  try {
    const auction = await WomenAuction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    res.status(200).json({ success: true, message: "Auction updated", auction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ➤ Delete Auction
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await WomenAuction.findByIdAndDelete(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    res.status(200).json({ success: true, message: "Auction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Internal helper
async function buildBuyerReport({ buyerId, buyerPhone }) {
  const filter = buyerId ? { buyerId } : { buyerPhone };
  const auctions = await WomenAuction.find(filter).lean();
  const payments = await WomenAuctionPayment.find(filter).lean();

  const totalAuctionAmount = auctions.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const overallUnpaid = totalAuctionAmount - totalPayments;

  return {
    key: buyerId || `PHONE:${buyerPhone}`,
    isMember: !!buyerId,
    buyerId: buyerId || "",
    buyerName: auctions[0]?.buyerName || "Unknown",
    buyerPhone: buyerPhone || auctions[0]?.buyerPhone || "",
    auctions: auctions.map(a => ({
      _id: a._id,
      date: a.date,
      item: a.item,
      amount: a.amount,
      sellerId: a.sellerId || "",
      sellerName: a.sellerName || "",
      payment_status: a.payment_status,
    })),
    payments: payments.map(p => ({ date: p.date, amount: p.amountPaid })),
    overallUnpaid,
  };
}

// ➤ Get Women Auction Report
exports.getWomenAuctionReportByBuyer = async (req, res) => {
  try {

    const auctions = await WomenAuction.find()
      .populate("buyer", "member_id member_name primary_contact")
      .populate("seller", "member_id member_name primary_contact")
      .lean();

    const payments = await WomenAuctionPayment.find()
      .populate("buyer", "member_id member_name primary_contact")
      .populate("seller", "member_id member_name primary_contact")
      .lean();

    const reportMap = {};

    // 🔹 Auctions
    auctions.forEach(a => {
      const buyerKey = a.buyer._id.toString();

      if (!reportMap[buyerKey]) {
        reportMap[buyerKey] = {
          buyerId: a.buyer.member_id,
          buyerName: a.buyer.member_name,
          buyerPhone: a.buyer.primary_contact,
          auctions: [],
          payments: [],
          totalAuctionAmount: 0,
          totalPayments: 0
        };
      }

      reportMap[buyerKey].auctions.push({
        _id: a._id,
        date: a.createdAt,
        item: a.item,
        amount: a.amount,
        sellerName: a.seller.member_name
      });

      reportMap[buyerKey].totalAuctionAmount += a.amount;
    });

    // 🔹 Payments
    payments.forEach(p => {
      const buyerKey = p.buyer._id.toString();

      if (reportMap[buyerKey]) {
        reportMap[buyerKey].payments.push({
          date: p.date,
          amount: p.amountPaid
        });

        reportMap[buyerKey].totalPayments += p.amountPaid;
      }
    });

    const finalReport = Object.values(reportMap).map(r => ({
      ...r,
      overallUnpaid: r.totalAuctionAmount - r.totalPayments
    }));

    res.json({ data: finalReport });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Add Payment
exports.addWomenAuctionPayment = async (req, res) => {
  try {
    const { auctionId, amountPaid } = req.body;

    const auction = await WomenAuction
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

    // ✅ SAVE PAYMENT COLLECTION (NEW)
    const payment = new WomenAuctionPayment({
      womenAuctionId: auction._id,
      buyer: auction.buyer._id,
      seller: auction.seller._id,
      amountPaid,
      balanceAfter: newBalance
    });

    await payment.save();

    res.status(201).json({
      message: "Payment added successfully",
      auction
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};