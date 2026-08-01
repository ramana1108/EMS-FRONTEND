import express from "express";
import Notice from "../models/Notice.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const list = await Notice.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        console.error("Fetch notices error:", error);
        res.status(500).json({ message: "Server error retrieving notices list." });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const newNotice = new Notice({
            title,
            description,
            category,
            date: "Just now"
        });

        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (error) {
        console.error("Create notice error:", error);
        res.status(500).json({ message: "Server error occurred during notice creation." });
    }
});

export default router;
