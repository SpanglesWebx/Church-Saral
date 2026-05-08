const Auction = require("../Schema/Auction.js");
const Member = require("../Schema/memberSchema");

exports.createAuction = async (req, res) => {

    try {

        const {
            date,
            day,
            seller,
            buyer,
            item,
            amount,
            description
        } = req.body;

        let sellerData = {};
        let buyerData = {};

        /* ======================
           SELLER
        ====================== */

        if (seller.isMember) {

            const member = await Member.findOne({
                member_id: seller.member_id
            });

            if (!member) {
                return res.status(404).json({ message: "Seller member not found" });
            }

            sellerData = {
                isMember: true,
                member: member._id
            };

        } else {

            sellerData = {
                isMember: false,
                name: seller.member_name,
                phone: seller.phone_number
            };

        }

        /* ======================
           BUYER
        ====================== */

        if (buyer.isMember) {

            const member = await Member.findOne({
                member_id: buyer.member_id
            });

            if (!member) {
                return res.status(404).json({ message: "Buyer member not found" });
            }

            buyerData = {
                isMember: true,
                member: member._id
            };

        } else {

            buyerData = {
                isMember: false,
                name: buyer.member_name,
                phone: buyer.phone_number
            };

        }

        /* ======================
           CREATE AUCTION
        ====================== */

        const auction = new Auction({
            date,
            day,
            seller: sellerData,
            buyer: buyerData,
            item,
            amount,
            description
        });

        await auction.save();

        res.status(201).json({
            message: "Auction created successfully",
            auction
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};




exports.getAuctions = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || "";
        const type = req.query.type || "all";

        const skip = (page - 1) * limit;

        let match = {};

        /* ======================
           TYPE FILTER
        ====================== */

        if (type === "member") {
            match.$or = [
                { "seller.isMember": true },
                { "buyer.isMember": true }
            ];
        }

        if (type === "non-member") {
            match.$and = [
                { "seller.isMember": false },
                { "buyer.isMember": false }
            ];
        }

        const pipeline = [

            { $match: match },

            /* ======================
               SELLER LOOKUP
            ====================== */

            {
                $lookup: {
                    from: "members",
                    localField: "seller.member",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                member_id: 1,
                                member_name: 1,
                                primary_contact: 1
                            }
                        }
                    ],
                    as: "sellerMember"
                }
            },

            /* ======================
               BUYER LOOKUP
            ====================== */

            {
                $lookup: {
                    from: "members",
                    localField: "buyer.member",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                member_id: 1,
                                member_name: 1,
                                primary_contact: 1
                            }
                        }
                    ],
                    as: "buyerMember"
                }
            },

            {
                $unwind: {
                    path: "$sellerMember",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $unwind: {
                    path: "$buyerMember",
                    preserveNullAndEmptyArrays: true
                }
            },

            /* ======================
               SEARCH
            ====================== */

            ...(search ? [{
                $match: {
                    $or: [

                        { item: { $regex: search, $options: "i" } },

                        { "seller.name": { $regex: search, $options: "i" } },
                        { "buyer.name": { $regex: search, $options: "i" } },

                        { "sellerMember.member_name": { $regex: search, $options: "i" } },
                        { "buyerMember.member_name": { $regex: search, $options: "i" } },

                        { "sellerMember.member_id": { $regex: search, $options: "i" } },
                        { "buyerMember.member_id": { $regex: search, $options: "i" } }

                    ]
                }
            }] : []),

            /* ======================
               SORT
            ====================== */

            { $sort: { date: -1 } },

            /* ======================
               FACET (DATA + COUNT)
            ====================== */

            {
                $facet: {

                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],

                    totalCount: [
                        { $count: "count" }
                    ]

                }
            }

        ];

        const result = await Auction.aggregate(pipeline);

        const auctions = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;

        res.json({
            data: auctions,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }
};