import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

export default cors({
  origin: allowedOrigins,
  credentials: true,
});