const express = require("express");
const fs = require("fs");
const app = express();

// Set view engine to EJS
app.set("view engine", "ejs");

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Function to read JSON file
function readJsonFile(filename) {
  try {
    const data = fs.readFileSync(filename, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return { users: [] }; // Return empty array if file read fails
  }
}

// Function to write JSON file
function writeJsonFile(filename, data) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data));
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}

// Render listUsers template
app.get("/", (req, res) => {
  res.redirect("/users");
});

app.get("/users", (req, res) => {
  const users = readJsonFile("api.json").users;
  res.render("listUsers", { data: users });
});

// Add new user
app.post("/users", (req, res) => {
  const users = readJsonFile("api.json").users;
  const newUser = {
    id: Date.now(),
    name: req.body.name,
    age: req.body.age,
    country: req.body.country,
  };
  users.push(newUser);
  writeJsonFile("api.json", { users });
  res.redirect("/users");
});

// Delete user
app.get("/delUser/:id", (req, res) => {
  const users = readJsonFile("api.json").users;
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send("User not found");
  users.splice(userIndex, 1);
  writeJsonFile("api.json", { users });
  res.redirect("/users");
});

// Render editUser template
app.get("/editUser/:id", (req, res) => {
  const users = readJsonFile("api.json").users;
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send("User not found");
  res.render("editUser", { data: users, userData: user });
});

// Update user
app.post("/editUser/:id", (req, res) => {
  const users = readJsonFile("api.json").users;
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send("User not found");
  Object.assign(user, req.body);
  writeJsonFile("api.json", { users });
  res.redirect("/users");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
