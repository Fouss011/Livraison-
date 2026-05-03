const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const parcelRoutes = require("./routes/parcelRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Delivery API opérationnelle.", status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend actif.", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Delivery backend running on port ${PORT}`);
});