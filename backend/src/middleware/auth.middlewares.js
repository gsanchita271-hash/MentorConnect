import jwt from "jsonwebtoken";
import { Auth } from "../model/auth.models.js";

const verifyToken = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header is required",
      });
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // 3. Get token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access token is missing",
      });
    }

    // 4. Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        message: "JWT_SECRET is missing in server environment",
      });
    }

    // 5. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 6. Check decoded token
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // 7. Find current user
    const user = await Auth.findById(decoded.id).select(
      "_id name email role isApproved"
    );

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // 8. Check approval
    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is not approved",
      });
    }

    // 9. Store user in request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: String(user.role || "").trim(),
      isApproved: user.isApproved,
    };

    // 10. Continue
    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // Expired JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please login again",
      });
    }

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};

export default verifyToken;