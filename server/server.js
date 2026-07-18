import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import clerkWebhook from './controllers/webhooks.js'
//Intitialize express

const app = express()


// connect to database

await connectDB()
//middle wares
app.use(cors())

//routes 
app.get('/',(req,res)=> res.send("api working "))
app.post('/clerk',express.json(),clerkWebhook)

//port 
const PORT = process.env.PORT || 5001
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    
})

