const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const bugRoutes = require("./routes/bugRoutes");
const authRoutes = require("./routes/authRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/solutions", solutionRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);

app.get("/", (req, res) => {
    res.send("DebugTogether Backend is Working!");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});