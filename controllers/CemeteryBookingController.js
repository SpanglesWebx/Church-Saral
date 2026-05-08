const mongoose = require("mongoose");
const CemeteryBooking = require("../Schema/CemeteryBooking");
const Members = require("../Schema/memberSchema");

// ➕ Create booking

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cemeteryId,
      bookingMode,
      bookingPerson,
      bookings
    } = req.body;

    // ✅ MAIN VALIDATION
    if (!cemeteryId) {
      return res.status(400).json({
        message: "Cemetery ID is required"
      });
    }

    if (!Array.isArray(bookings)) {
      return res.status(400).json({
        message: "Bookings must be an array"
      });
    }

    // ✅ AT LEAST ONE BURIED PERSON
    if (bookings.length === 0) {
      return res.status(400).json({
        message: "At least one buried person is required"
      });
    }

    const docsToInsert = [];

    for (const item of bookings) {

      const {
        slotId,
        buriedPersonName,
        buriedDate,
        isBuriedMember,
        buriedMemberId
      } = item;

      // ✅ SLOT REQUIRED
      if (!slotId) {
        throw new Error("Slot ID is required");
      }

      // ✅ BURIED PERSON NAME REQUIRED
      if (!buriedPersonName || !buriedPersonName.trim()) {
        throw new Error(`Buried person name is required for slot ${slotId}`);
      }

      // ✅ BURIED DATE REQUIRED
      if (!buriedDate) {
        throw new Error(`Buried date is required for slot ${slotId}`);
      }

      // ✅ MEMBER REQUIRED
      if (isBuriedMember && !buriedMemberId) {
        throw new Error(`Please select buried member for slot ${slotId}`);
      }

      // ✅ SLOT LIMIT CHECK
      // const count = await CemeteryBooking.countDocuments({
      //   cemeteryId,
      //   slotId,
      //   status: { $ne: "Cancelled" }
      // }).session(session);

      // if (count >= 4) {
      //   throw new Error(`Slot ${slotId} is full`);
      // }



      const slotBookings = await CemeteryBooking.find({
        cemeteryId,
        slotId,
        status: { $ne: "Cancelled" }
      }).session(session);

      // const latestBooking =
      //   slotBookings.length > 0
      //     ? slotBookings[slotBookings.length - 1]
      //     : null;

      const latestBooking =
        [...slotBookings].sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )[0];

      // ========================
      // RESERVATION MODE
      // ========================
      if (bookingMode === "reservation") {

        // buried slot cannot reserve again
        if (latestBooking?.status === "Buried") {
          throw new Error(`Slot ${slotId} already buried`);
        }

        if (slotBookings.length >= 4) {
          throw new Error(`Slot ${slotId} is full`);
        }
      }

      // ========================
      // BURIAL MODE
      // ========================
      if (bookingMode === "burial") {

        // burial only for reserved slot
        if (latestBooking?.status !== "Reserved") {
          throw new Error(
            `Only reserved slot can be buried`
          );
        }
      }

      // ✅ DUPLICATE PERSON CHECK
      const exists = await CemeteryBooking.findOne({
        cemeteryId,
        slotId,
        "buriedPerson.name": buriedPersonName.trim()
      }).session(session);

      if (exists) {
        throw new Error(
          `${buriedPersonName} already exists in slot ${slotId}`
        );
      }

      docsToInsert.push({
        cemeteryId,
        slotId,

        // ✅ BOOKING PERSON
        bookingPerson: {
          isMember: bookingPerson.isMember,

          memberId: bookingPerson.isMember
            ? bookingPerson.memberId
            : null,

          nonMember: !bookingPerson.isMember
            ? bookingPerson.nonMember
            : null,
        },

        // ✅ BURIED PERSON
        buriedPerson: {
          isMember: isBuriedMember,

          memberId: isBuriedMember
            ? buriedMemberId
            : null,

          nonMember: !isBuriedMember
            ? {
              name: buriedPersonName.trim()
            }
            : null,

          name: buriedPersonName.trim(),

          buriedDate,
        },

        status:
          bookingMode === "burial"
            ? "Buried"
            : "Reserved",

        slotClosed:
          bookingMode === "burial",

        reservedAt:
          bookingMode === "reservation"
            ? new Date()
            : null,

        buriedAt:
          bookingMode === "burial"
            ? new Date()
            : null,
      });
    }

    const createdBookings = await CemeteryBooking.insertMany(
      docsToInsert,
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Bookings created successfully",
      bookings: createdBookings
    });

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      message: err.message || "Booking failed"
    });
  }
};

