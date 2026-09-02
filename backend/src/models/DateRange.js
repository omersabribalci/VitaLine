const mongoose = require("mongoose");

const DateRangeSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.start <= value;
        },
        message: "End date must be equal to or after start date.",
      },
    },
  },
  { _id: false },
);

module.exports = DateRangeSchema;
