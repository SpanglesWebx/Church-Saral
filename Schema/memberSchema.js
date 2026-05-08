const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  // Membership Details
  member_id: {
    type: String,
    required: true,
    unique: true, // VERY IMPORTANT
  },
  member_type: {
    type: String,
    required: true,
  },



  is_head: {
    type: Boolean,
    default: false
  },

  family_id: {
    type: String,
    required: true,
  },

  // Relation (only if NOT head)
  relationship: {
    type: String,
    default: "",
  },

  // Personal Details
  member_name: { type: String, required: true },
  member_title: { type: String, default: "" },
  member_tamil_name: { type: String, default: "" },
  member_tamil_title: { type: String, default: "" },
  father_name: { type: String, default: "" },
  mother_name: { type: String, default: "" },

  gender: { type: String, required: true },
  dob: { type: Date, default: null },
  age: { type: Number, default: 0 },
  place_of_birth: { type: String, default: "" },
  aadhar_number: { type: String, default: "" },
  blood_group: { type: String, default: "" },
  joining_date: { type: String, default: "" },
  email: { type: String, default: "" },
  primary_email: { type: String, default: "" },
  qualification: { type: String, default: "" },
  occupation: { type: String, default: "" },
  community: { type: String, default: "" },
  nationality: { type: String, default: "" },
  contact_numbers: { type: [String], default: [] },
  primary_contact: { type: String, default: "" },
  photo: { type: String, default: "" },



  // Address
  present_address: { type: String, default: "" },
  permanent_address: { type: String, default: "" },
  present_pincode: { type: String, default: "" },
  permanent_pincode: { type: String, default: "" },
  zone: { type: String, default: "" },
  area: { type: String, default: "" },
  membership_from: { type: String, default: "" },
  official_address: { type: String, default: "" },
  official_pincode: { type: String, default: "" },


  // Spiritual Info
  baptism: { type: String, default: "" },
  baptism_date: { type: String, default: "" },
  baptism_by: { type: String, default: "" },
  baptism_church: { type: String, default: "" },

  confirmation: { type: String, default: "" },
  confirmation_date: { type: String, default: "" },
  confirmation_by: { type: String, default: "" },
  confirmation_church: { type: String, default: "" },

  // Marital Info
  marital_status: { type: String, default: "" },
  marriage_date: { type: String, default: "" },
  marriage_place: { type: String, default: "" },

  child_label: {
    type: String, // "A", "B", "C", ...
    default: ""
  },



  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

  membership_status: {
    type: String,
    enum: ["Unhold", "Hold"],
    default: "Unhold"
  },

  hold_reason: { type: String, default: "" },
  inactive_reason: { type: String, default: "" },
  inactive_description: { type: String, default: "" },

  old_member_id: { type: String, default: "" },
  old_member_id_changed_at: { type: Date },
  old_member_type: { type: String, default: "" },
  old_member_type_changed_at: { type: Date },

  old_family_id: { type: String, default: "" },
  family_changed_at: { type: Date },



}, { timestamps: true });


// 🔥 PERFORMANCE INDEXES
memberSchema.index({ status: 1, dob: 1 });          // for eligible query
memberSchema.index({ member_id: 1 });               // already unique but safe
memberSchema.index({ member_name: 1 });
memberSchema.index({ father_name: 1 });
memberSchema.index({ mother_name: 1 });
memberSchema.index({ family_id: 1 });
memberSchema.index({ status: 1 });

// If you use search frequently:
memberSchema.index({
  member_name: "text",
  member_id: "text",
  father_name: "text",
  mother_name: "text"
});


module.exports = mongoose.model("Members", memberSchema);
