import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planName: {
      type: String,
      default: "Premium Plan",
    },
    monthsPurchased: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    purchaseType: {
      type: String,
      enum: ["new", "extension"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for finding active subscriptions
subscriptionSchema.index({ userId: 1, isActive: 1 });

// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function () {
  return new Date() > this.endDate;
};

// Method to get days remaining
subscriptionSchema.methods.getDaysRemaining = function () {
  const now = new Date();
  if (now > this.endDate) return 0;
  const diff = this.endDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default mongoose.model("Subscription", subscriptionSchema);