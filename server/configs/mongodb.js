import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected',()=> console.log("mongoDb connected"))
    mongoose.connection.on('error',()=> console.log("mongoDb connection error"))

    await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
    
}
export default connectDB