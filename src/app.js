const express = require("express");
const roleRoutes = require("./routes/role.route");
const userRoutes = require("./routes/user.route");

const app = express();
app.use(express.json());

app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("API OK"));

module.exports = app;