import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
