const MarriageHallBooking = require("../Schema/MarriageHallBooking");
const MarriageHall = require("../Schema/MarriageHall");
const MarriageHallCategory = require("../Schema/MarriageHallCategory");
const MarriageHallKitchenAssets = require("../Schema/MarriageHallKitchenAsset");

exports.createBooking = async (req, res) => {
  try {
    const {
      hall,
      category,
      date,
      sessions,
      customerName,
      customerPhone,
      amount,
      advanceAmount = 0,
      booking_status = "Reserved",
    } = req.body;

    // 🔥 REQUIRED FIELDS
    if (!hall || !category || !date || !sessions?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: "Customer details required" });
    }

    // 🔥 PHONE VALIDATION
    if (!/^\d{10}$/.test(customerPhone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // 🔥 SESSION VALIDATION
    const validSessions = ["morning", "evening"];
    if (sessions.some((s) => !validSessions.includes(s))) {
      return res.status(400).json({ message: "Invalid session" });
    }

    // 🔥 DATE VALIDATION
    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    // 🔥 CHECK HALL
    const hallData = await MarriageHall.findById(hall);
    if (!hallData) {
      return res.status(404).json({ message: "Hall not found" });
    }

    // 🔥 CHECK CATEGORY
    const categoryData = await MarriageHallCategory.findById(category);
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🔥 CATEGORY BELONGS TO HALL
    const categoryInHall = hallData.categoryPrices.find(
      (c) => c.category.toString() === category
    );

    if (!categoryInHall) {
      return res.status(400).json({
        message: "Category not available in this hall",
      });
    }

    // 🔥 PRICE CHECK
    if (amount !== categoryInHall.price) {
      return res.status(400).json({
        message: "Amount mismatch",
      });
    }

    // 🔥 ADVANCE CHECK
    if (advanceAmount > amount) {
      return res.status(400).json({
        message: "Advance cannot exceed total amount",
      });
    }

    // 🔥 DOUBLE BOOKING CHECK 🚨
    const conflict = await MarriageHallBooking.findOne({
      hall,
      date: bookingDate,
      booking_status: { $ne: "Cancelled" },
      sessions: { $in: sessions },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Selected session already booked",
      });
    }

    // 🔥 CREATE BOOKING
    const booking = new MarriageHallBooking({
      ...req.body,
      date: bookingDate,
      advanceHistory: advanceAmount
        ? [{ amount: advanceAmount }]
        : [],
      payment_status: advanceAmount === amount ? "Paid" : "Unpaid",
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.getBookings = async (req, res) => {
  try {
    const { hallId, date, fromDate, toDate, search, page = 1, limit = 25 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query = {};

    if (hallId) {
      query.hall = hallId;
    }

    // 🔥 support both single date AND range
    if (date) {
      const start = new Date(date + "T00:00:00");
      const end = new Date(date + "T23:59:59.999");

      query.date = { $gte: start, $lte: end };
    } else if (fromDate || toDate) {
      query.date = {};

      if (fromDate) {
        query.date.$gte = new Date(fromDate + "T00:00:00");
      }

      if (toDate) {
        query.date.$lte = new Date(toDate + "T23:59:59.999");
      }
    }

    // (search)
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    const bookings = await MarriageHallBooking.find(query)
      .populate("hall")
      .populate("category")
      .sort({ date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await MarriageHallBooking.countDocuments(query);

    res.json({
      data: bookings,
      totalPages: Math.ceil(total / limitNum),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      hall,
      category,
      date,
      sessions,
      customerName,
      customerPhone,
      amount,
      advanceAmount = 0,
      booking_status = "Reserved",
    } = req.body;

    // 🔥 REQUIRED
    if (!hall || !category || !date || !sessions?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: "Customer details required" });
    }

    // 🔥 PHONE VALIDATION
    if (!/^\d{10}$/.test(customerPhone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // 🔥 SESSION VALIDATION
    const validSessions = ["morning", "evening"];
    if (sessions.some((s) => !validSessions.includes(s))) {
      return res.status(400).json({ message: "Invalid session" });
    }

    // 🔥 DATE
    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    // 🔥 CHECK EXISTING
    const existing = await MarriageHallBooking.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔥 CHECK HALL
    const hallData = await MarriageHall.findById(hall);
    if (!hallData) {
      return res.status(404).json({ message: "Hall not found" });
    }

    // 🔥 CHECK CATEGORY
    const categoryData = await MarriageHallCategory.findById(category);
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🔥 CATEGORY BELONGS TO HALL
    const categoryInHall = hallData.categoryPrices.find(
      (c) => c.category.toString() === category
    );

    if (!categoryInHall) {
      return res.status(400).json({
        message: "Category not available in this hall",
      });
    }

    // 🔥 PRICE CHECK
    if (amount !== categoryInHall.price) {
      return res.status(400).json({
        message: "Amount mismatch",
      });
    }

    // 🔥 ADVANCE CHECK
    if (advanceAmount > amount) {
      return res.status(400).json({
        message: "Advance cannot exceed total amount",
      });
    }

    // 🔥 DOUBLE BOOKING CHECK (exclude current booking)
    const conflict = await MarriageHallBooking.findOne({
      _id: { $ne: id }, // 👈 important
      hall,
      date: bookingDate,
      booking_status: { $ne: "Cancelled" },
      sessions: { $in: sessions },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Selected session already booked",
      });
    }

    // 🔥 PAYMENT STATUS AUTO UPDATE
    const payment_status = advanceAmount === amount ? "Paid" : "Unpaid";

    // 🔥 OPTIONAL: track advance history if increased
    let advanceHistory = existing.advanceHistory || [];

    if (advanceAmount > existing.advanceAmount) {
      advanceHistory.push({
        amount: advanceAmount - existing.advanceAmount,
      });
    }

    const updated = await MarriageHallBooking.findByIdAndUpdate(
      id,
      {
        hall,
        category,
        date: bookingDate,
        sessions,
        customerName,
        customerPhone,
        amount,
        advanceAmount,
        booking_status,
        payment_status,
        advanceHistory,
      },
      { new: true }
    );

    res.json({
      message: "Booking updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





exports.getBookingById = async (req, res) => {
  try {
    const booking = await MarriageHallBooking.findById(req.params.id)
      .populate("hall")
      .populate("category");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





exports.issueKitchenAssets = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items selected" });
    }

    const booking = await MarriageHallBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    for (const item of items) {
      const asset = await MarriageHallKitchenAssets.findById(item.asset_id);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      // 🔒 STOCK CHECK
      if (item.issued_qty > asset.availableQuantity) {
        return res.status(400).json({
          message: `${asset.itemName} only ${asset.availableQuantity} available`
        });
      }

      // 🔥 FIND EXISTING ITEM
      const existingItem = booking.issued_assets.kitchen.find(
        k => k.asset_id.toString() === item.asset_id
      );

      if (existingItem) {
        // ✅ UPDATE EXISTING
        existingItem.issued_qty += item.issued_qty;

      } else {
        // ✅ CREATE NEW
        booking.issued_assets.kitchen.push({
          asset_id: asset._id,
          item_name: asset.itemName,
          issued_qty: item.issued_qty,
          returned: 0,
          damaged: 0,
          missing: 0
        });
      }

      // 🔥 REDUCE STOCK
      asset.availableQuantity -= item.issued_qty;
      await asset.save();
    }

    await booking.save();

    res.json({
      message: "Kitchen assets updated successfully",
      data: booking
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// POST /bookings/:id/add-payment

exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const booking = await MarriageHallBooking.findById(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const paid =
      booking.advanceHistory.reduce((sum, i) => sum + i.amount, 0);

    const remaining = booking.amount - paid;

    if (amount > remaining) {
      return res.status(400).json({ message: "Exceeds remaining balance" });
    }

    booking.advanceHistory.push({ amount });
    booking.advanceAmount += amount;

    if (booking.advanceAmount === booking.amount) {
      booking.payment_status = "Paid";
    }

    await booking.save();

    res.json({ message: "Payment added", data: booking });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// POST /bookings/:id/update-kitchen-assets

exports.updateKitchenAssets = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const booking = await MarriageHallBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    for (const updateItem of items) {

      const item = booking.issued_assets.kitchen.find(
        i => i.asset_id.toString() === updateItem.asset_id.toString()
      );

      if (!item) continue;

      // ✅ SAFE VALUES
      const returned = Number(updateItem.returned || 0);
      const damaged = Number(updateItem.damaged || 0);
      const missing = Number(updateItem.missing || 0);

      // 🔒 NEGATIVE CHECK
      if (returned < 0 || damaged < 0 || missing < 0) {
        return res.status(400).json({ message: "Negative values not allowed" });
      }

      // 🔒 TOTAL VALIDATION
      if (returned + damaged + missing > item.issued_qty) {
        return res.status(400).json({
          message: `${item.item_name} total exceeds issued qty`
        });
      }

      // ✅ OLD VALUES
      const prevReturned = item.returned || 0;
      const prevDamaged = item.damaged || 0;
      const prevMissing = item.missing || 0;

      // ✅ DIFF
      const diffReturned = returned - prevReturned;
      const diffDamaged = damaged - prevDamaged;
      const diffMissing = missing - prevMissing;

      // 🔥 UPDATE BOOKING
      item.returned = returned;
      item.damaged = damaged;
      item.missing = missing;

      // 🔥 UPDATE MASTER STOCK
      const asset = await MarriageHallKitchenAssets.findById(item.asset_id);
      if (!asset) continue;

      // 🔒 PREVENT NEGATIVE MASTER VALUES
      if (
        asset.returned + diffReturned < 0 ||
        asset.damaged + diffDamaged < 0 ||
        asset.missed + diffMissing < 0
      ) {
        return res.status(400).json({
          message: `Invalid update for ${item.item_name}`
        });
      }

      asset.returned += diffReturned;
      asset.damaged += diffDamaged;
      asset.missed += diffMissing;

      // only returned affects stock
      asset.availableQuantity += diffReturned;

      await asset.save();
    }

    await booking.save();

    res.json({ message: "Assets updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// POST /bookings/:id/add-fine

exports.addFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { fine } = req.body;

    const booking = await MarriageHallBooking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    booking.fineAmount = fine;

    await booking.save();

    res.json({ message: "Fine added" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






exports.getIssuedAssets = async (req, res) => {
  try {
    const { page = 1, limit = 25, search } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query = {
      "issued_assets.kitchen.0": { $exists: true }
    };

    // 🔍 SEARCH (customer + hall)
    if (search) {

      // find halls matching search
      const halls = await MarriageHall.find({
        hall_name: { $regex: search, $options: "i" }
      }).select("_id");

      const hallIds = halls.map(h => h._id);

      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }, // optional (better UX)
        { hall: { $in: hallIds } }
      ];
    }

    const data = await MarriageHallBooking.find(query)
      .populate("hall")
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await MarriageHallBooking.countDocuments(query);

    res.json({
      data,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};