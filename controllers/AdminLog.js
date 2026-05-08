const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Schema/adminlogSchema');
const Member = require('../Schema/memberSchema'); // to check member_id + email
const Pastor = require("../Schema/pastorSchema")
const nodemailer = require("nodemailer");

const otpStore = {};



exports.signupRequest = async (req, res) => {
  try {

    const { member_id, mode } = req.body;   // ⭐ ADD mode

    // 1. Find member in Member OR Pastor collection
    let member = await Member.findOne({ member_id });

    if (!member) {
      member = await Pastor.findOne({ member_id });
    }

    if (!member)
      return res.status(404).json({
        message: "Member/Pastor not found"
      });

    // 2. Check if user already exists
    const existingUser = await User.findOne({ member_id });


    // 🚨 BLOCK ONLY FOR NORMAL SIGNUP
    if (mode !== "forgot") {
      if (existingUser && existingUser.password) {
        return res.status(400).json({
          message: "User already exists, please login."
        });
      }
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = Date.now() + 3 * 60 * 1000;

    otpStore[member_id] = { otp, expiresAt };

    console.log("DEV OTP:", otp);

    // 4. Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const isForgot = mode === "forgot";


    const email = member.primary_email?.trim();


    if (!email) {
      return res.status(400).json({
        message: "Primary email is required for this member"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid primary email format"
      });
    }

    await transporter.sendMail({
      from: `"CSI Church" <${process.env.EMAIL_USER}>`,
      // to: member.primary_email,

        to: email,

      // ✅ SUBJECT BASED ON MODE
      subject: isForgot
        ? "CSI Church Vyrakudy - Password Reset OTP"
        : "Welcome to CSI Church Vyrakudy - Signup OTP",

      // ✅ TEXT VERSION
      text: isForgot
        ? `Dear ${member.member_name},

We received a request to reset your password.

🔐 OTP: ${otp}

⏳ This OTP will expire in 3 minutes.

If you did NOT request this, please ignore this email.

CSI Church Vyrakudy Team`
        : `Dear ${member.member_name},

Welcome to CSI Church - Vyrakudy 🙏

Use the OTP below to complete your signup:

🔐 OTP: ${otp}

⏳ Valid for 3 minutes.

If you did not request this, please ignore this email.

CSI Church Vyrakudy Team`,

      // ✅ OPTIONAL HTML (PROFESSIONAL LOOK)
      html: isForgot
        ? `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#5c95e0;">Password Reset Request 🔐</h2>
        <p>Dear <b>${member.member_name}</b>,</p>
        <p>Use the OTP below to reset your password:</p>
        <h1 style="letter-spacing:2px;">${otp}</h1>
        <p>This OTP expires in <b>3 minutes</b>.</p>
        <p style="color:red;">If you didn't request this, ignore this email.</p>
        <p>CSI Church Vyrakudy</p>
      </div>
    `
        : `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#5c95e0;">Welcome to CSI Church 🙏</h2>
        <p>Dear <b>${member.member_name}</b>,</p>
        <p>Use the OTP below to complete signup:</p>
        <h1 style="letter-spacing:2px;">${otp}</h1>
        <p>This OTP is valid for <b>3 minutes</b>.</p>
        <p>If you didn't request this, ignore this email.</p>
        <p>CSI Church Vyrakudy</p>
      </div>
    `
    });

    // const email = member.primary_email;

    const [name, domain] = email.split("@");

    const maskedEmail = name.substring(0, 3) + "******@" + domain;

    return res.json({
      email: maskedEmail,
      member_name: member.member_name
    });

  } catch (err) {

    console.error("❌ Signup request error:", err);

    return res.status(500).json({
      message: "Server error"
    });

  }
};

// -------------------- VERIFY OTP & CREATE USER --------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { member_id, otp } = req.body;

    const stored = otpStore[member_id];
    if (!stored) return res.status(400).json({ message: "No OTP found, please request again." });

    if (Date.now() > stored.expiresAt) {
      delete otpStore[member_id];
      return res.status(400).json({ message: "OTP expired, please request again." });
    }

    if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified, allow frontend to enable password
    delete otpStore[member_id];
    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.completeSignup = async (req, res) => {
  try {
    const { member_id, password } = req.body;

    // 1️⃣ Check if member or pastor exists
    let member = await Member.findOne({ member_id });
    if (!member) member = await Pastor.findOne({ member_id });
    if (!member) {
      return res.status(404).json({ message: "Member/Pastor not found" });
    }

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ member_id });

    if (user) {
      if (user.isPreCreated || !user.password) {
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.isPreCreated = false;
        await user.save();

        return res
          .status(200)
          .json({ message: "Signup completed successfully. You can login now." });
      } else {
        return res
          .status(400)
          .json({ message: "User already exists, please login." });
      }
    }

    // 3️⃣ Create new user account
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      member_id,
      member_name: member.member_name,
      email: member.primary_email,
      password: hashedPassword,
      roles: ["member"],
      isPreCreated: false,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "Signup completed successfully. You can login now." });
  } catch (err) {
    console.error("❌ Complete signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🟢 Login attempt:", username, password);

    // const user = await User.findOne({
    //   member_id: { $regex: `^${username}$`, $options: "i" },
    // });


    const user = await User.findOne({
      member_id: username.trim(),
    });

    if (!user) {
      console.log("🔴 No user found with member_id:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("🟢 User found:", user.member_id);
    console.log("🧂 Stored password (hashed):", user.password);

    if (!user.password) {
      console.log("⚠️ User has no password set");
      return res.status(401).json({ message: "User has not set a password yet." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🧩 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Incorrect password for:", user.member_id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, member_id: user.member_id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful for:", user.member_id);
    return res.json({ message: "Login successful", token, roles: user.roles });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//with pagination and the search
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};

    // 🔍 Search by member_name OR roles
    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { roles: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    query.roles = { $ne: ["member"] };

    // Fetch users with pagination (excluding password)
    const users = await User.find(query, "-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach member_name from Member collection if missing
    const usersWithNames = await Promise.all(
      users.map(async (u) => {
        if (!u.member_name) {
          const member = await Member.findOne(
            { member_id: u.member_id },
            "member_name"
          );
          return {
            ...u,
            member_name: member ? member.member_name : null,
          };
        }
        return u;
      })
    );

    // Total count for pagination
    const totalUsers = await User.countDocuments(query);

    res.json({
      users: usersWithNames,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPDATE USER ROLE --------------------
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, roles } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { roles },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Roles updated successfully", user });
  } catch (err) {
    console.error("❌ Update user role error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.createUserByAdmin = async (req, res) => {
  try {
    const { member_id, roles } = req.body;

    if (!member_id) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    // Find person in Member or Pastor
    let person = await Member.findOne({ member_id });
    if (!person) {
      person = await Pastor.findOne({ member_id });
    }

    if (!person) {
      return res.status(404).json({ message: "Member/Pastor not found" });
    }


    // ✅ ONLY primary email
    const email = person.primary_email;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Primary email is required. Please update member primary email.",
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ member_id });

    // Always include "member"
    const assignedRoles = Array.from(
      new Set(["member", ...(roles || [])])
    );

    // ✅ If user exists → update roles
    if (existingUser) {
      const mergedRoles = Array.from(
        new Set([...existingUser.roles, ...assignedRoles])
      );

      existingUser.roles = mergedRoles;
      await existingUser.save();

      return res.status(200).json({
        message: "Roles updated successfully",
        user: existingUser,
      });
    }

    // ✅ If user does NOT exist → create new
    const newUser = new User({
      member_id: person.member_id,
      email: email,
      member_name: person.member_name,
      roles: assignedRoles,
      isPreCreated: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully by admin",
      user: newUser,
    });

  } catch (err) {
    console.error("❌ createUserByAdmin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCemeteryManagers = async (req, res) => {
  try {
    const managers = await User.find(
      { roles: "cemeterymanager" },
      "-password"
    ).lean();

    res.json(managers);
  } catch (err) {
    console.error("❌ Error fetching cemetery managers:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.resetPassword = async (req, res) => {
  try {
    const { member_id, password } = req.body;

    const user = await User.findOne({ member_id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      message: "Password updated successfully"
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


















