const mongoose = require("mongoose");

const MarriageHallBooking = new mongoose.Schema(
  {
    hall: { type: mongoose.Schema.Types.ObjectId, ref: "MarriageHall", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "MarriageHallCategory", required: true },
    date: { type: Date, required: true },
    sessions: { type: [String], enum: ["morning", "evening"], required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    advanceHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    fineAmount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    booking_status: { type: String, enum: ["Completed", "Reserved", "Cancelled"], default: "Reserved" },

    issued_assets: {

      //  Hall Assets
      hall: [
        {
          category_id: mongoose.Schema.Types.ObjectId,
          category_name: String,

          items: [
            {
              item_name: String,
              issued_qty: Number,

              returned: { type: Number, default: 0 },
              damaged: { type: Number, default: 0 },
              missing: { type: Number, default: 0 }
            }
          ]
        }
      ],

      //  Kitchen Assets
      kitchen: [
        {
          asset_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MarriageHallKitchenAssets"
          },
          item_name: String,
          issued_qty: Number,

          returned: { type: Number, default: 0 },
          damaged: { type: Number, default: 0 },
          missing: { type: Number, default: 0 }
        }
      ]
    }




  },
  { timestamps: true }
);

module.exports = mongoose.model("MarriageHallBooking", MarriageHallBooking);
