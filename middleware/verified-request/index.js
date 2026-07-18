import jwt from "jsonwebtoken";

export const verifyClient = (req, res, next) => {
  console.log("Cookies:", req.cookies);

  try {
    const token = req.cookies.token;

    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
