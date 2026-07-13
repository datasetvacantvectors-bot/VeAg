import admin, { initFirebaseAdmin } from "./firebaseAdmin.js";

export const appCheckVerification = async (req, res, next) => {
  // Ensure Firebase Admin is initialized
  initFirebaseAdmin();

  // Skip App Check in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // Exempt health checks and public webhooks if any
  if (req.path === "/api/health") {
    return next();
  }

  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    return res.status(403).json({
      error:
        "Forbidden. Missing Firebase App Check token. Request may not have originated from the official app.",
    });
  }

  try {
    if (!admin.apps.length) {
      // If admin failed to initialize due to missing env variables, fail safe (reject)
      return res
        .status(500)
        .json({ error: "Server configuration error. App Check disabled." });
    }

    const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);

    // Optionally, you could attach the claims to the request object if needed
    req.appCheckClaims = appCheckClaims;

    return next();
  } catch (err) {
    // console.error("App Check token verification failed:", err);
    return res.status(403).json({
      error: "Forbidden. Invalid App Check token.",
    });
  }
};