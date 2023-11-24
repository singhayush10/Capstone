const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt"); // Install this package using npm install bcrypt

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "new_password",
  database: "captone",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the database");
  }
});

// Sign-up route
app.post("/signup", async (req, res) => {
    console.log("hitting api");
    const { name, email, password } = req.body;
  
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Perform the database insertion
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, results) => {
      if (err) {
        console.error("Error during sign-up:", err);
        console.error("SQL Query:", sql);
        console.error("Query Parameters:", [name, email, hashedPassword]);
        res.status(500).json({ success: false, message: "Sign-up failed" });
      } else {
        console.log("Sign-up successful. Rows affected:", results.affectedRows);
        res.json({ success: true, message: "Sign-up successful" });
      }
    });
  });

// Sign-in route
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Perform the database query
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Error during sign-in:", err);
        res.status(500).json({ success: false, message: "Sign-in failed" });
      } else {
        if (results.length > 0) {
          // Compare the provided password with the hashed password from the database
          const match = await bcrypt.compare(password, results[0].password);
          if (match) {
            res.json({ success: true, message: "Sign-in successful" });
          } else {
            res.json({ success: false, message: "Incorrect password" });
          }
        } else {
          res.json({ success: false, message: "User not found" });
        }
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
