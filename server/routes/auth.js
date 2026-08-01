import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const user = await User.findOne({ email: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            "ems_secret_key_12345",
            { expiresIn: "7d" }
        );

        res.json({
            token,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error occurred during sign in." });
    }
});

router.post("/register", async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName,
            role: role || "Employee"
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error occurred during registration." });
    }
});

export default router;
