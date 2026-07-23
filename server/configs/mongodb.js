import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("mongoDb connected"));
        mongoose.connection.on('error', (err) => console.log("mongoDb connection error:", err.message));

        await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
    }
};

export default connectDB;