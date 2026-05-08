
const mongoose = require("mongoose");
const Family = require("../Schema/familySchema");
const Members = require("../Schema/memberSchema");
const BagOffering = require("../Schema/BagOfferingSchema");
const CoverOffering = require("../Schema/CoverOfferingSchema");
const Santha = require("../Schema/SanthaSchema");
const puppeteer = require("puppeteer");
const birthdayTemplate = require("../template/Reports/Members/Birthday");
const marriageTemplate = require("../template/Reports/Members/Marriage");
const template = require("../template/Reports/OffertorySanthaReport/OffertorySanthaReport");

const fs = require("fs");
const path = require("path");
const { print } = require("pdf-to-printer");



exports.getBirthdayReport = async (req, res) => {
    try {

        const { fromdate, todate, search, page = 1, limit = 25 } = req.query;

        const from = new Date(fromdate);
        const to = new Date(todate);

        const fromMonth = from.getMonth() + 1;
        const fromDay = from.getDate();

        const toMonth = to.getMonth() + 1;
        const toDay = to.getDate();

        const members = await Members.find({
            status: "Active",
            dob: { $ne: null }
        });

        const filtered = members.filter((m) => {

            // 🔎 SEARCH FILTER
            if (search) {
                const searchLower = search.toLowerCase();

                const match =
                    m.member_name?.toLowerCase().includes(searchLower) ||
                    m.member_tamil_name?.toLowerCase().includes(searchLower) ||
                    m.member_id?.toLowerCase().includes(searchLower);

                if (!match) return false;
            }

            const dob = new Date(m.dob);

            const month = dob.getMonth() + 1;
            const day = dob.getDate();

            const value = month * 100 + day;
            const start = fromMonth * 100 + fromDay;
            const end = toMonth * 100 + toDay;

            if (start <= end) {
                return value >= start && value <= end;
            } else {
                return value >= start || value <= end;
            }

        });




        const sorted = filtered.sort((a, b) => {

            const da = new Date(a.dob);
            const db = new Date(b.dob);

            const dateA = (da.getMonth() + 1) * 100 + da.getDate();
            const dateB = (db.getMonth() + 1) * 100 + db.getDate();

            // 1️⃣ Sort by birthday date
            if (dateA !== dateB) {
                return dateA - dateB;
            }

            // 2️⃣ Same day → sort by member name
            return (a.member_name || "").localeCompare(b.member_name || "");

        });


        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = parseInt(limit) || 25;

        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;

        const paginatedData = sorted.slice(startIndex, endIndex);

        res.json({
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limitNumber),
            currentPage: pageNumber,
            Birthday: paginatedData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.getBirthdayPdf = async (req, res) => {
    try {

        const { fromdate, todate, search } = req.query;

        const from = new Date(fromdate);
        const to = new Date(todate);

        const fromMonth = from.getMonth() + 1;
        const fromDay = from.getDate();

        const toMonth = to.getMonth() + 1;
        const toDay = to.getDate();

        const members = await Members.find({
            status: "Active",
            dob: { $ne: null }
        });

        const filtered = members.filter((m) => {



            if (search) {
                const searchLower = search.toLowerCase();

                const match =
                    m.member_name?.toLowerCase().includes(searchLower) ||
                    m.member_tamil_name?.toLowerCase().includes(searchLower) ||
                    m.member_id?.toLowerCase().includes(searchLower);

                if (!match) return false;
            }

            const dob = new Date(m.dob);

            const month = dob.getMonth() + 1;
            const day = dob.getDate();

            const value = month * 100 + day;
            const start = fromMonth * 100 + fromDay;
            const end = toMonth * 100 + toDay;

            if (start <= end) {
                return value >= start && value <= end;
            } else {
                return value >= start || value <= end;
            }

        });

        // 🔹 SORT DATE → NAME
        const sorted = filtered.sort((a, b) => {

            const da = new Date(a.dob);
            const db = new Date(b.dob);

            const dateA = (da.getMonth() + 1) * 100 + da.getDate();
            const dateB = (db.getMonth() + 1) * 100 + db.getDate();

            if (dateA !== dateB) return dateA - dateB;

            return (a.member_name || "").localeCompare(b.member_name || "");

        });

        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const formattedFrom = formatDate(fromdate);
        const formattedTo = formatDate(todate);

        const html = birthdayTemplate(sorted, formattedFrom, formattedTo);
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        });

        await browser.close();

        const mode = req.query.mode || "pdf";

        const tempDir = path.join(__dirname, "../temp");

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFile = path.join(tempDir, "birthday-report.pdf");

        fs.writeFileSync(tempFile, pdf);

        // if (mode === "print") {

        //     await print(tempFile, {
        //         printer: process.env.PRINTER_NAME
        //     });

        //     return res.json({ message: "Printed successfully" });
        // }

        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
            "Content-Disposition": "attachment; filename=BirthdayReport.pdf"
        });

        res.end(pdf);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "PDF generation failed" });
    }
};





