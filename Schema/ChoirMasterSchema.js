


const mongoose = require("mongoose");

const ChoirMasterSchema = new mongoose.Schema(
  {
    isMember: { type: Boolean, required: true },

    // 🔥 Reference to Members collection
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      index: true,
      sparse: true   // ✅ important for non-members
    },

    // Non-Member fields
    nonMemberName: { type: String },
    nonMemberPhone: { type: String },
    nonMemberAadhar: { type: String },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    inactiveDate: { type: Date },
    inactiveReason: { type: String }
  },
  { timestamps: true }
);

// 🔥 Unique only for members
ChoirMasterSchema.index(
  { member: 1 },
  { unique: true, partialFilterExpression: { isMember: true } }
);


ChoirMasterSchema.index({ status: 1 });
ChoirMasterSchema.index({ member: 1 });
ChoirMasterSchema.index({ nonMemberName: 1 });

module.exports = mongoose.model("ChoirMaster", ChoirMasterSchema);
