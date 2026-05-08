// routes/tamilCalendar.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ Use ENV instead of hardcode
const CLIENT_ID = process.env.PROKERALA_CLIENT_ID;
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET;

// ✅ Cache token (avoid calling every request)
let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
    // reuse token if not expired
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const tokenRes = await axios.post(
        "https://api.prokerala.com/token",
        new URLSearchParams({
            grant_type: "client_credentials",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
        {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
    );

    accessToken = tokenRes.data.access_token;

    // expire slightly before actual expiry
    tokenExpiry = Date.now() + (tokenRes.data.expires_in - 60) * 1000;

    return accessToken;
};

router.get("/", async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        // ✅ get token (cached)
        const token = await getAccessToken();

        // ✅ Panchang API
        const panchangRes = await axios.get(
            "https://api.prokerala.com/v2/astrology/panchang",
            {
                params: {
                    datetime: isSandbox
                        ? `2026-01-01T00:00:00+05:30` // always Jan 1
                        : `${date}T00:00:00+05:30`,
                    coordinates: "8.5241,76.9366",
                    ayanamsa: 1,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = panchangRes.data.data;

        res.json({
            tamilMonth: data.masa,
            tamilDate: data.tithi.name,
            paksha: data.paksha, // Valarpirai / Theipirai
            nakshatra: data.nakshatra.name,
        });

    } catch (err) {
        console.error("Tamil API Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Error fetching Panchang" });
    }
});

module.exports = router;