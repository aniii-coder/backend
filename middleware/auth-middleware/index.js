import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    // Extract the token directly from the cookies object
    const token = req.cookies?.token; // Replace 'token' with your actual cookie name

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // Verify token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Bind to the request object so the controller can read it
    req.user = { id: decoded.id }; 
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};