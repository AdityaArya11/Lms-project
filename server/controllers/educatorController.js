import { clerkClient, getAuth } from '@clerk/express'

export const updateRoleToEducator = async (req, res) => {
    try {
        const auth = getAuth(req);
        console.log("auth =", auth);

        const userId = auth.userId;

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        });

        res.json({
            success: true,
            message: "User role updated to educator"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}