import { clerkClient, getAuth } from '@clerk/express';
import Course from '../models/course.js';
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from '../models/purchase.js';
import User from '../models/user.js';

// Update user role to Educator
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
};

// Add new course

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const userId = getAuth(req).userId;

        if (!imageFile) {
            return res.json({
                success: false,
                message: "Thumbnail image is required"
            });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = userId;

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

        const newCourse = await Course.create(parsedCourseData);

        res.json({
            success: true,
            message: "Course added successfully",
            course: newCourse
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};
//dummy commit
// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const userId = getAuth(req).userId;
        const courses = await Course.find({ educator: userId });
        res.json({
            success: true,
            message: "Educator courses fetched successfully",
            courses
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get Educator Dashboard Data
export const getEducatorDashboardData = async (req, res) => {
    try {
        const userId = getAuth(req).userId;
        const courses = await Course.find({ educator: userId });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseID: { $in: courseIds },
            status: 'success'
        });

        const totalEarnings = purchases.reduce((total, purchase) => total + (purchase.amount || 0), 0);

        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                'name imageUrl imageURL'
            );
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student: {
                        _id: student._id,
                        name: student.name,
                        imageUrl: student.imageUrl || student.imageURL
                    }
                });
            });
        }

        res.json({
            success: true,
            message: "Educator dashboard data fetched successfully",
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const userId = getAuth(req).userId;
        const courses = await Course.find({ educator: userId });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseID: { $in: courseIds },
            status: 'success'
        }).populate('userID', 'name imageUrl imageURL').populate('courseID', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userID,
            courseTitle: purchase.courseID ? purchase.courseID.courseTitle : '',
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            message: "Enrolled students fetched successfully",
            enrolledStudents
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};
