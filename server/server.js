const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();

app.use(
  cors({
    origin: [
      "https://pragatainf236-studentmanagement.vercel.app",
      "https://pragata-inf236-studentmanagement.vercel.app",
    ],
  })
);

app.use(express.json());

let dbConnection;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnection) {
    dbConnection = mongoose.connect(process.env.MONGO_URI).catch((error) => {
      dbConnection = null;
      throw error;
    });
  }

  await dbConnection;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({ message: "Database connection failed." });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Student Management API is running!" });
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students." });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, course, age } = req.body;

    if (!name || !course || age === undefined || age === "") {
      return res.status(400).json({
        message: "Name, course, and age are required.",
      });
    }

    const newStudent = await Student.create({
      name,
      course,
      age: Number(age),
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const { name, course, age } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, course, age: Number(age) },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}