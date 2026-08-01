import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const list = await Employee.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        console.error("Fetch employees error:", error);
        res.status(500).json({ message: "Server error retrieving employees list." });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, email, department, role, status, joiningDate, avatar } = req.body;
        if (!name || !email || !department || !role || !joiningDate) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const existing = await Employee.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: "An employee with this email already exists." });
        }

        // Auto-generate employee ID
        const count = await Employee.countDocuments();
        const nextNum = 1000 + count + 1;
        const empId = `EMP-${nextNum}`;

        const newEmp = new Employee({
            empId,
            name,
            email: email.toLowerCase(),
            department,
            role,
            status: status || "Active",
            joiningDate,
            avatar: avatar || `https://images.unsplash.com/photo-${1535713875002 + count % 1000}-d1d0cf377fde?w=100&h=100&fit=crop&q=80`
        });

        await newEmp.save();
        res.status(201).json(newEmp);
    } catch (error) {
        console.error("Create employee error:", error);
        res.status(500).json({ message: "Server error occurred during employee enrollment." });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { name, email, department, role, status, joiningDate, avatar } = req.body;
        const emp = await Employee.findById(req.params.id);
        if (!emp) {
            return res.status(404).json({ message: "Employee not found." });
        }

        if (email && email.toLowerCase() !== emp.email) {
            const emailDup = await Employee.findOne({ email: email.toLowerCase() });
            if (emailDup) {
                return res.status(400).json({ message: "An employee with this email already exists." });
            }
            emp.email = email.toLowerCase();
        }

        if (name) emp.name = name;
        if (department) emp.department = department;
        if (role) emp.role = role;
        if (status) emp.status = status;
        if (joiningDate) emp.joiningDate = joiningDate;
        if (avatar) emp.avatar = avatar;

        await emp.save();
        res.json(emp);
    } catch (error) {
        console.error("Update employee error:", error);
        res.status(500).json({ message: "Server error occurred during employee update." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const emp = await Employee.findByIdAndDelete(req.params.id);
        if (!emp) {
            return res.status(404).json({ message: "Employee not found." });
        }
        res.json({ message: "Employee record deleted successfully." });
    } catch (error) {
        console.error("Delete employee error:", error);
        res.status(500).json({ message: "Server error occurred during employee deletion." });
    }
});

export default router;
