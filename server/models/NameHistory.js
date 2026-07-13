import mongoose from "mongoose";

const nameHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  oldName: {
    type: String,
    required: true,
  },
  newName: {
    type: String,
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries by userId
nameHistorySchema.index({ userId: 1, changedAt: -1 });

const NameHistory = mongoose.model("NameHistory", nameHistorySchema);

export default NameHistory;