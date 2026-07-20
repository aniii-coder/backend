import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

export default cors({
  origin(origin, callback) {
    console.log("Incoming Origin:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      console.log("Origin Allowed");
      return callback(null, true);
    }

    console.log("Origin Blocked:", origin);
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
});