// 📄 Get bookings
exports.getBookings = async (req, res) => {
  try {
    const { cemeteryId } = req.query;

    const filter = cemeteryId ? { cemeteryId } : {};

    const bookings = await CemeteryBooking.find(filter)

      // booking person
      .populate({
        path: "bookingPerson.memberId",
        select: `
      member_id
      member_name
      member_tamil_name
      gender
      primary_contact
      aadhar_number
      permanent_address
      present_address
      status
    `
      })

      // buried person
      .populate({
        path: "buriedPerson.memberId",
        select: `
      member_id
      member_name
      member_tamil_name
      gender
      primary_contact
      aadhar_number
      permanent_address
      present_address
      status
    `
      });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};


// ✅ Close slot
// exports.closeSlot = async (req, res) => {
//   try {
//     const { cemeteryId, slotId } = req.body;

//     const result = await CemeteryBooking.updateMany(
//       {
//         cemeteryId,
//         slotId,
//         status: { $ne: "Buried" }
//       },
//       {
//         $set: {
//           slotClosed: true,
//           status: "Buried"
//         }
//       }
//     );

//     res.json({
//       message: "Slot closed & bookings cancelled",
//       updatedCount: result.modifiedCount
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error closing slot" });
//   }
// };




exports.updateBurialBooking = async (req, res) => {

  try {

    const {
      cemeteryId,
      bookings
    } = req.body;

    for (const item of bookings) {

      const booking =
        await CemeteryBooking.findOne({
          cemeteryId,
          slotId: item.slotId,
          status: "Reserved"
        }).sort({ bookedAt: -1 });


      if (!booking) {
        throw new Error(
          `Reserved slot not found for ${item.slotId}`
        );
      }

      // =========================
      // UPDATE BOOKING PERSON
      // =========================

      booking.bookingPerson = {

        isMember:
          item.isBookingMember,

        memberId:
          item.isBookingMember
            ? item.bookingMemberId
            : null,

        nonMember:
          !item.isBookingMember
            ? {
              name:
                item.bookingNonMember?.name || "",

              tamilName:
                item.bookingNonMember?.tamilName || "",

              gender:
                item.bookingNonMember?.gender || "",

              phone:
                item.bookingNonMember?.phone || "",

              aadhar:
                item.bookingNonMember?.aadhar || "",

              permanentAddress:
                item.bookingNonMember?.permanentAddress || "",

              presentAddress:
                item.bookingNonMember?.presentAddress || "",
            }
            : null,
      };

      // =========================
      // UPDATE BURIED PERSON
      // =========================

      booking.buriedPerson = {

        isMember:
          item.isBuriedMember,

        memberId:
          item.isBuriedMember
            ? item.buriedMemberId
            : null,

        nonMember:
          !item.isBuriedMember
            ? {
              name:
                item.buriedPersonName
            }
            : null,

        name:
          item.buriedPersonName,

        buriedDate:
          item.buriedDate,
      };

      // =========================
      // STATUS
      // =========================

      booking.status = "Buried";

      booking.slotClosed = true;

      booking.buriedAt = new Date();

      booking.updatedAt = new Date();

      await booking.save();
    }

    return res.json({
      success: true,
      message: "Burial updated successfully"
    });

  } catch (err) {

    return res.status(400).json({
      message: err.message
    });
  }
};


exports.getReservedBookings = async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // ✅ GET ALL RESERVED
    const allBookings = await CemeteryBooking.find({
      status: "Reserved"
    })

      .populate({
        path: "cemeteryId",
        select: "cemeteryName cemeteryLocation"
      })

      .populate({
        path: "bookingPerson.memberId",
        model: "Members",
        select: "member_name member_id"
      })

      .populate({
        path: "buriedPerson.memberId",
        model: "Members",
        select: "member_name member_id"
      })

      .sort({ bookedAt: -1 });

    // ✅ SEARCH FILTER
    const filtered = allBookings.filter((item) => {

      const cemeteryName =
        item.cemeteryId?.cemeteryName?.toLowerCase() || "";

      const buriedPerson =
        item.buriedPerson?.name?.toLowerCase() || "";

      const allottee =
        item.bookingPerson?.isMember
          ? (
            item.bookingPerson?.memberId?.member_name?.toLowerCase() || ""
          )
          : (
            item.bookingPerson?.nonMember?.name?.toLowerCase() || ""
          );

      const slotId =
        item.slotId?.toLowerCase() || "";

      return (
        cemeteryName.includes(search.toLowerCase()) ||
        buriedPerson.includes(search.toLowerCase()) ||
        allottee.includes(search.toLowerCase()) ||
        slotId.includes(search.toLowerCase())
      );
    });

    // ✅ TOTAL COUNT
    const totalBookings = filtered.length;

    // ✅ PAGINATION AFTER FILTER
    const paginatedData = filtered.slice(
      skip,
      skip + limit
    );

    res.status(200).json({
      bookings: paginatedData,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page,
      totalBookings
    });

  } catch (err) {

    console.error("Get Reserved Bookings Error:", err);

    res.status(500).json({
      message: "Server Error"
    });
  }
};






