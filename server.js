const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 

// MongoDB connection string for local MongoDB server
const dbURI = "mongodb://0.0.0.0:27017/studentregistration";

// Connect to MongoDB locally
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Create a user schema
const userSchema = new mongoose.Schema({
  user_name: String,
  user_name_last: String,
  email: String,
  user_level: String,
  del_flg: String,
  create_user: String,
  create_datetime: Date,
  update_user: String,
  update_datetime: Date,
  team_name: String,
});

// Create a team schema
const teamSchema = new mongoose.Schema({
  del_flg: String,
  team_name: String,
});

// Create a user model
const User = mongoose.model("User", userSchema);

// Create a team model
const Team = mongoose.model("Team", teamSchema);

// Create an Express app
const app = express();

// Middleware for JSON parsing
app.use(express.json());

// Use cors middleware
app.use(cors()); // This will enable CORS for all routes

// Routes
app.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user" });
  }
});

app.post("/user", async (req, res) => {
  const userData = req.body;
  try {
    const newUser = await User.create(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    });
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      res.json(deletedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

app.get("/team", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
});

app.post("/team", async (req, res) => {
  const teamData = req.body;
  try {
    const newTeam = await Team.create(teamData);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: "Error creating team" });
  }
});

// Start the server
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
