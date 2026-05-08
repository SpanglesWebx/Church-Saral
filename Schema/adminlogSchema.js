const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    unique: true,
  },
  member_name: {   // ✅ Add this field
    type: String,
    required: true,
  },
  email: {              // ✅ changed from email
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: false,
  },
  roles: {
    type: [String],  // multiple roles allowed
    enum: [
      "admin",
      "churchadmin",
      "member",
      "pastorprimary",
      "pastorsecondary",
      "dcmember",
      "churchofficeworker",
      "churchofficestaff",
      "treasurer",
      "accountant",
      "secretary",
      "sundaysclscretary",
      "sundaysclaccountant",
      "sundaysclteacher",
      "endeavoursclscretary",
      "endeavourclaccountant",
      "endeavourteacher",
      "youthsecretary",
      "youthaccountant",
      "mensecretary",
      "menaccountant",
      "womensecretary",
      "womenaccountant",
      "couplesecretary",
      "coupleaccountant",
      "choiraccountant",
      "choirsecretary",
      "cemeterymanager",
    ],
    default: ['member'],

  },
  isPreCreated: { type: Boolean, default: false }
}, { timestamps: true });




const User = mongoose.model('User', userSchema);

module.exports = User;





