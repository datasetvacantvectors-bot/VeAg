import mongoose from "mongoose";

const clickAnalyticsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  productId: { type: String, required: true },
  productTitle: { type: String, default: "" },
  url: { type: String, required: true },
  clickedAt: { type: Date, default: Date.now },
});

clickAnalyticsSchema.index({ userId: 1 });
clickAnalyticsSchema.index({ productId: 1 });
clickAnalyticsSchema.index({ clickedAt: -1 });

const ClickAnalytics = mongoose.model("ClickAnalytics", clickAnalyticsSchema);
export default ClickAnalytics;