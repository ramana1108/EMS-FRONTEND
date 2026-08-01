import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    empId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" },
    joiningDate: { type: String, required: true },
    avatar: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
