import mongoose from "mongoose";

const editHistorySchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  editHistory: [editHistorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;