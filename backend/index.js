const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
app.use(cors());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to verify Firebase token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Protected route
app.get("/secure-data", verifyToken, (req, res) => {
  res.json({
    message: "Protected data access granted",
    email: req.user.email,
    secretList: ["Secret #1", "Secret #2", "Secret #3"],
  });
});

app.listen(4000, () =>
  console.log("✅ Backend running at http://localhost:4000")
);
