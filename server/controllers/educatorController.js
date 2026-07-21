import { clerkClient, getAuth } from '@clerk/express'
import Course from '../models/course.js';
import { v2 as cloudinary } from 'cloudinary';

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

//add new course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const userId = getAuth(req).userId

        if (!imageFile) {
            return res.json({
                success: false,
                message: "Thumbnail image is required"
            })
        }

        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = userId
        
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            parsedCourseData.courseThumbnail = imageUpload.secure_url;
        } catch (err) {
            console.error("Cloudinary Error:", err);

            return res.json({
                success: false,
                message: err.message,
                http_code: err.http_code,
                error: err.error
            });
        }

        const newCourse = await Course.create(parsedCourseData)

        res.json({
            success: true,
            message: "Course added successfully",
            course: newCourse
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