exports.getMarriageReport = async (req, res) => {
    try {

        let { fromdate, todate, search, page = 1, limit = 25 } = req.query;

        // 🔹 Default current week (Sunday → Saturday)
        if (!fromdate || !todate) {
            const today = new Date();
            const day = today.getDay();

            const sunday = new Date(today);
            sunday.setDate(today.getDate() - day);

            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);

            fromdate = sunday;
            todate = saturday;
        }

        const from = new Date(fromdate);
        const to = new Date(todate);

        const families = await Family.find()
            .populate("members");

        let couples = [];

        families.forEach((family) => {

            const husband = family.members.find(
                (m) =>
                    m.gender === "Male" &&
                    m.marital_status === "Married" &&
                    m.status === "Active"
            );

            const wife = family.members.find(
                (m) =>
                    m.gender === "Female" &&
                    m.marital_status === "Married" &&
                    m.status === "Active"
            );

            if (!husband || !wife) return;

            if (!husband.marriage_date) return;

            const mdate = new Date(husband.marriage_date);

            const month = mdate.getMonth() + 1;
            const day = mdate.getDate();

            const value = month * 100 + day;
            const start = (from.getMonth() + 1) * 100 + from.getDate();
            const end = (to.getMonth() + 1) * 100 + to.getDate();

            let inRange;

            if (start <= end) {
                inRange = value >= start && value <= end;
            } else {
                inRange = value >= start || value <= end;
            }

            if (!inRange) return;

            if (search) {
                const s = search.toLowerCase();

                const match =
                    husband.member_name.toLowerCase().includes(s) ||
                    wife.member_name.toLowerCase().includes(s) ||
                    husband.member_id.toLowerCase().includes(s);

                if (!match) return;
            }

            couples.push({
                husband_name: husband.member_name,
                husband_tamil_name: husband.member_tamil_name,
                wife_name: wife.member_name,
                wife_tamil_name: wife.member_tamil_name,
                marriage_date: husband.marriage_date
            });

        });

        // 🔹 Sort by marriage date
        couples.sort((a, b) => {

            const da = new Date(a.marriage_date);
            const db = new Date(b.marriage_date);

            const dateA = (da.getMonth() + 1) * 100 + da.getDate();
            const dateB = (db.getMonth() + 1) * 100 + db.getDate();

            if (dateA !== dateB) return dateA - dateB;

            return a.husband_name.localeCompare(b.husband_name);
        });

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = parseInt(limit) || 25;

        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;

        const paginatedData = couples.slice(startIndex, endIndex);

        res.json({
            total: couples.length,
            totalPages: Math.ceil(couples.length / limitNumber),
            currentPage: pageNumber,
            Marriage: paginatedData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};




exports.getMarriagePdf = async (req, res) => {

    try {

        const { fromdate, todate, search } = req.query;

        const from = new Date(fromdate);
        const to = new Date(todate);

        const families = await Family.find()
            .populate("members");

        let couples = [];

        families.forEach((family) => {

            const husband = family.members.find(
                (m) => m.gender === "Male" && m.status === "Active"
            );

            const wife = family.members.find(
                (m) => m.gender === "Female" && m.status === "Active"
            );

            if (!husband || !wife) return;

            if (!husband.marriage_date) return;

            const mdate = new Date(husband.marriage_date);

            const month = mdate.getMonth() + 1;
            const day = mdate.getDate();

            const value = month * 100 + day;
            const start = (from.getMonth() + 1) * 100 + from.getDate();
            const end = (to.getMonth() + 1) * 100 + to.getDate();

            let inRange;

            if (start <= end) {
                inRange = value >= start && value <= end;
            } else {
                inRange = value >= start || value <= end;
            }

            if (!inRange) return;


            // 🔹 SEARCH FILTER
            if (search) {

                const s = search.toLowerCase();

                const match =
                    husband.member_name?.toLowerCase().includes(s) ||
                    wife.member_name?.toLowerCase().includes(s) ||
                    husband.member_id?.toLowerCase().includes(s);

                if (!match) return;
            }


            const calculateYears = (date) => {
                const today = new Date();
                const marriage = new Date(date);

                let years = today.getFullYear() - marriage.getFullYear();

                const m = today.getMonth() - marriage.getMonth();

                if (m < 0 || (m === 0 && today.getDate() < marriage.getDate())) {
                    years--;
                }

                return years;
            };

            couples.push({
                husband_name: husband.member_name,
                husband_tamil_name: husband.member_tamil_name,
                wife_name: wife.member_name,
                wife_tamil_name: wife.member_tamil_name,
                marriage_date: husband.marriage_date,
                years: calculateYears(husband.marriage_date)
            });

        });

        couples.sort((a, b) => {

            const da = new Date(a.marriage_date);
            const db = new Date(b.marriage_date);

            const dateA = (da.getMonth() + 1) * 100 + da.getDate();
            const dateB = (db.getMonth() + 1) * 100 + db.getDate();

            return dateA - dateB;
        });

        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const formattedFrom = formatDate(fromdate);
        const formattedTo = formatDate(todate);

        const html = marriageTemplate(couples, formattedFrom, formattedTo);

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox"]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        });

        await browser.close();

        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
            "Content-Disposition": "attachment; filename=MarriageReport.pdf"
        });

        res.end(pdf);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "PDF generation failed" });
    }
};









