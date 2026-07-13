import Subscription from "../models/Subscription.js";

const subscriptionMiddleware = async (req, res, next) => {
  try {
    // authMiddleware should run before this, so req.user must exist
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. User session missing or invalid." });
    }

    // Find any active subscription for this user
    const subscription = await Subscription.findOne({
      userId: req.user.userId,
      isActive: true,
    });

    if (!subscription) {
      return res.status(403).json({
        error:
          "Forbidden. You do not have an active subscription to access this premium feature.",
        requiresSubscription: true,
      });
    }

    // Double-check if the subscription has expired (past endDate)
    if (subscription.isExpired()) {
      // Mark it as inactive in the database automatically
      subscription.isActive = false;
      await subscription.save();

      return res.status(403).json({
        error: "Forbidden. Your subscription has expired.",
        requiresSubscription: true,
      });
    }

    // Store subscription on the request object for downstream controllers if needed
    req.subscription = subscription;

    next();
  } catch (error) {
    // console.error("Subscription validation error in middleware:", error);
    res
      .status(500)
      .json({
        error: "Internal server error while verifying subscription status.",
      });
  }
};

export default subscriptionMiddleware;