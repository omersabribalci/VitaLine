const mongoose = require("mongoose");

const DateRangeSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false },
);

module.exports = DateRangeSchema;