exports.getCemeteryReports = async (req, res) => {

  try {

    const {
      cemeteryId,
      fromdate,
      todate,
      status,
      search,
      page = 1,
      limit = 25
    } = req.query;

    // =========================
    // FILTER
    // =========================

    const filter = {};

    // =========================
    // CEMETERY FILTER
    // =========================

    if (
      cemeteryId &&
      cemeteryId !== "undefined" &&
      cemeteryId !== "null" &&
      cemeteryId.trim() !== ""
    ) {

      filter.cemeteryId = cemeteryId;
    }

    // =========================
    // STATUS FILTER
    // =========================

    if (
      status &&
      status !== "All" &&
      status !== "undefined" &&
      status !== "null" &&
      status.trim() !== ""
    ) {

      filter.status = status;
    }

    // =========================
    // RESERVED DATE FILTER
    // =========================

    const hasFromDate =
      fromdate &&
      fromdate !== "undefined" &&
      fromdate !== "null" &&
      fromdate.trim() !== "";

    const hasToDate =
      todate &&
      todate !== "undefined" &&
      todate !== "null" &&
      todate.trim() !== "";

    // ❌ NO DATE = NO DATA
    if (!hasFromDate && !hasToDate) {

      return res.status(200).json({

        success: true,

        data: [],

        total: 0,

        currentPage: 1,

        totalPages: 0,

        statuses: [
          "Reserved",
          "Buried"
        ]
      });
    }

    // =========================
    // APPLY DATE FILTER
    // =========================

    filter.reservedAt = {};

    // FROM DATE
    if (hasFromDate) {

      filter.reservedAt.$gte =
        new Date(fromdate);
    }

    // TO DATE
    if (hasToDate) {

      const endDate =
        new Date(todate);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      filter.reservedAt.$lte =
        endDate;
    }

    // =========================
    // SEARCH FLAG
    // =========================

    const hasSearch = (
      search &&
      search !== "undefined" &&
      search !== "null" &&
      search.trim() !== ""
    );

    // =========================
    // PAGINATION
    // =========================

    const currentPage =
      Number(page) || 1;

    const perPage =
      Number(limit) || 25;

    const skip =
      (currentPage - 1) * perPage;

    // =========================
    // FETCH REPORTS
    // =========================

    const reports =
      await CemeteryBooking.find(filter)

        // cemetery
        .populate({
          path: "cemeteryId",
          select: `
            cemeteryName
          `
        })

        // booking member
        .populate({
          path: "bookingPerson.memberId",
          select: `
            member_id
            member_name
            member_tamil_name
          `
        })

        // buried member
        .populate({
          path: "buriedPerson.memberId",
          select: `
            member_id
            member_name
            member_tamil_name
          `
        })

        .sort({
          reservedAt: -1
        })

        .skip(skip)

        .limit(perPage);

    // =========================
    // SEARCH FILTER AFTER POPULATE
    // =========================

    const filteredReports =
      reports.filter(item => {

        // no search
        if (!hasSearch) {
          return true;
        }

        const lowerSearch =
          search.toLowerCase();

        // cemetery name
        const cemeteryName =
          item?.cemeteryId
            ?.cemeteryName
            ?.toLowerCase() || "";

        // slot id
        const slotId =
          item?.slotId
            ?.toLowerCase() || "";

        // status
        const statusText =
          item?.status
            ?.toLowerCase() || "";

        // buried person
        const buriedPerson =
          item?.buriedPerson?.name
            ?.toLowerCase() || "";

        return (

          cemeteryName.includes(lowerSearch)

          ||

          slotId.includes(lowerSearch)

          ||

          statusText.includes(lowerSearch)

          ||

          buriedPerson.includes(lowerSearch)
        );
      });

    // =========================
    // TOTAL
    // =========================

    const total =
      filteredReports.length;

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      data: filteredReports,

      total,

      currentPage,

      totalPages:
        Math.ceil(total / perPage),

      statuses: [
        "Reserved",
        "Buried"
      ]
    });

  } catch (err) {

    console.log(
      "Cemetery Report Error:",
      err
    );

    return res.status(500).json({

      success: false,

      message:
        "Error fetching cemetery reports"
    });
  }
};