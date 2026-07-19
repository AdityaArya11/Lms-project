import { Webhook } from "svix";
import User from "../models/user.js";

//API controller fn to manage clerk user with database
const clerkWebhook = async (req, res) => {
    try {
        if (!process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SECRET === 'placeholder') {
            console.warn("CLERK_WEBHOOK_SECRET is not set. Bypassing verification.");
            return res.json({ success: true, message: "Webhook secret missing, bypassed verification." });
        }

        const whInstance = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        
        whInstance.verify(JSON.stringify(req.body), {
            'svix-signature': req.headers['svix-signature'],
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp']
        })

        const { data, type } = req.body
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageURL: data.image_url
                }
                await User.create(userData)
                res.json({ success: true })
                break
            }
            case 'user.updated': {
                const userData = {
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageURL: data.image_url
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({ success: true })
                break
            }
            case 'user.deleted':
                await User.findByIdAndDelete(data.id)
                res.json({ success: true })
                break
            default:
                res.json({ success: true })
                break
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export default clerkWebhook