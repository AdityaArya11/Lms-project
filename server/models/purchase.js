import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    userId: { type: String },
    userID: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
