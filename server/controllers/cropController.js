import Crop from "../models/Crop.js";

// Get all active crops
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ isActive: true }).sort({ name: 1 });
    res.json({ crops });
  } catch (error) {
    // console.error('Error fetching crops:', error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
};

// Seed initial crops (for development)
export const seedCrops = async (req, res) => {
  try {
    const defaultCrops = [
      { name: "rice", displayName: "Rice" },
      { name: "wheat", displayName: "Wheat" },
      { name: "maize", displayName: "Maize" },
    ];

    // Check if crops already exist
    const existingCrops = await Crop.countDocuments();
    if (existingCrops > 0) {
      return res.json({
        message: "Crops already seeded",
        count: existingCrops,
      });
    }

    // Insert default crops
    await Crop.insertMany(defaultCrops);

    res.json({
      message: "Crops seeded successfully",
      crops: defaultCrops,
    });
  } catch (error) {
    // console.error('Error seeding crops:', error);
    res.status(500).json({ error: "Failed to seed crops" });
  }
};