import mongoose from "mongoose";

const treatmentInfoSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["treatment", "causes", "prevention"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Only one entry per case per type
treatmentInfoSchema.index({ caseId: 1, type: 1 }, { unique: true });

const TreatmentInfo = mongoose.model("TreatmentInfo", treatmentInfoSchema);

export default TreatmentInfo;