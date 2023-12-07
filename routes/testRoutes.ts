import { Router } from "express";
import User from "../models/User"; // Import your model

const router = Router();

// Route to create a new user
router.post("/test/user", async (req, res) => {
  try {
    const newUser = new User({ name: "Test User", email: "test@example.com" });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all users
router.get("/test/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
