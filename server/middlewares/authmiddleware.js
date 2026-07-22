import { clerkClient, getAuth } from "@clerk/express";

// Middleware to protect user routes
export const protectUser = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized access"
            });
        }

        next();
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Middleware to protect educator routes
export const protectEducator = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized access"
            });
        }

        const user = await clerkClient.users.getUser(userId);

        if (user.publicMetadata.role !== 'educator') {
            return res.json({
                success: false,
                message: "Unauthorized access, only educators can perform this action"
            });
        }

        next();
    } catch (error) {
        console.error("Protect Educator Error:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
};