import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Employee"], default: "Employee" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
