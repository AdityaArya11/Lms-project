import { Webhook } from "svix";
import User from "../models/user.js";


//API controller fn to manage clerk user with database
const clerkWebhook = async (req,res)=>{
    try {
        const WEBHOOK_SECRET =new  Webhook(process.env.CLERK_WEBHOOK_SECRET)
        
        const payload = await webhook.verify(JSON.stringify(req.body),{
            'svix-signature':req.headers['svix-signature'],
            'svix-id':req.headers['svix-id'],
            'svix-timestamp':req.headers['svix-timestamp']
        })

        const {data ,type} = req.body
        switch(type){
            case 'user.created':{
                const userData = {
                    _id:data.id,
                    name: `${data.first_name ||''}${data.last_name || ''}`.trim(),
                    email:data.email_addresses[0].email_address,
                    imageURL:data.image_url
                }
                await User.create(userData)
                res.json({})
                break
            }
            case 'user.updated':{
                const userData={
                    name: `${data.first_name ||''}${data.last_name || ''}`.trim(),
                    email:data.email_addresses[0].email_address,
                    imageURL:data.image_url
                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break
            }
            case 'user.deleted':
                await User.findByIdAndDelete(data.id)
                res.json({})
                break}

                
    } catch (error) {

        res.json({success:false, message:error.message})
    }
}