

const mongoose = require("mongoose");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const Pastor = require("../Schema/pastorSchema");

const BibleSentence = require("../Schema/BibleSentence");


const SundayClass = require("../Schema/SundayClass");
const { SundaySchoolEvent } = require("../Schema/sundaysclEventSchema");
const SundayExam = require("../Schema/sundayExamSchema");
const { WomenEvent } = require("../Schema/womenEventSchema");
const { MenEvent } = require("../Schema/MenEventSchema");

const WomenActivity = require("../Schema/WomenActivitySchema");
const MenActivity = require("../Schema/MenActivitySchema");


const EndeavourClass = require("../Schema/EndeavourClass");
const { EndeavourEvent, EndeavourEventBy } = require("../Schema/endeavourEventSchema");
const EndeavourExam = require("../Schema/endeavourExamSchema");
const Notification = require("../Schema/NotificationSchema");

const CoverOffering = require("../Schema/CoverOfferingSchema");
// const Santha = require("../Schema/SanthaSchema");




exports.getMemberName = async (req, res) => {
  try {
    const { member_id } = req.params;

    if (!member_id) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const member =
      (await Member.findOne({ member_id })
        .select("member_name member_title dob marriage_date")) ||

      (await Pastor.findOne({ member_id })
        .select("member_name dob marriage_date"));

    // (await PastorFamilyMember.findOne({ member_id })
    //   .select("member_name dob marriage_date"));

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({
      name: member.member_name,
      title: member.member_title || "",
      dob: member.dob || "",
      marriage_date: member.marriage_date || ""
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFamilyIfHead = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne({ member_id: memberId }).lean();

    if (!member) {
      return res.status(404).json({
        isHead: false,
        message: "Member not found"
      });
    }

    const family = await Family.findOne({ head: member._id })
      .populate("members", "member_id member_name relationship photo")
      .populate("head", "member_id member_name")
      .lean();

    if (!family) {
      return res.status(200).json({
        isHead: false,
        message: "Member is not a family head"
      });
    }

    const members = family.members
      .filter(m => m._id.toString() !== family.head._id.toString())
      .map(m => ({
        member_id: m.member_id,
        member_name: m.member_name,
        relation_with_head: m.relationship,
        photo: m.photo || ""
      }));

    res.json({
      isHead: true,
      family: {
        family_id: family.family_id,
        photo: family.family_photo || "",
        head: {
          member_id: family.head.member_id,
          member_name: family.head.member_name
        },
        members
      }
    });

  } catch (error) {
    console.error("Family fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFamilyByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    /* 1️⃣ FIND MEMBER DOCUMENT */
    const member = await Member.findOne({ member_id: memberId }).lean();

    if (!member) {
      return res.status(404).json({
        isHead: false,
        family_id: null,
        message: "Member not found"
      });
    }

    const memberObjectId = member._id;

    /* 2️⃣ CHECK IF MEMBER IS FAMILY HEAD */

    const familyAsHead = await Family.findOne({ head: memberObjectId });

    if (familyAsHead) {
      return res.status(200).json({
        isHead: true,
        family_id: familyAsHead.family_id
      });
    }

    /* 3️⃣ CHECK IF MEMBER BELONGS TO FAMILY */

    const familyAsMember = await Family.findOne({
      members: memberObjectId
    });

    if (familyAsMember) {
      return res.status(200).json({
        isHead: false,
        family_id: familyAsMember.family_id
      });
    }

    /* 4️⃣ NO FAMILY FOUND */

    res.status(200).json({
      isHead: false,
      family_id: null
    });

  } catch (error) {
    console.error("Error fetching family info:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne(
      { member_id: memberId },
      { member_name: 1, photo: 1, _id: 0 }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getDailyVerse = async (req, res) => {
  try {
    const { memberId } = req.params;

    const today = new Date();
    const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

    const verses = await BibleSentence.find({ status: true }).sort({ _id: 1 });



    if (!verses.length) {
      return res.status(200).json({});
    }

    // Unique verse per member per day
    const memberHash = memberId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = (dayNumber + memberHash) % verses.length;

    const verse = verses[index];


    res.status(200).json(verse);
  } catch (error) {
    console.error("Daily verse error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getMemberProfileFull = async (req, res) => {
  try {
    const { memberId } = req.params;

    // 1️⃣ Get member
    const member = await Member.findOne({ member_id: memberId }).lean();

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // 2️⃣ Get family + populate head 🔥 IMPORTANT
    const family = await Family.findOne({ family_id: member.family_id })
      .populate("head", "member_name member_id") // ✅ FIX
      .lean();

    let head_name = "";
    let head_member_id = "";
    let relation_with_head = member.relationship || "";

    // 3️⃣ If member is HEAD
    if (member.is_head === true) {
      head_name = member.member_name;
      head_member_id = member.member_id;
    }

    // 4️⃣ If NOT head → get from family
    else if (family && family.head) {
      head_name = family.head.member_name;
      head_member_id = family.head.member_id;
    }

    // 5️⃣ Response
    res.status(200).json({
      message: "Member fetched successfully",
      data: {
        ...member,
        head_name,
        head_member_id,
        relation_with_head,
        family_members: family?.members || []
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching member",
      error: error.message
    });
  }
};


exports.getUpcomingDashboardItems = async (req, res) => {
  try {

    const { memberId } = req.params;

    const member = await Member.findOne({ member_id: memberId }).lean();

    if (!member)
      return res.status(404).json({ success: false, message: "Member not found" });

    const memberObjectId = member._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    /* ===============================
       FIND CLASSES
    =============================== */

    const [sundayClass, endeavourClass] = await Promise.all([
      SundayClass.findOne({
        $or: [{ teacher: memberObjectId }, { students: memberObjectId }]
      }).lean(),

      EndeavourClass.findOne({
        $or: [{ teacher: memberObjectId }, { students: memberObjectId }]
      }).lean()
    ]);

    /* ===============================
       FETCH EVENTS + EXAMS
    =============================== */

    const [
      ssEventsRaw,
      ssExamsRaw,
      endeavourEventsRaw,
      endeavourExamsRaw,
      womenEventsRaw,
      menEventsRaw,
      womenActivitiesRaw,
      menActivitiesRaw
    ] = await Promise.all([

      SundaySchoolEvent.find({ eventDate: { $gte: startOfToday } })
        .populate("eventBy", "name").sort({ eventDate: 1 }).lean(),

      SundayExam.find({ examDate: { $gte: startOfToday } })
        .populate("examBy", "name").sort({ examDate: 1 }).lean(),

      EndeavourEvent.find({ eventDate: { $gte: startOfToday } })
        .populate("eventBy", "name").sort({ eventDate: 1 }).lean(),

      EndeavourExam.find({ examDate: { $gte: startOfToday } })
        .populate("examBy", "name").sort({ examDate: 1 }).lean(),

      member.gender === "Female" && member.status === "Active"
        ? WomenEvent.find({ eventDate: { $gte: startOfToday } })
          .populate("eventBy", "name").sort({ eventDate: 1 }).lean()
        : [],


      // ✅ Men Events (only if Male)
      member.gender === "Male" && member.status === "Active"
        ? MenEvent.find({ eventDate: { $gte: startOfToday } })
          .populate("eventBy", "name").sort({ eventDate: 1 }).lean()
        : [],


      member.gender === "Female"
        ? WomenActivity.find({ date: { $gte: startOfToday } })
          .populate("leader.member", "member_name")
          .populate("houses.member", "member_name")
          .lean()
        : [],

      member.gender === "Male"
        ? MenActivity.find({ date: { $gte: startOfToday } })
          .populate("leader.member", "member_name")
          .populate("houses.member", "member_name")
          .lean()
        : []
    ]);

    /* ===============================
       FILTER FUNCTIONS
    =============================== */

    const filterEvents = (events, classObj, memberObjectId) => {

      const normalize = (str) =>
        str?.toLowerCase().replace(/\s+/g, "").trim();

      const classNameOnly = classObj?.class_name;
      const classFull = `${classObj?.class_name} - ${classObj?.section_name}`;

      return events.filter(event => {

        // ✅ Class match (works for both formats)
        const classMatch = event.classEvents?.some(cls =>
          normalize(cls.className) === normalize(classNameOnly) ||
          normalize(cls.className) === normalize(classFull)
        );

        // ✅ Student participant
        const studentMatch = event.classEvents?.some(cls =>
          cls.competitions?.some(comp =>
            comp.participants?.some(
              p => String(p.member) === String(memberObjectId)
            )
          )
        );

        // ✅ Teacher participant
        const teacherMatch = event.teacherCompEvents?.some(comp =>
          comp.participants?.some(
            p => String(p.member) === String(memberObjectId)
          )
        );

        return classMatch || studentMatch || teacherMatch;
      });
    };

    const filterExams = (exams, classFull, isTeacher) =>
      exams.filter(exam => {

        /* CLASS MATCH */

        const classMatch = exam.classExams?.some(
          cls => cls.className === classFull
        );

        /* STUDENT PARTICIPANT */

        const studentMatch = exam.classExams?.some(cls =>
          cls.participants?.some(
            p => p.member?.toString() === memberObjectId.toString()
          )
        );

        /* TEACHER EXAM */

        const teacherMatch = exam.teacherDetails?.some(
          t => t.teacher?.toString() === memberObjectId.toString()
        );

        /* CLASS TEACHER */

        if (isTeacher && classMatch) return true;

        return classMatch || studentMatch || teacherMatch;

      });
    /* ===============================
       APPLY FILTERS
    =============================== */

    const ssEvents = sundayClass
      ? filterEvents(ssEventsRaw, sundayClass, memberObjectId)
      : [];

    const ssExams = sundayClass
      ? filterExams(
        ssExamsRaw,
        `${sundayClass.class_name} - ${sundayClass.section_name}`,
        sundayClass.teacher?.toString() === memberObjectId.toString()
      )
      : [];

    const endeavourEvents = endeavourClass
      ? filterEvents(
        endeavourEventsRaw,
        endeavourClass,
        memberObjectId
      )
      : [];

    const endeavourExams = endeavourClass
      ? filterExams(
        endeavourExamsRaw,
        `${endeavourClass.class_name} - ${endeavourClass.section_name}`,
        endeavourClass.teacher?.toString() === memberObjectId.toString()
      )
      : [];




    const filterActivities = (activities, memberObjectId) => {
      return activities.filter(activity => {

        // ✅ Leader
        const isLeader =
          activity.leader?.member &&
          String(activity.leader.member._id || activity.leader.member) === String(memberObjectId);

        // ✅ House Visit Member
        const isHouseMember = activity.houses?.some(h => {
          const id = h.member?._id || h.member;
          return String(id) === String(memberObjectId);
        });

        // ✅ Attendee (🔥 MISSING BEFORE)
        const isAttendee = activity.attendees?.some(a => {
          const id = a.member?._id || a.member;
          return String(id) === String(memberObjectId);
        });

        return isLeader || isHouseMember || isAttendee;
      });
    };


    const womenActivities = filterActivities(womenActivitiesRaw, memberObjectId);
    const menActivities = filterActivities(menActivitiesRaw, memberObjectId);
    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      success: true,
      sundaySchoolEvents: ssEvents,
      sundaySchoolExams: ssExams,
      endeavourEvents,
      endeavourExams,
      womenEvents: womenEventsRaw,
      menEvents: menEventsRaw,
      womenActivities,
      menActivities
    });

  } catch (error) {

    console.error("Dashboard upcoming error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};






exports.getNotifications = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = await Notification
      .find({ status: "Active" })
      .select("heading items")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const filtered = notifications
      .map(n => {

        const validItems = (n.items || []).filter(item => {

          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);

          return itemDate >= today;

        });

        if (!validItems.length) return null;

        return {
          _id: n._id,
          heading: n.heading,
          items: validItems
        };

      })
      .filter(Boolean);

    res.json({
      success: true,
      notifications: filtered
    });

  } catch (error) {

    console.error("Notification fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};








exports.getMemberYearlyOfferings = async (req, res) => {
  try {
    const { memberId } = req.params;

    /* 1️⃣ GET MEMBER */
    const member = await Member.findOne({ member_id: memberId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const memberObjectId = member._id;

    /* 2️⃣ CURRENT YEAR */
    const year = new Date().getFullYear();

    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    /* 3️⃣ MONTH MAP */
    const monthsMap = {
      Jan: [], Feb: [], Mar: [], Apr: [],
      May: [], Jun: [], Jul: [], Aug: [],
      Sep: [], Oct: [], Nov: [], Dec: []
    };

    const getMonthShort = (date) => {
      return new Date(date).toLocaleString("en-US", { month: "short" });
    };

    /* =========================================
       4️⃣ COVER OFFERING
    ========================================= */

    const coverData = await CoverOffering.find({
      date: { $gte: start, $lte: end },
      "entries.member": memberObjectId
    }).lean();

    coverData.forEach(doc => {
      const dateStr = doc.date.toISOString().split("T")[0];

      doc.entries.forEach(entry => {
        if (entry.member.toString() !== memberObjectId.toString()) return;

        /* ✅ MONTHLY */
        if (entry.months && entry.months.length > 0) {
          entry.months.forEach(m => {

            const [monthShort, yearShort] = m.month.split(" ");
            const fullYear = "20" + yearShort;

            const monthIndex = new Date(`${monthShort} 1, ${fullYear}`).getMonth() + 1;

            const correctDate = `${fullYear}-${String(monthIndex).padStart(2, "0")}-01`;

            monthsMap[monthShort].push({
              date: correctDate,   // ✅ FIXED
              category: doc.offertoryType,
              amount: m.amount
            });
          });
        }

        /* ✅ NON-MONTHLY */
        else if (entry.amount) {
          const monthShort = getMonthShort(doc.date);

          monthsMap[monthShort].push({
            date: dateStr,
            category: doc.offertoryType,
            amount: entry.amount
          });
        }
      });
    });

    /* =========================================
       5️⃣ SANTHA
    ========================================= */

    // const santhaData = await Santha.find({
    //   date: { $gte: start, $lte: end },
    //   "entries.member": memberObjectId
    // }).lean();

    // santhaData.forEach(doc => {
    //   const dateStr = doc.date.toISOString().split("T")[0];

    //   doc.entries.forEach(entry => {
    //     if (entry.member.toString() !== memberObjectId.toString()) return;

    //     entry.months.forEach(m => {
    //       const monthShort = m.month.split(" ")[0];

    //       monthsMap[monthShort].push({
    //         date: dateStr,
    //         category: `Santha (${monthShort})`,
    //         amount: m.amount
    //       });
    //     });
    //   });
    // });

    /* =========================================
       6️⃣ SORT + S.NO
    ========================================= */

    Object.keys(monthsMap).forEach(month => {
      monthsMap[month]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((item, index) => {
          item.s_no = index + 1;
        });
    });

    /* =========================================
       7️⃣ RESPONSE
    ========================================= */

    res.json({
      year,
      months: monthsMap
    });

  } catch (error) {
    console.error("Dashboard Offering Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