exports.getOffertoryReport = async (req, res) => {
    try {
        let { fromdate, todate, page = 1, limit = 50, search } = req.query;

        const from = new Date(fromdate);
        const to = new Date(todate);

        const skip = (page - 1) * limit;




        /* =====================================================
           1️⃣ BAG OFFERING
        ===================================================== */
        const bagPipeline = [
            {
                $match: {
                    date: { $gte: from, $lte: to }
                }
            },
            {
                $project: {
                    date: 1,
                    transId: 1,
                    type: { $literal: "Bag" },
                    subCategory: 1,
                    amount: 1,

                    member_id: { $literal: null },
                    member_name: { $literal: null },
                    month: { $literal: null },
                    offertoryType: { $literal: null }
                }
            }
        ];

        /* =====================================================
           2️⃣ COVER OFFERING
        ===================================================== */
        const coverPipeline = [
            {
                $match: {
                    date: { $gte: from, $lte: to }
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
                $project: {
                    date: 1,
                    transId: 1,
                    type: { $literal: "Cover" },
                    offertoryType: 1,

                    member_id: "$member.member_id",   // ✅ FIX
                    member_name: "$member.member_name",

                    amount: "$entries.amount",
                    months: "$entries.months",
                    subCategory: { $literal: null }
                }
            },

            {
                $facet: {
                    /* 🔹 NON-MONTH */
                    nonMonth: [
                        { $match: { amount: { $ne: null } } },
                        {
                            $project: {
                                date: 1,
                                transId: 1,
                                type: 1,
                                offertoryType: 1,
                                member_id: 1,
                                member_name: 1,
                                amount: 1,
                                month: { $literal: null },
                                subCategory: { $literal: null }
                            }
                        }
                    ],

                    /* 🔹 MONTH */
                    monthly: [
                        { $unwind: "$months" },
                        {
                            $project: {
                                date: 1,
                                type: 1,
                                transId: 1,
                                offertoryType: 1,
                                member_id: 1,
                                member_name: 1,
                                month: "$months.month",
                                amount: "$months.amount",
                                subCategory: { $literal: null }
                            }
                        }
                    ]
                }
            },

            {
                $project: {
                    data: { $concatArrays: ["$nonMonth", "$monthly"] }
                }
            },
            { $unwind: "$data" },
            { $replaceRoot: { newRoot: "$data" } }
        ];

        /* =====================================================
           3️⃣ SANTHA
        ===================================================== */
        const santhaPipeline = [
            {
                $match: {
                    date: { $gte: from, $lte: to }
                }
            },
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
                $project: {
                    date: 1,
                    transId: 1,
                    type: { $literal: "Santha" },

                    member_id: "$member.member_id",   // ✅ FIX
                    member_name: "$member.member_name",

                    month: "$entries.months.month",
                    amount: "$entries.months.amount",
                    subCategory: { $literal: null },
                    offertoryType: { $literal: null }
                }
            }
        ];

        /* =====================================================
           🔥 MERGE ALL
        ===================================================== */
        const [bag, cover, santha] = await Promise.all([
            BagOffering.aggregate(bagPipeline),
            CoverOffering.aggregate(coverPipeline),
            Santha.aggregate(santhaPipeline)
        ]);

        let merged = [...bag, ...cover, ...santha];

        const types = [...new Set(merged.map(item => item.type))];

        const { type } = req.query;

        if (type && type !== "All") {
            merged = merged.filter(item => item.type === type);
        }

        /* =====================================================
           🔎 SEARCH
        ===================================================== */
        if (search) {
            const s = search.toLowerCase();

            merged = merged.filter((item) =>
                item.member_name?.toLowerCase().includes(s) ||
                item.member_id?.toLowerCase().includes(s) ||   // ✅ FIX
                item.subCategory?.toLowerCase().includes(s) ||
                item.offertoryType?.toLowerCase().includes(s)
            );
        }

        /* =====================================================
           📅 SORT BY DATE
        ===================================================== */
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));

        /* =====================================================
           📄 PAGINATION
        ===================================================== */
        const total = merged.length;

        const paginated = merged.slice(skip, skip + Number(limit));

        res.json({
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            types,
            data: paginated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};




const getOffertoryData = async (query) => {
    let { fromdate, todate, search, type } = query;

    const from = new Date(fromdate);
    const to = new Date(todate);

    /* ================= BAG ================= */
    const bagPipeline = [
        {
            $match: { date: { $gte: from, $lte: to } }
        },
        {
            $project: {
                date: 1,
                transId: 1,
                type: { $literal: "Bag" },
                subCategory: 1,
                amount: 1,
                member_id: null,
                member_name: null,
                month: null,
                offertoryType: null
            }
        }
    ];

    /* ================= COVER ================= */
    const coverPipeline = [
        { $match: { date: { $gte: from, $lte: to } } },
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
            $project: {
                date: 1,
                transId: 1,
                type: { $literal: "Cover" },
                offertoryType: 1,
                member_id: "$member.member_id",
                member_name: "$member.member_name",
                amount: "$entries.amount",
                months: "$entries.months",
                subCategory: null
            }
        },
        {
            $facet: {
                nonMonth: [
                    { $match: { amount: { $ne: null } } },
                    {
                        $project: {
                            date: 1,
                            transId: 1,
                            type: 1,
                            offertoryType: 1,
                            member_id: 1,
                            member_name: 1,
                            amount: 1,
                            month: null,
                            subCategory: null
                        }
                    }
                ],
                monthly: [
                    { $unwind: "$months" },
                    {
                        $project: {
                            date: 1,
                            transId: 1,
                            type: 1,
                            offertoryType: 1,
                            member_id: 1,
                            member_name: 1,
                            month: "$months.month",
                            amount: "$months.amount",
                            subCategory: null
                        }
                    }
                ]
            }
        },
        {
            $project: {
                data: { $concatArrays: ["$nonMonth", "$monthly"] }
            }
        },
        { $unwind: "$data" },
        { $replaceRoot: { newRoot: "$data" } }
    ];

    /* ================= SANTHA ================= */
    const santhaPipeline = [
        { $match: { date: { $gte: from, $lte: to } } },
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
            $project: {
                date: 1,
                transId: 1,
                type: { $literal: "Santha" },
                member_id: "$member.member_id",
                member_name: "$member.member_name",
                month: "$entries.months.month",
                amount: "$entries.months.amount",
                subCategory: null,
                offertoryType: null
            }
        }
    ];

    const [bag, cover, santha] = await Promise.all([
        BagOffering.aggregate(bagPipeline),
        CoverOffering.aggregate(coverPipeline),
        Santha.aggregate(santhaPipeline)
    ]);

    let merged = [...bag, ...cover, ...santha];

    /* TYPE FILTER */
    if (type && type !== "All") {
        merged = merged.filter(item => item.type === type);
    }

    /* SEARCH */
    if (search) {
        const s = search.toLowerCase();
        merged = merged.filter(item =>
            item.member_name?.toLowerCase().includes(s) ||
            item.member_id?.toLowerCase().includes(s)
        );
    }

    /* SORT */
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));

    return merged;
};



exports.getOffertoryReportPdf = async (req, res) => {
    try {
        const data = await getOffertoryData(req.query);



        const html = template(
            data,
            req.query.fromdate,
            req.query.todate
        );

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        await new Promise(resolve => setTimeout(resolve, 500)); // ✅ FIX

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,

            displayHeaderFooter: true,   // 🔥 REQUIRED

            headerTemplate: `<div></div>`,

            footerTemplate: `
    <div style="width:100%; text-align:center; font-size:6px; margin:0 auto;">
      Page <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>
  `,

            margin: {
                top: "20mm",
                bottom: "15mm"
            }
        });

        await browser.close();

        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length,
            "Content-Disposition": "attachment; filename=OffertoryReport.pdf"
        });

        res.end(pdf);

    } catch (err) {
        console.error("PDF ERROR:", err);
        res.status(500).json({ message: "PDF failed" });
    }
};