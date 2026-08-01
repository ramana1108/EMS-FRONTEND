import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["Urgent", "Holiday", "Event", "Policy"], default: "Policy" },
    date: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Notice", noticeSchema);
