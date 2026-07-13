import mongoose from "mongoose";

const askChatSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    reply: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "analyzing", "answered", "failed"],
      default: "sending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for paginated fetching per case
askChatSchema.index({ caseId: 1, createdAt: -1 });

export default mongoose.model("AskChat", askChatSchema);