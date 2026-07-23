import mongoose from "mongoose";
import dns from "dns";

// Fix for Node.js querySrv ECONNREFUSED error on Windows / local network DNS
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
    console.log("DNS setServers warning:", error.message);
}

const connectDB = async () => {

    mongoose.connection.on('connected',()=> console.log("mongoDb connected"))
    mongoose.connection.on('error',(err)=> console.log("mongoDb connection error:", err))

    await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
    
}
export default connectDB