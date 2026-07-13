import Product from "../models/Product.js";
import SearchAnalytics from "../models/SearchAnalytics.js";
import ClickAnalytics from "../models/ClickAnalytics.js";

// @desc    Search products with pagination, sorting, and weighted relevance scoring
// @route   GET /api/products/search
export const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12, sort = "relevance" } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const hasQuery = q && q.trim();
    const searchTerm = hasQuery ? q.trim() : "";

    // Base match filter: only active products
    const matchStage = { isActive: true };
    if (hasQuery) {
      matchStage.$text = { $search: searchTerm };
    }

    // Build sort stage
    let sortStage;
    switch (sort) {
      case "price_asc":
        sortStage = hasQuery
          ? { price: 1, relevanceScore: -1, _id: 1 }
          : { price: 1, createdAt: -1, _id: 1 };
        break;
      case "price_desc":
        sortStage = hasQuery
          ? { price: -1, relevanceScore: -1, _id: 1 }
          : { price: -1, createdAt: -1, _id: 1 };
        break;
      case "newest":
        sortStage = hasQuery
          ? { createdAt: -1, relevanceScore: -1, _id: -1 }
          : { createdAt: -1, _id: -1 };
        break;
      case "oldest":
        sortStage = hasQuery
          ? { createdAt: 1, relevanceScore: -1, _id: 1 }
          : { createdAt: 1, _id: 1 };
        break;
      case "relevance":
      default:
        // relevanceScore is added below when hasQuery; fallback to newest
        sortStage = hasQuery
          ? { relevanceScore: -1, createdAt: -1, _id: -1 }
          : { createdAt: -1, _id: -1 };
        break;
    }

    // Build aggregation pipeline
    const pipeline = [{ $match: matchStage }];

    if (hasQuery) {
      // Compute weighted relevance score
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $addFields: {
          textScore: { $meta: "textScore" },
          relevanceScore: {
            $add: [
              { $meta: "textScore" },
              // +10 if search query appears anywhere in title (case-insensitive)
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$title",
                      regex: escapedTerm,
                      options: "i",
                    },
                  },
                  10,
                  0,
                ],
              },
              // +5 more if title starts with the query (case-insensitive)
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$title",
                      regex: `^${escapedTerm}`,
                      options: "i",
                    },
                  },
                  5,
                  0,
                ],
              },
            ],
          },
        },
      });
    }

    pipeline.push({ $sort: sortStage });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Count pipeline (reuses the same match stage)
    const [products, countResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(matchStage),
    ]);

    const totalProducts = countResult;
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      hasMore: pageNum < totalPages,
    });
  } catch (error) {
    // console.error("Search products error:", error);
    res
      .status(500)
      .json({ message: "Failed to search products.", error: error.message });
  }
};

// @desc    Track a user search query
// @route   POST /api/products/track-search
export const trackSearch = async (req, res) => {
  try {
    const { userId, email, searchQuery, resultsCount } = req.body;

    if (!userId || !email || !searchQuery) {
      return res
        .status(400)
        .json({ message: "userId, email, and searchQuery are required." });
    }

    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. Access denied." });
    }

    const analytics = await SearchAnalytics.create({
      userId,
      email,
      searchQuery,
      resultsCount: resultsCount || 0,
    });

    res
      .status(201)
      .json({ message: "Search tracked successfully.", data: analytics });
  } catch (error) {
    // console.error("Track search error:", error);
    res
      .status(500)
      .json({ message: "Failed to track search.", error: error.message });
  }
};

// @desc    Track a product link click
// @route   POST /api/products/track-click
export const trackClick = async (req, res) => {
  try {
    const { userId, email, productId, productTitle, url } = req.body;

    if (!userId || !email || !productId || !url) {
      return res
        .status(400)
        .json({ message: "userId, email, productId, and url are required." });
    }

    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. Access denied." });
    }

    const analytics = await ClickAnalytics.create({
      userId,
      email,
      productId,
      productTitle: productTitle || "",
      url,
    });

    res
      .status(201)
      .json({ message: "Click tracked successfully.", data: analytics });
  } catch (error) {
    // console.error("Track click error:", error);
    res
      .status(500)
      .json({ message: "Failed to track click.", error: error.message });
  }
};