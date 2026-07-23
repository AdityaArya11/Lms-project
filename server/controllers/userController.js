import User from "../models/user.js";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import CourseProgress from "../models/courseProgress.js";
import Stripe from "stripe";
import { getAuth } from "@clerk/express";

export const getUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, userData: user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// User enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const userData = await User.findById(userId).populate('enrolledCourses');

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const { userId } = getAuth(req);

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' });
        }

        const purchaseData = {
            courseId: courseData._id,
            courseID: courseData._id,
            userId,
            userID: userId,
            amount: (courseData.coursePrice - (courseData.coursePrice * courseData.discount) / 100).toFixed(2),
            status: 'pending'
        };

        const newPurchase = await Purchase.create(purchaseData);

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = (process.env.CURRENCY || 'usd').toLowerCase();

        // Creating line items for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount * 100)
            },
            quantity: 1
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user course progress
export const updateCourseProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body;
        const { userId } = getAuth(req);

        const courseProgress = await CourseProgress.findOne({
            courseId,
            userId
        });

        if (courseProgress) {
            if (courseProgress.lectureCompleted.includes(lectureId)) {
                return res.json({ success: false, message: "Lecture already completed" });
            }
            courseProgress.lectureCompleted.push(lectureId);
            await courseProgress.save();
            return res.json({ success: true, message: "Lecture marked as completed", courseProgress });
        } else {
            const newCourseProgress = await CourseProgress.create({
                courseId,
                userId,
                lectureCompleted: [lectureId]
            });
            return res.json({ success: true, message: "Lecture marked as completed", courseProgress: newCourseProgress });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get user course progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { userId } = getAuth(req);

        const courseProgress = await CourseProgress.findOne({
            courseId,
            userId
        });

        if (!courseProgress) {
            return res.json({ success: false, message: "Course progress not found" });
        }

        res.json({ success: true, courseProgress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add User Rating to Course
export const addUserRating = async (req, res) => {
    const { userId } = getAuth(req);
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid Details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};