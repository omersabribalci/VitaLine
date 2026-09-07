import mongoose, { type Aggregate, type Query } from "mongoose";
import type { PatientDocumentShape } from "../types";

const PatientSchema = new mongoose.Schema<PatientDocumentShape>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Bir kullanıcının yalnızca 1 hasta profili olabilir
    },
    accountStatus: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Her sorguda filtrelendiği için indexlenmesi performansı artırır
    },
  },
  { timestamps: true },
);

// --- QUERY MIDDLEWARES (SOFT DELETE) ---

const filterDeleted = function (this: Query<unknown, PatientDocumentShape>) {
  this.where({ isDeleted: false });
};

PatientSchema.pre("find", filterDeleted);
PatientSchema.pre("findOne", filterDeleted);
PatientSchema.pre("findOneAndUpdate", filterDeleted);
PatientSchema.pre("findOneAndDelete", filterDeleted);
PatientSchema.pre("countDocuments", filterDeleted);

PatientSchema.pre("aggregate", function (this: Aggregate<unknown[]>) {
  // Aggregation boru hattının en başına { $match: { isDeleted: false } } ekler
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

export = mongoose.model<PatientDocumentShape>("Patient", PatientSchema);
