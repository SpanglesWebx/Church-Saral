const CoverOffering = require("../Schema/CoverOfferingSchema");
const Santha = require("../Schema/SanthaSchema");
const overallTemplate = require("../template/Bills/overallBillPdf");
const individualTemplate = require("../template/Bills/individualBillPdf");



exports.getOverallBills = async (req, res) => {
  try {

    const { from, to, search = "", page = 1, limit = 10 } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const data = await CoverOffering.aggregate([

      {
        $match: {
          date: { $gte: fromDate, $lte: toDate }
        }
      },

      { $unwind: "$entries" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },




      { $unwind: "$member" },

      {
        $addFields: {
          entryAmount: {
            $cond: [
              { $gt: ["$entries.amount", null] },
              "$entries.amount",
              {
                $sum: "$entries.months.amount"
              }
            ]
          }
        }
      },

      {
        $group: {
          _id: {
            family_id: "$member.family_id",
            member_id: "$member._id"
          },

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_code: { $first: "$member.member_id" },
          relation: { $first: "$member.relationship" },

          offerings: {
            $push: {
              type: "$offertoryType",
              amount: "$entryAmount",
              date: "$date"
            }
          },

          total: { $sum: "$entryAmount" }
        }
      },

      {
        $group: {
          _id: "$_id.family_id",

          members: {
            $push: {
              member_name: "$member_name",
              member_tamil_name: "$member_tamil_name",
              member_id: "$member_code",
              relation: "$relation",
              total: "$total",
              offerings: "$offerings"
            }
          },

          total: { $sum: "$total" }
        }
      },

      {
        $lookup: {
          from: "families",
          localField: "_id",
          foreignField: "family_id",
          as: "family"
        }
      },

      { $unwind: "$family" },

      {
        $lookup: {
          from: "members",
          localField: "family.head",
          foreignField: "_id",
          as: "head"
        }
      },

      { $unwind: "$head" },

      {
        $project: {
          family_id: "$_id",
          total: 1,
          members: 1,
          head_name: "$head.member_name",
          head_tamil: "$head.member_tamil_name",
          head_member_id: "$head.member_id"
        }
      },

      { $sort: { family_id: 1 } }

    ]);




    // 🔥 SANTHA DATA
    const santhaData = await Santha.aggregate([

      { $match: { date: { $gte: fromDate, $lte: toDate } } },

      { $unwind: "$entries" },
      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      {
        $group: {
          _id: {
            family_id: "$member.family_id",
            member_id: "$member._id"
          },

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_code: { $first: "$member.member_id" },
          relation: { $first: "$member.relationship" },

          offerings: {
            $push: {
              type: {
                $concat: ["Santha (", "$entries.months.month", ")"]
              },
              amount: "$entries.months.amount",
              date: "$date"
            }
          },

          total: { $sum: "$entries.months.amount" }
        }
      }
    ]);


    const mergedMap = {};

    // 🔹 COVER DATA
    data.forEach(fam => {

      if (!mergedMap[fam.family_id]) {
        mergedMap[fam.family_id] = {
          ...fam,
          members: [...fam.members]
        };
      }

    });

    // 🔹 SANTHA DATA MERGE
    santhaData.forEach(s => {

      const famId = s._id.family_id;

      if (!mergedMap[famId]) {
        mergedMap[famId] = {
          family_id: famId,
          members: [],
          total: 0,
          head_name: "",
          head_tamil: "",
          head_member_id: ""
        };
      }

      let member = mergedMap[famId].members.find(
        m => m.member_id === s.member_code
      );

      if (!member) {
        member = {
          member_name: s.member_name,
          member_tamil_name: s.member_tamil_name,
          member_id: s.member_code,
          relation: s.relation,
          offerings: [],
          total: 0
        };

        mergedMap[famId].members.push(member);
      }

      member.offerings.push(...s.offerings);
      member.total += s.total;

      mergedMap[famId].total += s.total;

    });

    const allData = Object.values(mergedMap);


    let filteredData = allData;

    if (search) {

      const s = search.toLowerCase();

      filteredData = allData.filter(fam => {

        return (
          fam.family_id?.toLowerCase().includes(s) ||

          (fam.head_name || "").toLowerCase().includes(s) ||

          (fam.head_member_id || "").toLowerCase().includes(s) ||

          (fam.members || []).some(m =>
            (m.member_name || "").toLowerCase().includes(s) ||
            (m.member_id || "").toLowerCase().includes(s)
          )
        );

      });

    }

    const total = filteredData.length;

    const startIndex = (page - 1) * limit;


    const paginated = filteredData
      .slice(startIndex, startIndex + Number(limit))
      .map((f, i) => ({
        sno: startIndex + i + 1,
        ...f
      }));

    res.json({
      data: paginated,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};






exports.getIndividualBills = async (req, res) => {
  try {

    const { from, to, page = 1, limit = 25, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const pipeline = [
      {
        $match: {
          date: { $gte: fromDate, $lte: toDate }
        }
      },

      { $unwind: "$entries" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },



      {
        $addFields: {
          entryAmount: {
            $cond: [
              { $gt: ["$entries.amount", null] },
              "$entries.amount",
              { $sum: "$entries.months.amount" }
            ]
          }
        }
      },

      {
        $group: {
          _id: "$member.family_id",
          total: { $sum: "$entryAmount" }
        }
      },

      {
        $lookup: {
          from: "families",
          localField: "_id",
          foreignField: "family_id",
          as: "family"
        }
      },

      { $unwind: "$family" },

      {
        $lookup: {
          from: "members",
          localField: "family.head",
          foreignField: "_id",
          as: "head"
        }
      },

      { $unwind: "$head" },




      {
        $project: {
          family_id: "$_id",
          total: 1,
          head_name: "$head.member_name",
          head_tamil: "$head.member_tamil_name",
          head_member_id: "$head.member_id"
        }
      },

      { $sort: { family_id: 1 } }

    ];


    const santhaTotals = await Santha.aggregate([

      { $match: { date: { $gte: fromDate, $lte: toDate } } },

      { $unwind: "$entries" },
      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      {
        $group: {
          _id: "$member.family_id",
          total: { $sum: "$entries.months.amount" }
        }
      }
    ]);

    // 🔹 Get TOTAL count
    const rawData = await CoverOffering.aggregate(pipeline);

    rawData.forEach(fam => {
      const s = santhaTotals.find(x => x._id === fam.family_id);
      if (s) {
        fam.total += s.total;
      }
    });


    let filteredData = rawData;

    if (search) {

      const s = search.toLowerCase();

      filteredData = rawData.filter(fam => {

        return (
          (fam.family_id || "").toLowerCase().includes(s) ||
          (fam.head_name || "").toLowerCase().includes(s) ||
          (fam.head_member_id || "").toLowerCase().includes(s)
        );

      });

    }
    const total = filteredData.length;

    const startIndex = (page - 1) * limit;

    const paginated = filteredData.slice(
      startIndex,
      startIndex + Number(limit)
    );


    const result = paginated.map((f, i) => ({
      sno: startIndex + i + 1,
      ...f
    }));

    res.json({
      data: result,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getFamilyBillDetails = async (req, res) => {

  try {

    const { familyId, from, to } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const data = await CoverOffering.aggregate([

      {
        $match: {
          date: { $gte: fromDate, $lte: toDate }
        }
      },

      { $unwind: "$entries" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },

      {
        $match: {
          "member.family_id": familyId
        }
      },

      {
        $addFields: {
          entryAmount: {
            $cond: [
              { $gt: ["$entries.amount", null] },
              "$entries.amount",
              { $sum: "$entries.months.amount" }
            ]
          }
        }
      },

      {
        $group: {
          _id: "$member._id",

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_id: { $first: "$member.member_id" },
          is_head: { $first: "$member.is_head" },
          relationship: { $first: "$member.relationship" },

          offerings: {
            $push: {
              category: "$offertoryType",
              amount: "$entryAmount",
              date: "$date"
            }
          }
        }
      }

    ]);



    const santha = await Santha.aggregate([

      { $match: { date: { $gte: fromDate, $lte: toDate } } },

      { $unwind: "$entries" },
      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      { $match: { "member.family_id": familyId } },

      {
        $group: {
          _id: "$member._id",

          offerings: {
            $push: {
              category: {
                $concat: ["Santha (", "$entries.months.month", ")"]
              },
              amount: "$entries.months.amount",
              date: "$date"
            }
          }
        }
      }
    ]);


    data.forEach(member => {

      const s = santha.find(
        x => x._id.toString() === member._id.toString()
      );

      if (s) {
        member.offerings = [
          ...member.offerings,
          ...s.offerings
        ];
      }

    });

    res.json({ data });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};




exports.downloadBillsPdf = async (req, res) => {
  try {

    const { tab, from, to, search = "" } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const data = await CoverOffering.aggregate([

      {
        $match: {
          date: { $gte: fromDate, $lte: toDate }
        }
      },

      { $unwind: "$entries" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },



      {
        $addFields: {
          entryAmount: {
            $cond: [
              { $gt: ["$entries.amount", null] },
              "$entries.amount",
              { $sum: "$entries.months.amount" }
            ]
          }
        }
      },

      {
        $group: {
          _id: {
            family_id: "$member.family_id",
            member_id: "$member._id"
          },

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_id: { $first: "$member.member_id" },
          relation: { $first: "$member.relationship" },

          offerings: {
            $push: {
              type: "$offertoryType",
              amount: "$entryAmount",
              date: "$date"
            }
          },

          total: { $sum: "$entryAmount" }
        }
      },

      {
        $group: {
          _id: "$_id.family_id",

          members: {
            $push: {
              member_name: "$member_name",
              member_tamil_name: "$member_tamil_name",
              member_id: "$member_id",
              relation: "$relation",
              total: "$total",
              offerings: "$offerings"
            }
          },

          total: { $sum: "$total" }
        }
      },

      {
        $lookup: {
          from: "families",
          localField: "_id",
          foreignField: "family_id",
          as: "family"
        }
      },

      { $unwind: "$family" },

      {
        $lookup: {
          from: "members",
          localField: "family.head",
          foreignField: "_id",
          as: "head"
        }
      },

      { $unwind: "$head" },





      {
        $project: {
          family_id: "$_id",
          total: 1,
          members: 1,
          head_name: "$head.member_name",
          head_tamil: "$head.member_tamil_name",
          head_member_id: "$head.member_id"
        }
      },

      { $sort: { family_id: 1 } }

    ]);



    const santhaData = await Santha.aggregate([

      { $match: { date: { $gte: fromDate, $lte: toDate } } },

      { $unwind: "$entries" },
      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      {
        $group: {
          _id: {
            family_id: "$member.family_id",
            member_id: "$member._id"
          },

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_id: { $first: "$member.member_id" },
          relation: { $first: "$member.relationship" },

          offerings: {
            $push: {
              type: {
                $concat: ["Santha (", "$entries.months.month", ")"]
              },
              amount: "$entries.months.amount",
              date: "$date"
            }
          },

          total: { $sum: "$entries.months.amount" }
        }
      }
    ]);



    const mergedMap = {};

    // COVER
    data.forEach(fam => {
      mergedMap[fam.family_id] = {
        ...fam,
        members: [...fam.members]
      };
    });

    // SANTHA
    santhaData.forEach(s => {

      const famId = s._id.family_id;

      if (!mergedMap[famId]) {
        mergedMap[famId] = {
          family_id: famId,
          members: [],
          total: 0,
          head_name: "",
          head_tamil: "",
          head_member_id: ""
        };
      }

      let member = mergedMap[famId].members.find(
        m => m.member_id === s.member_id
      );

      if (!member) {
        member = {
          member_name: s.member_name,
          member_tamil_name: s.member_tamil_name,
          member_id: s.member_id,
          relation: s.relation,
          offerings: [],
          total: 0
        };
        mergedMap[famId].members.push(member);
      }

      member.offerings.push(...s.offerings);
      member.total += s.total;

      mergedMap[famId].total += s.total;

    });




    const finalData = Object.values(mergedMap);


    let filteredData = finalData;



    if (search) {

      const s = search.toLowerCase();

      filteredData = finalData.filter(fam => {

        // 🔹 OVERALL TAB
        if (tab === "overall") {
          return (
            fam.family_id?.toLowerCase().includes(s) ||
            (fam.members || []).some(m =>
              m.member_name?.toLowerCase().includes(s) ||
              m.member_id?.toLowerCase().includes(s)
            )
          );
        }

        // 🔹 INDIVIDUAL TAB
        if (tab === "individual") {
          return (
            fam.family_id?.toLowerCase().includes(s) ||
            fam.head_name?.toLowerCase().includes(s) ||
            fam.head_member_id?.toLowerCase().includes(s)
          );
        }

        return true;

      });

    }




    const result = filteredData.map((f, i) => {

      const sortedMembers = (f.members || []).sort((a, b) => {
        if (a.member_id === f.head_member_id) return -1;
        if (b.member_id === f.head_member_id) return 1;
        return 0;
      });

      return {
        sno: i + 1,
        family_id: f.family_id,
        total: f.total,
        members: sortedMembers,
        head_name: f.head_name,
        head_tamil: f.head_tamil,
        head_member_id: f.head_member_id
      };

    });

    if (tab === "overall") {
      return overallTemplate(res, result, from, to);
    }

    if (tab === "individual") {
      return individualTemplate(res, result, from, to);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation error" });
  }
};




exports.downloadFamilyBillPdf = async (req, res) => {

  try {

    const { familyId, from, to } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const data = await CoverOffering.aggregate([
      { $match: { date: { $gte: fromDate, $lte: toDate } } },
      { $unwind: "$entries" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },

      {
        $match: { "member.family_id": familyId }
      },

      {
        $addFields: {
          entryAmount: {
            $cond: [
              { $gt: ["$entries.amount", null] },
              "$entries.amount",
              { $sum: "$entries.months.amount" }
            ]
          }
        }
      },

      {
        $group: {
          _id: "$member._id",

          member_name: { $first: "$member.member_name" },
          member_tamil_name: { $first: "$member.member_tamil_name" },
          member_id: { $first: "$member.member_id" },
          is_head: { $first: "$member.is_head" },
          relationship: { $first: "$member.relationship" },

          offerings: {
            $push: {
              category: "$offertoryType",
              amount: "$entryAmount",
              date: "$date"
            }
          }
        }
      }

    ]);



    const santha = await Santha.aggregate([

      { $match: { date: { $gte: fromDate, $lte: toDate } } },

      { $unwind: "$entries" },
      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      { $match: { "member.family_id": familyId } },

      {
        $group: {
          _id: "$member._id",

          offerings: {
            $push: {
              category: {
                $concat: ["Santha (", "$entries.months.month", ")"]
              },
              amount: "$entries.months.amount",
              date: "$date"
            }
          }
        }
      }
    ]);



    data.forEach(member => {

      const s = santha.find(
        x => x._id.toString() === member._id.toString()
      );

      if (s) {
        member.offerings = [
          ...member.offerings,
          ...s.offerings
        ];
      }

    });


    data.forEach(member => {
      member.offerings.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    });

    const template = require("../template/Bills/familyBillPdf");

    template(res, data, familyId, from, to);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "PDF error" });

  }

};