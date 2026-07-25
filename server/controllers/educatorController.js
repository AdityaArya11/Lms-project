import { clerkClient, getAuth } from '@clerk/express';
import Course from '../models/course.js';
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from '../models/purchase.js';
import User from '../models/user.js';

// Update user role to Educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const auth = getAuth(req);
        const userId = auth.userId;

        if (!userId) {
            return res.json({
                success: false,
                message: "Unauthorized access: Please provide a valid 'Authorization: Bearer <token>' header"
            });
        }

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
            status: { $in: ['completed', 'success'] }
        });

        let totalEarnings = purchases.reduce((total, purchase) => total + (Number(purchase.amount) || 0), 0);

        // Fallback: If no purchases exist in purchase table, calculate from course enrolledStudents
        if (totalEarnings === 0) {
            courses.forEach(course => {
                const studentCount = course.enrolledStudents ? course.enrolledStudents.length : 0;
                const discountedPrice = course.coursePrice - (course.coursePrice * (course.discount || 0) / 100);
                totalEarnings += studentCount * discountedPrice;
            });
        }
        totalEarnings = Math.floor(totalEarnings);

        const enrolledStudentsData = [];
        for (const course of courses) {
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                const students = await User.find(
                    { _id: { $in: course.enrolledStudents } },
                    'name imageUrl imageURL'
                );
                students.forEach(student => {
                    enrolledStudentsData.push({
                        courseTitle: course.courseTitle,
                        student: {
                            _id: student._id,
                            name: student.name || 'Student',
                            imageUrl: student.imageUrl || student.imageURL || ''
                        }
                    });
                });
            }
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
            status: { $in: ['completed', 'success'] }
        }).populate('userID', 'name imageUrl imageURL').populate('courseID', 'courseTitle');

        const enrolledStudents = [];

        for (const purchase of purchases) {
            if (purchase.userID) {
                let sName = purchase.userID.name;
                let sImg = purchase.userID.imageUrl || purchase.userID.imageURL;
                const sId = purchase.userID._id ? purchase.userID._id.toString() : purchase.userID.toString();

                if (!sName || sName === 'Student' || !sImg) {
                    try {
                        const clerkUser = await clerkClient.users.getUser(sId);
                        const fName = clerkUser.firstName || '';
                        const lName = clerkUser.lastName || '';
                        sName = (fName + ' ' + lName).trim() || clerkUser.username || 'Student';
                        sImg = clerkUser.imageUrl || '';
                        await User.findByIdAndUpdate(sId, { name: sName, imageUrl: sImg, imageURL: sImg });
                    } catch (e) {}
                }

                enrolledStudents.push({
                    student: {
                        _id: sId,
                        name: sName || 'Student',
                        imageUrl: sImg || ''
                    },
                    courseTitle: purchase.courseID ? purchase.courseID.courseTitle : 'Course',
                    purchaseDate: purchase.createdAt
                });
            }
        }

        // Also include direct enrolledStudents from courses
        for (const course of courses) {
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                for (const studentId of course.enrolledStudents) {
                    const studentIdStr = studentId.toString();
                    const alreadyAdded = enrolledStudents.some(
                        e => (e.student?._id?.toString() === studentIdStr) && e.courseTitle === course.courseTitle
                    );

                    if (!alreadyAdded) {
                        let userDoc = await User.findById(studentIdStr);
                        let sName = userDoc?.name;
                        let sImg = userDoc?.imageUrl || userDoc?.imageURL;

                        if (!userDoc || !sName || sName === 'Student' || !sImg) {
                            try {
                                const clerkUser = await clerkClient.users.getUser(studentIdStr);
                                const fName = clerkUser.firstName || '';
                                const lName = clerkUser.lastName || '';
                                sName = (fName + ' ' + lName).trim() || clerkUser.username || 'Student';
                                sImg = clerkUser.imageUrl || '';
                                if (!userDoc) {
                                    userDoc = await User.create({
                                        _id: studentIdStr,
                                        name: sName,
                                        email: clerkUser.emailAddresses[0]?.emailAddress || '',
                                        imageUrl: sImg,
                                        imageURL: sImg,
                                        enrolledCourses: [course._id]
                                    });
                                } else {
                                    await User.findByIdAndUpdate(studentIdStr, { name: sName, imageUrl: sImg, imageURL: sImg });
                                }
                            } catch (err) {}
                        }

                        enrolledStudents.push({
                            student: {
                                _id: studentIdStr,
                                name: sName || 'Student',
                                imageUrl: sImg || ''
                            },
                            courseTitle: course.courseTitle,
                            purchaseDate: userDoc?.createdAt || course.createdAt
                        });
                    }
                }
            }
        }

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
