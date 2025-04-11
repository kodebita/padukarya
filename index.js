const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const session = require('express-session');
const flash = require('express-flash');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Set views directory

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/padukarya", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("Connected to MongoDB"));
db.on("error", (error) => console.error("MongoDB connection error:", error));

// Model
const User = require("./models/user");

// Routes
app.get("/", (req, res) => {
  res.render('index', {
    title: 'Dashboard'
  });
});

app.use("/prk", require("./routes/prk.routes"));
app.use("/skki", require("./routes/skki.routes"));
app.use("/pengadaan", require("./routes/pengadaan"));
app.use("/kontrak", require("./routes/kontrak"));

app.use("/material", require("./routes/material"));

// Create User
app.get("/users", async (req, res) => {
  try {
    const user = new User({
      name: "Maul",
      email: "maulanaichwana@gmail.com"
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User
app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete User
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));