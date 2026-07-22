import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imageURL: { type: String, default: '' },
    enrolledCourses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
    ]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
console.log("User imageUrl schema options:", User.schema.path("imageUrl").options);
export default User;
