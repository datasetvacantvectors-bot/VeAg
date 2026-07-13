import mongoose from "mongoose";

const caseResultSchema = new mongoose.Schema(
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
    cropName: {
      type: String,
      required: true,
    },
    diseaseStatus: {
      type: String,
      required: true,
    },
    modelResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const CaseResult = mongoose.model("CaseResult", caseResultSchema);

export default CaseResult;