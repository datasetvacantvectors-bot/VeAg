import mongoose from 'mongoose';

const searchAnalyticsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  searchQuery: { type: String, required: true, trim: true },
  resultsCount: { type: Number, default: 0 },
  searchedAt: { type: Date, default: Date.now }
});

searchAnalyticsSchema.index({ userId: 1 });
searchAnalyticsSchema.index({ searchedAt: -1 });

const SearchAnalytics = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
export default SearchAnalytics;
